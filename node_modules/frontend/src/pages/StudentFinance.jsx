import { useState, useEffect } from 'react';
import axios from 'axios';
import '../pages/ApplicationsManager.css';

const StudentFinance = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        try {
            const res = await axios.get('/finance/my');
            if (res.data.success) {
                setPayments(res.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch financial history:', error);
        } finally {
            setLoading(false);
        }
    };

    const totalPaid = payments.reduce((acc, curr) => acc + curr.amount, 0);

    return (
        <div className="apps-manager">
            <div className="manager-header">
                <h1>Financial Statements</h1>
            </div>

            <div style={{ padding: '1.5rem' }}>
                <div style={{ background: 'linear-gradient(135deg, #1e40af 0%, #1a56db 100%)', color: 'white', padding: '2rem', borderRadius: '12px', marginBottom: '2rem' }}>
                    <p style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>Total Amount Paid</p>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: '700' }}>${totalPaid.toLocaleString()}</h2>
                    <p style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '1rem' }}>Last payment: {payments.length > 0 ? new Date(payments[0].date).toLocaleDateString() : 'N/A'}</p>
                </div>

                <h3>Payment History</h3>
                <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px 0 rgba(0,0,0,0.1)', overflow: 'hidden', marginTop: '1rem' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <tr>
                                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', color: '#64748b' }}>DATE</th>
                                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', color: '#64748b' }}>DESCRIPTION</th>
                                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', color: '#64748b' }}>METHOD</th>
                                <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.75rem', color: '#64748b' }}>AMOUNT</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="4" style={{ padding: '2rem', textAlign: 'center' }}>Loading your financial records...</td></tr>
                            ) : payments.length === 0 ? (
                                <tr><td colSpan="4" style={{ padding: '2rem', textAlign: 'center' }}>No payments found in your history.</td></tr>
                            ) : payments.map(p => (
                                <tr key={p._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{new Date(p.date).toLocaleDateString()}</td>
                                    <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                                        <div style={{ fontWeight: '500' }}>{p.description || 'Tuition Payment'}</div>
                                        <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>REF: {p.reference || p._id}</div>
                                    </td>
                                    <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{p.paymentMethod}</td>
                                    <td style={{ padding: '1rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: '600' }}>${p.amount.toLocaleString()}</td>
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
