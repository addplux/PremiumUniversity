const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true,
        index: true
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    studentFeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'StudentFee'
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    currency: {
        type: String,
        default: 'ZMW',
        enum: ['ZMW', 'KES', 'TZS', 'UGX', 'NGN', 'GHS', 'ZAR', 'USD']
    },
    paymentMethod: {
        type: String,
        enum: [
            'cash',
            'bank_transfer',
            'card',
            'mpesa',
            'airtel_money',
            'mtn_money',
            'zamtel_money',
            'other'
        ],
        required: true
    },

    // Mobile money specific fields
    mobileMoneyDetails: {
        phoneNumber: String,
        transactionId: String, // Provider's transaction ID
        provider: String, // 'mpesa', 'airtel', 'mtn', 'zamtel'
        reference: String, // Our internal reference
        checkoutRequestID: String, // For M-Pesa STK Push
        merchantRequestID: String // For M-Pesa STK Push
    },

    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'],
        default: 'pending'
    },

    // Gateway/Provider response data
    gatewayResponse: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },

    // Webhook data from payment provider
    webhookData: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },

    // Payment metadata
    description: String,
    receiptNumber: String,

    // Timestamps
    paidAt: Date,
    failedAt: Date,
    cancelledAt: Date,

    // Admin fields
    recordedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    notes: String
}, {
    timestamps: true
});

// Indexes for efficient queries
paymentSchema.index({ organizationId: 1, studentId: 1 });
paymentSchema.index({ organizationId: 1, status: 1 });
paymentSchema.index({ 'mobileMoneyDetails.transactionId': 1 });
paymentSchema.index({ 'mobileMoneyDetails.reference': 1 });
paymentSchema.index({ createdAt: -1 });

// Virtual for payment provider name
paymentSchema.virtual('providerName').get(function () {
    const providers = {
        'mpesa': 'M-Pesa',
        'airtel_money': 'Airtel Money',
        'mtn_money': 'MTN Mobile Money',
        'zamtel_money': 'Zamtel Money'
    };
    return providers[this.paymentMethod] || this.paymentMethod;
});

module.exports = mongoose.model('Payment', paymentSchema);
