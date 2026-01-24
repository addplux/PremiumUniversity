import { useState } from 'react';
import axios from 'axios';
import './MobileMoneyPayment.css';

const MobileMoneyPayment = ({ amount, currency = 'ZMW', studentFeeId, description, onSuccess, onError }) => {
    const [provider, setProvider] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState('input'); // input, processing, success
    const [paymentReference, setPaymentReference] = useState('');

    const providers = [
        {
            id: 'mpesa',
            name: 'M-Pesa',
            icon: '📱',
            bg: '#43b02a',
            color: '#fff',
            countries: ['KE', 'TZ', 'CD', 'LS', 'MZ', 'GH', 'EG']
        },
        {
            id: 'airtel_money',
            name: 'Airtel Money',
            icon: '🔴',
            bg: '#e60000',
            color: '#fff',
            countries: ['ZM', 'KE', 'UG', 'TZ', 'MW', 'RW']
        },
        {
            id: 'mtn_money',
            name: 'MTN MoMo',
            icon: '🟡',
            bg: '#ffcc00',
            color: '#000',
            countries: ['ZM', 'GH', 'UG', 'RW', 'CM', 'CI']
        },
        {
            id: 'zamtel_money',
            name: 'Zamtel Money',
            icon: '🟢',
            bg: '#009639',
            color: '#fff',
            countries: ['ZM']
        }
    ];

    const handlePayment = async () => {
        if (!provider || !phoneNumber) {
            if (onError) onError('Please select a provider and enter phone number');
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post('/payments/mobile-money/initiate', {
                provider,
                phoneNumber,
                amount,
                currency,
                studentFeeId,
                description
            });

            if (response.data.success) {
                setStep('processing');
                setPaymentReference(response.data.reference);

                // Poll for payment status
                pollPaymentStatus(response.data.paymentId);
            } else {
                if (onError) onError(response.data.message);
                setLoading(false);
            }
        } catch (error) {
            console.error('Payment initiation error:', error);
            if (onError) onError(error.response?.data?.message || 'Payment initiation failed');
            setLoading(false);
        }
    };

    const pollPaymentStatus = async (paymentId) => {
        const maxAttempts = 120; // 2 minutes (1 attempt per second)
        let attempts = 0;

        const interval = setInterval(async () => {
            attempts++;

            try {
                const response = await axios.get(`/payments/status/${paymentId}`);
                const status = response.data.status;

                if (status === 'completed') {
                    clearInterval(interval);
                    setStep('success');
                    setLoading(false);
                    if (onSuccess) onSuccess(response.data);
                } else if (status === 'failed' || status === 'cancelled') {
                    clearInterval(interval);
                    setLoading(false);
                    setStep('input');
                    if (onError) onError('Payment failed or was cancelled');
                } else if (attempts >= maxAttempts) {
                    clearInterval(interval);
                    setLoading(false);
                    if (onError) onError('Payment timeout - check your phone or try again');
                }
                // If pending/processing, continue polling
            } catch (error) {
                // Prepare for retries on error but don't stop immediately unless max attempts reached
                if (attempts >= maxAttempts) {
                    clearInterval(interval);
                    setLoading(false);
                    if (onError) onError('Failed to verify payment status');
                }
            }
        }, 1000);
    };

    if (step === 'success') {
        return (
            <div className="mobile-payment-success">
                <div className="success-icon">✅</div>
                <h3>Payment Successful!</h3>
                <p>Your payment of {currency} {amount.toLocaleString()} has been received.</p>
                <p className="reference">Ref: {paymentReference}</p>
                <button className="btn-primary" onClick={() => window.location.reload()}>Close</button>
            </div>
        );
    }

    if (step === 'processing') {
        return (
            <div className="mobile-payment-processing">
                <div className="processing-spinner"></div>
                <h3>Check Your Phone</h3>
                <p>We've sent a payment prompt to <strong>{phoneNumber}</strong></p>
                <p>Please enter your PIN to complete the transaction.</p>
                <div className="processing-note">
                    <small>Waiting for confirmation...</small>
                </div>
            </div>
        );
    }

    return (
        <div className="mobile-money-payment">
            <h3>Pay with Mobile Money</h3>

            <div className="amount-display">
                <span className="label">Amount to Pay</span>
                <span className="value">{currency} {amount.toLocaleString()}</span>
            </div>

            <div className="provider-selection">
                <h4>Select Provider</h4>
                <div className="providers-grid">
                    {providers.map(p => (
                        <button
                            key={p.id}
                            className={`provider-btn ${provider === p.id ? 'active' : ''}`}
                            onClick={() => setProvider(p.id)}
                            style={{
                                '--provider-bg': p.bg,
                                '--provider-color': p.color
                            }}
                        >
                            <span className="provider-icon">{p.icon}</span>
                            <span className="provider-name">{p.name}</span>
                            {provider === p.id && <span className="check-mark">✓</span>}
                        </button>
                    ))}
                </div>
            </div>

            <div className="phone-input-section">
                <label htmlFor="phoneNumber">Phone Number</label>
                <div className="phone-input-wrapper">
                    <span className="country-code">+260</span>
                    <input
                        id="phoneNumber"
                        type="tel"
                        placeholder="977 123 456"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                        disabled={loading}
                    />
                </div>
                <small>Enter the number registered with mobile money</small>
            </div>

            <button
                className="pay-button"
                onClick={handlePayment}
                disabled={loading || !provider || !phoneNumber || phoneNumber.length < 9}
            >
                {loading ? 'Processing...' : `Pay ${currency} ${amount.toLocaleString()}`}
            </button>

            <div className="secure-badge">
                🔒 Secure Mobile Payment
            </div>
        </div>
    );
};

export default MobileMoneyPayment;
