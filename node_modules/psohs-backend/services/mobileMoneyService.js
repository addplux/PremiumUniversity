const axios = require('axios');
const crypto = require('crypto');

/**
 * Mobile Money Service
 * Handles integrations with African mobile money providers
 */
class MobileMoneyService {
    constructor() {
        this.providers = {
            mpesa: {
                baseUrl: process.env.MPESA_API_URL || 'https://sandbox.safaricom.co.ke',
                consumerKey: process.env.MPESA_CONSUMER_KEY,
                consumerSecret: process.env.MPESA_CONSUMER_SECRET,
                shortcode: process.env.MPESA_SHORTCODE,
                passkey: process.env.MPESA_PASSKEY,
                callbackUrl: `${process.env.API_URL}/api/payments/mpesa/callback`
            },
            airtel: {
                baseUrl: process.env.AIRTEL_API_URL || 'https://openapiuat.airtel.africa',
                clientId: process.env.AIRTEL_CLIENT_ID,
                clientSecret: process.env.AIRTEL_CLIENT_SECRET,
                callbackUrl: `${process.env.API_URL}/api/payments/airtel/callback`
            },
            mtn: {
                baseUrl: process.env.MTN_API_URL || 'https://sandbox.momodeveloper.mtn.com',
                apiKey: process.env.MTN_API_KEY,
                apiSecret: process.env.MTN_API_SECRET,
                subscriptionKey: process.env.MTN_SUBSCRIPTION_KEY,
                environment: process.env.MTN_ENVIRONMENT || 'sandbox'
            }
        };
    }

    /**
     * M-Pesa STK Push (Lipa Na M-Pesa)
     * Initiates payment request to customer's phone
     */
    async initiateMpesaPayment(phoneNumber, amount, reference, accountNumber) {
        try {
            const token = await this.getMpesaToken();
            const timestamp = this.getTimestamp();
            const password = this.generateMpesaPassword(timestamp);

            // Format phone number (remove leading 0, add 254)
            const formattedPhone = this.formatKenyanPhone(phoneNumber);

            const response = await axios.post(
                `${this.providers.mpesa.baseUrl}/mpesa/stkpush/v1/processrequest`,
                {
                    BusinessShortCode: this.providers.mpesa.shortcode,
                    Password: password,
                    Timestamp: timestamp,
                    TransactionType: 'CustomerPayBillOnline',
                    Amount: Math.round(amount),
                    PartyA: formattedPhone,
                    PartyB: this.providers.mpesa.shortcode,
                    PhoneNumber: formattedPhone,
                    CallBackURL: this.providers.mpesa.callbackUrl,
                    AccountReference: accountNumber || reference,
                    TransactionDesc: `School Fees Payment - ${reference}`
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('✅ M-Pesa STK Push initiated:', response.data);

            return {
                success: true,
                provider: 'mpesa',
                checkoutRequestID: response.data.CheckoutRequestID,
                merchantRequestID: response.data.MerchantRequestID,
                responseCode: response.data.ResponseCode,
                responseDescription: response.data.ResponseDescription,
                customerMessage: response.data.CustomerMessage
            };
        } catch (error) {
            console.error('❌ M-Pesa payment error:', error.response?.data || error.message);
            return {
                success: false,
                provider: 'mpesa',
                error: error.response?.data || error.message
            };
        }
    }

    /**
     * Airtel Money Payment
     */
    async initiateAirtelPayment(phoneNumber, amount, reference) {
        try {
            const token = await this.getAirtelToken();

            // Format phone number for Zambia (260...)
            const formattedPhone = this.formatZambianPhone(phoneNumber);

            const response = await axios.post(
                `${this.providers.airtel.baseUrl}/merchant/v1/payments/`,
                {
                    reference: reference,
                    subscriber: {
                        country: 'ZM',
                        currency: 'ZMW',
                        msisdn: formattedPhone
                    },
                    transaction: {
                        amount: Math.round(amount),
                        country: 'ZM',
                        currency: 'ZMW',
                        id: reference
                    }
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        'X-Country': 'ZM',
                        'X-Currency': 'ZMW'
                    }
                }
            );

            console.log('✅ Airtel Money payment initiated:', response.data);

            return {
                success: true,
                provider: 'airtel',
                transactionId: response.data.data?.transaction?.id,
                status: response.data.data?.transaction?.status,
                message: response.data.data?.transaction?.message
            };
        } catch (error) {
            console.error('❌ Airtel Money payment error:', error.response?.data || error.message);
            return {
                success: false,
                provider: 'airtel',
                error: error.response?.data || error.message
            };
        }
    }

    /**
     * MTN Mobile Money Payment
     */
    async initiateMTNPayment(phoneNumber, amount, reference) {
        try {
            const token = await this.getMTNToken();
            const referenceId = this.generateUUID();

            // Format phone number
            const formattedPhone = this.formatZambianPhone(phoneNumber);

            const response = await axios.post(
                `${this.providers.mtn.baseUrl}/collection/v1_0/requesttopay`,
                {
                    amount: amount.toString(),
                    currency: 'ZMW',
                    externalId: reference,
                    payer: {
                        partyIdType: 'MSISDN',
                        partyId: formattedPhone
                    },
                    payerMessage: 'School Fees Payment',
                    payeeNote: `Payment for ${reference}`
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'X-Reference-Id': referenceId,
                        'X-Target-Environment': this.providers.mtn.environment,
                        'Content-Type': 'application/json',
                        'Ocp-Apim-Subscription-Key': this.providers.mtn.subscriptionKey
                    }
                }
            );

            console.log('✅ MTN Mobile Money payment initiated');

            return {
                success: true,
                provider: 'mtn',
                referenceId: referenceId,
                status: 'PENDING',
                message: 'Payment request sent to customer'
            };
        } catch (error) {
            console.error('❌ MTN Mobile Money payment error:', error.response?.data || error.message);
            return {
                success: false,
                provider: 'mtn',
                error: error.response?.data || error.message
            };
        }
    }

    /**
     * Verify M-Pesa payment status
     */
    async verifyMpesaPayment(checkoutRequestID) {
        try {
            const token = await this.getMpesaToken();
            const timestamp = this.getTimestamp();
            const password = this.generateMpesaPassword(timestamp);

            const response = await axios.post(
                `${this.providers.mpesa.baseUrl}/mpesa/stkpushquery/v1/query`,
                {
                    BusinessShortCode: this.providers.mpesa.shortcode,
                    Password: password,
                    Timestamp: timestamp,
                    CheckoutRequestID: checkoutRequestID
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return {
                success: true,
                status: response.data.ResultCode === '0' ? 'completed' : 'failed',
                data: response.data
            };
        } catch (error) {
            console.error('❌ M-Pesa verification error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data || error.message
            };
        }
    }

    /**
     * Verify Airtel Money payment status
     */
    async verifyAirtelPayment(transactionId) {
        try {
            const token = await this.getAirtelToken();

            const response = await axios.get(
                `${this.providers.airtel.baseUrl}/standard/v1/payments/${transactionId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        'X-Country': 'ZM',
                        'X-Currency': 'ZMW'
                    }
                }
            );

            return {
                success: true,
                status: response.data.data?.transaction?.status === 'TS' ? 'completed' : 'pending',
                data: response.data
            };
        } catch (error) {
            console.error('❌ Airtel verification error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data || error.message
            };
        }
    }

    /**
     * Get M-Pesa OAuth token
     */
    async getMpesaToken() {
        const auth = Buffer.from(
            `${this.providers.mpesa.consumerKey}:${this.providers.mpesa.consumerSecret}`
        ).toString('base64');

        const response = await axios.get(
            `${this.providers.mpesa.baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
            {
                headers: { 'Authorization': `Basic ${auth}` }
            }
        );

        return response.data.access_token;
    }

    /**
     * Get Airtel Money OAuth token
     */
    async getAirtelToken() {
        const response = await axios.post(
            `${this.providers.airtel.baseUrl}/auth/oauth2/token`,
            {
                client_id: this.providers.airtel.clientId,
                client_secret: this.providers.airtel.clientSecret,
                grant_type: 'client_credentials'
            },
            {
                headers: { 'Content-Type': 'application/json' }
            }
        );

        return response.data.access_token;
    }

    /**
     * Get MTN OAuth token
     */
    async getMTNToken() {
        const response = await axios.post(
            `${this.providers.mtn.baseUrl}/collection/token/`,
            {},
            {
                headers: {
                    'Authorization': `Basic ${Buffer.from(`${this.providers.mtn.apiKey}:${this.providers.mtn.apiSecret}`).toString('base64')}`,
                    'Ocp-Apim-Subscription-Key': this.providers.mtn.subscriptionKey
                }
            }
        );

        return response.data.access_token;
    }

    /**
     * Generate M-Pesa password
     */
    generateMpesaPassword(timestamp) {
        const password = Buffer.from(
            `${this.providers.mpesa.shortcode}${this.providers.mpesa.passkey}${timestamp}`
        ).toString('base64');
        return password;
    }

    /**
     * Get timestamp in M-Pesa format (YYYYMMDDHHmmss)
     */
    getTimestamp() {
        const date = new Date();
        return date.getFullYear() +
            ('0' + (date.getMonth() + 1)).slice(-2) +
            ('0' + date.getDate()).slice(-2) +
            ('0' + date.getHours()).slice(-2) +
            ('0' + date.getMinutes()).slice(-2) +
            ('0' + date.getSeconds()).slice(-2);
    }

    /**
     * Format Kenyan phone number (254...)
     */
    formatKenyanPhone(phone) {
        // Remove spaces, dashes, plus
        phone = phone.replace(/[\s\-\+]/g, '');

        // If starts with 0, replace with 254
        if (phone.startsWith('0')) {
            return '254' + phone.substring(1);
        }

        // If starts with 254, return as is
        if (phone.startsWith('254')) {
            return phone;
        }

        // Otherwise, add 254
        return '254' + phone;
    }

    /**
     * Format Zambian phone number (260...)
     */
    formatZambianPhone(phone) {
        phone = phone.replace(/[\s\-\+]/g, '');

        if (phone.startsWith('0')) {
            return '260' + phone.substring(1);
        }

        if (phone.startsWith('260')) {
            return phone;
        }

        return '260' + phone;
    }

    /**
     * Generate UUID for MTN
     */
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
}

module.exports = new MobileMoneyService();
