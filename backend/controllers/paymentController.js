const Payment = require('../models/Payment');
const User = require('../models/User');
const StudentFee = require('../models/StudentFee');
const mobileMoneyService = require('../services/mobileMoneyService');
const notificationService = require('../services/notificationService');
const { v4: uuidv4 } = require('uuid');

/**
 * Initiate mobile money payment
 * @route POST /api/payments/mobile-money/initiate
 */
exports.initiateMobilePayment = async (req, res) => {
    try {
        const { provider, phoneNumber, amount, currency, studentFeeId, description } = req.body;

        // Validate request
        if (!provider || !phoneNumber || !amount) {
            return res.status(400).json({
                success: false,
                message: 'Provider, phone number, and amount are required'
            });
        }

        // Generate unique reference
        const reference = `PAY-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        // Create pending payment record
        const payment = await Payment.create({
            organizationId: req.organizationId,
            studentId: req.user.id,
            studentFeeId: studentFeeId || null,
            amount,
            currency: currency || 'ZMW',
            paymentMethod: provider,
            status: 'pending',
            description: description || 'Mobile Money Payment',
            mobileMoneyDetails: {
                provider,
                phoneNumber,
                reference
            }
        });

        // Initiate payment with provider
        let result;

        switch (provider) {
            case 'mpesa':
                result = await mobileMoneyService.initiateMpesaPayment(
                    phoneNumber,
                    amount,
                    reference,
                    payment._id.toString()
                );
                break;
            case 'airtel_money':
                result = await mobileMoneyService.initiateAirtelPayment(
                    phoneNumber,
                    amount,
                    reference
                );
                break;
            case 'mtn_money':
                result = await mobileMoneyService.initiateMTNPayment(
                    phoneNumber,
                    amount,
                    reference
                );
                break;
            default:
                return res.status(400).json({
                    success: false,
                    message: 'Invalid payment provider'
                });
        }

        // Update payment record with provider details
        if (result.success) {
            payment.status = 'processing';
            payment.mobileMoneyDetails.checkoutRequestID = result.checkoutRequestID;
            payment.mobileMoneyDetails.merchantRequestID = result.merchantRequestID;
            payment.mobileMoneyDetails.transactionId = result.transactionId;
            payment.gatewayResponse = result;
            await payment.save();

            return res.status(200).json({
                success: true,
                message: 'Payment initiated successfully',
                paymentId: payment._id,
                reference: reference,
                providerResponse: result
            });
        } else {
            payment.status = 'failed';
            payment.notes = result.error || 'Provider initiation failed';
            payment.failedAt = Date.now();
            await payment.save();

            return res.status(400).json({
                success: false,
                message: 'Failed to initiate payment',
                error: result.error
            });
        }
    } catch (error) {
        console.error('Mobile payment initiation error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error initiating payment',
            error: error.message
        });
    }
};

/**
 * M-Pesa Callback (Webhook)
 * @route POST /api/payments/mpesa/callback
 */
exports.mpesaCallback = async (req, res) => {
    try {
        const { Body } = req.body;

        if (!Body || !Body.stkCallback) {
            return res.status(400).json({ message: 'Invalid callback data' });
        }

        const {
            MerchantRequestID,
            CheckoutRequestID,
            ResultCode,
            ResultDesc,
            CallbackMetadata
        } = Body.stkCallback;

        // Find payment by request IDs
        const payment = await Payment.findOne({
            'mobileMoneyDetails.checkoutRequestID': CheckoutRequestID
        });

        if (!payment) {
            console.error(`Payment not found for CheckoutRequestID: ${CheckoutRequestID}`);
            return res.status(404).json({ message: 'Payment record not found' });
        }

        // Update payment status
        payment.webhookData = req.body;

        if (ResultCode === 0) {
            // Success
            payment.status = 'completed';
            payment.paidAt = Date.now();
            payment.notes = 'Payment confirmed via callback';

            // Extract transaction ID from metadata if available
            if (CallbackMetadata && CallbackMetadata.Item) {
                const receiptItem = CallbackMetadata.Item.find(item => item.Name === 'MpesaReceiptNumber');
                if (receiptItem) {
                    payment.mobileMoneyDetails.transactionId = receiptItem.Value;
                    payment.receiptNumber = receiptItem.Value;
                }
            }

            // Update student fee record if linked (optional implementation logic)
            if (payment.studentFeeId) {
                // Update fee balance...
            }
        } else {
            // Failed (User cancelled, insufficient funds, etc.)
            payment.status = 'failed';
            payment.failedAt = Date.now();
            payment.notes = ResultDesc || 'Payment failed';
        }

        await payment.save();

        res.status(200).json({ message: 'Callback processed successfully' });
    } catch (error) {
        console.error('M-Pesa callback processing error:', error);
        res.status(500).json({ message: 'Error processing callback' });
    }
};

/**
 * Airtel Money Callback (Webhook)
 * @route POST /api/payments/airtel/callback
 */
exports.airtelCallback = async (req, res) => {
    try {
        const { transaction } = req.body;

        if (!transaction || !transaction.id) {
            return res.status(400).json({ message: 'Invalid callback data' });
        }

        const payment = await Payment.findOne({
            'mobileMoneyDetails.reference': transaction.id
        });

        if (!payment) {
            return res.status(404).json({ message: 'Payment record not found' });
        }

        payment.webhookData = req.body;

        if (transaction.status_code === 'TS') {
            payment.status = 'completed';
            payment.paidAt = Date.now();
            payment.mobileMoneyDetails.transactionId = transaction.airtel_money_id;
            payment.receiptNumber = transaction.airtel_money_id;
        } else if (transaction.status_code === 'TF') {
            payment.status = 'failed';
            payment.failedAt = Date.now();
            payment.notes = transaction.message || 'Payment failed';
        }

        await payment.save();
        res.status(200).json({ message: 'Callback processed' });
    } catch (error) {
        console.error('Airtel callback error:', error);
        res.status(500).json({ message: 'Error processing callback' });
    }
};

/**
 * Get Payment Status
 * @route GET /api/payments/status/:id
 */
exports.getPaymentStatus = async (req, res) => {
    try {
        const payment = await Payment.findOne({
            organizationId: req.organizationId,
            _id: req.params.id,
            studentId: req.user.id
        });

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }

        // Check with provider if still pending
        if (payment.status === 'processing' || payment.status === 'pending') {
            const provider = payment.paymentMethod;
            let verifyResult;

            try {
                if (provider === 'mpesa' && payment.mobileMoneyDetails.checkoutRequestID) {
                    verifyResult = await mobileMoneyService.verifyMpesaPayment(payment.mobileMoneyDetails.checkoutRequestID);
                } else if (provider === 'airtel_money' && payment.mobileMoneyDetails.reference) {
                    verifyResult = await mobileMoneyService.verifyAirtelPayment(payment.mobileMoneyDetails.reference);
                }

                if (verifyResult && verifyResult.success && verifyResult.status === 'completed') {
                    payment.status = 'completed';
                    payment.paidAt = Date.now();
                    await payment.save();
                } else if (verifyResult && verifyResult.success && verifyResult.status === 'failed') {
                    payment.status = 'failed';
                    payment.failedAt = Date.now();
                    await payment.save();
                }
            } catch (err) {
                console.error('Auto-verification failed:', err.message);
            }
        }

        res.status(200).json({
            success: true,
            status: payment.status,
            amount: payment.amount,
            currency: payment.currency,
            method: payment.paymentMethod,
            date: payment.createdAt,
            reference: payment.mobileMoneyDetails.reference
        });
    } catch (error) {
        console.error('Get payment status error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

/**
 * List Student Payments
 * @route GET /api/payments/my-payments
 */
exports.getMyPayments = async (req, res) => {
    try {
        const payments = await Payment.find({
            organizationId: req.organizationId,
            studentId: req.user.id
        })
            .sort({ createdAt: -1 })
            .limit(50);

        res.status(200).json({
            success: true,
            count: payments.length,
            data: payments
        });
    } catch (error) {
        console.error('Get payments error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
