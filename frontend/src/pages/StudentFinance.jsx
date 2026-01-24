import { useState, useEffect } from 'react';
import axios from 'axios';
import MobileMoneyPayment from '../components/MobileMoneyPayment';
import '../pages/ApplicationsManager.css';

const StudentFinance = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showPaymentForm, setShowPaymentForm] = useState(false);

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        try {
            // Use the new payment controller endpoint
            const res = await axios.get('/payments/my-payments');
            if (res.data.success) {
                setPayments(res.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch financial history:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentSuccess = () => {
        setShowPaymentForm(false);
        fetchPayments(); // Refresh list
    };

    const totalPaid = payments.reduce((acc, curr) => acc + curr.amount, 0);

    return (
        <div className="apps-manager">
            <div className="manager-header">
                <h1>Financial Statements</h1>
                <button
                    className="btn-primary"
                    onClick={() => setShowPaymentForm(!showPaymentForm)}
                    style={{ padding: '0.75rem 1.5rem' }}
                >
                    {showPaymentForm ? 'Cancel Payment' : 'Make New Payment'}
                </button>
            </div>

            <div style={{ padding: '1.5rem' }}>
                {showPaymentForm && (
                    <div style={{ marginBottom: '2rem' }}>
                        <MobileMoneyPayment
                            amount={1500} // Default amount, could be dynamic
                            currency="ZMW"
                            description="Tuition Fee Payment"
                            onSuccess={handlePaymentSuccess}
                            onError={(msg) => alert(msg)}
                        />
                    </div>
                )}

                <div style={{ background: 'linear-gradient(135deg, #1e40af 0%, #1a56db 100%)', color: 'white', padding: '2rem', borderRadius: '12px', marginBottom: '2rem' }}>
                    <p style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>Total Amount Paid</p>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: '700' }}>ZMW {totalPaid.toLocaleString()}</h2>
                    <p style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '1rem' }}>
                        Last payment: {payments.length > 0 ? new Date(payments[0].createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                </div>

                <h3>Payment History</h3>
                <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px 0 rgba(0,0,0,0.1)', overflow: 'hidden', marginTop: '1rem' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <tr>
                                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', color: '#64748b' }}>DATE</th>
                                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', color: '#64748b' }}>DESCRIPTION</th>
                                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', color: '#64748b' }}>METHOD</th>
                                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', color: '#64748b' }}>STATUS</th>
                                <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.75rem', color: '#64748b' }}>AMOUNT</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center' }}>Loading your financial records...</td></tr>
                            ) : payments.length === 0 ? (
                                <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center' }}>No payments found in your history.</td></tr>
                            ) : payments.map(p => (
                                <tr key={p._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{new Date(p.createdAt).toLocaleDateString()}</td>
                                    <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                                        <div style={{ fontWeight: '500' }}>{p.description || 'Tuition Payment'}</div>
                                        <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>
                                            REF: {p.mobileMoneyDetails?.reference || p.reference || p._id}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                                        {p.paymentMethod === 'mpesa' ? 'M-Pesa' :
                                            p.paymentMethod === 'airtel_money' ? 'Airtel Money' :
                                                p.paymentMethod === 'mtn_money' ? 'MTN Money' : p.paymentMethod}
                                    </td>
                                    <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                                        <span style={{
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            fontSize: '0.75rem',
                                            background: p.status === 'completed' ? '#dcfce7' : p.status === 'failed' ? '#fee2e2' : '#fef9c3',
                                            color: p.status === 'completed' ? '#166534' : p.status === 'failed' ? '#991b1b' : '#854d0e'
                                        }}>
                                            {p.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: '600' }}>
                                        {p.currency} {p.amount.toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default StudentFinance;
