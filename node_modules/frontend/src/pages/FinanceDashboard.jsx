import { useState, useEffect } from 'react';
import axios from 'axios';
import '../pages/ApplicationsManager.css'; // Consistency

const FinanceDashboard = () => {
    const [payments, setPayments] = useState([]);
    const [stats, setStats] = useState({ totalRevenue: 0, totalPayments: 0, monthlyRevenue: [] });
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    const [formData, setFormData] = useState({
        studentId: '',
        amount: '',
        paymentMethod: 'Mobile Money',
        reference: '',
        description: '',
        status: 'completed'
    });

    useEffect(() => {
        fetchData();
        fetchStudents();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [payRes, statsRes] = await Promise.all([
                axios.get('/finance'),
                axios.get('/finance/stats')
            ]);
            if (payRes.data.success) setPayments(payRes.data.data);
            if (statsRes.data.success) setStats(statsRes.data.data);
        } catch (error) {
            console.error('Failed to fetch finance data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStudents = async () => {
        try {
            const res = await axios.get('/users?role=student');
            if (res.data.success) setStudents(res.data.data);
        } catch (error) {
            console.error('Failed to fetch students:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('/finance', formData);
            if (res.data.success) {
                alert('Payment recorded successfully');
                setShowForm(false);
                setFormData({ studentId: '', amount: '', paymentMethod: 'Mobile Money', reference: '', description: '', status: 'completed' });
                fetchData(); // Refresh list and stats
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to record payment');
        }
    };

    return (
        <div className="apps-manager">
            <div className="manager-header">
                <h1>Finance Dashboard</h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    style={{ background: '#1a56db', color: 'white', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    {showForm ? 'View Layout' : '+ Record Payment'}
                </button>
            </div>

            {!showForm && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem', padding: '0 1rem' }}>
                    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', borderLeft: '4px solid #10b981' }}>
                        <p style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Total Revenue</p>
                        <h2 style={{ fontSize: '1.875rem', fontWeight: '700', color: '#1e293b' }}>${stats.totalRevenue.toLocaleString()}</h2>
                    </div>
                    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', borderLeft: '4px solid #3b82f6' }}>
                        <p style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Total Transactions</p>
                        <h2 style={{ fontSize: '1.875rem', fontWeight: '700', color: '#1e293b' }}>{stats.totalPayments}</h2>
                    </div>
                    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', borderLeft: '4px solid #f59e0b' }}>
                        <p style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.5rem' }}>This Month</p>
                        <h2 style={{ fontSize: '1.875rem', fontWeight: '700', color: '#1e293b' }}>
                            ${stats.monthlyRevenue.find(m => m._id === (new Date().getMonth() + 1))?.revenue.toLocaleString() || 0}
                        </h2>
                    </div>
                </div>
            )}

            <div className="manager-content" style={{ padding: '1rem' }}>
                {showForm ? (
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', maxWidth: '600px', margin: '0 auto', width: '100%' }}>
                        <h2 style={{ marginBottom: '1.5rem' }}>Record Student Payment</h2>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Select Student</label>
                                <select
                                    className="status-select-large"
                                    value={formData.studentId}
                                    onChange={e => setFormData({ ...formData, studentId: e.target.value })}
                                    required
                                >
                                    <option value="">-- Choose Student --</option>
                                    {students.map(s => (
                                        <option key={s._id} value={s._id}>{s.firstName} {s.lastName} ({s.studentId || 'No ID'})</option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Amount ($)</label>
                                    <input
                                        type="number"
                                        className="status-select-large"
                                        value={formData.amount}
                                        onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                        required
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Method</label>
                                    <select
                                        className="status-select-large"
                                        value={formData.paymentMethod}
                                        onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })}
                                        required
                                    >
                                        <option value="Mobile Money">Mobile Money</option>
                                        <option value="Bank Transfer">Bank Transfer</option>
                                        <option value="Cash">Cash</option>
                                        <option value="Online">Online</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Reference / Transaction ID</label>
                                <input
                                    className="status-select-large"
                                    value={formData.reference}
                                    onChange={e => setFormData({ ...formData, reference: e.target.value })}
                                    placeholder="e.g. TRX-123456"
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Description</label>
                                <textarea
                                    className="status-select-large"
                                    rows="3"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Tuition fees for Semester 1..."
                                />
                            </div>
                            <button type="submit" style={{ background: '#10b981', color: 'white', padding: '0.8rem', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', marginTop: '1rem' }}>
                                Save Transaction
                            </button>
                        </form>
                    </div>
                ) : (
                    <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead style={{ background: '#f8fafc', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                                <tr>
                                    <th style={{ padding: '1rem' }}>Student</th>
                                    <th style={{ padding: '1rem' }}>Amount</th>
                                    <th style={{ padding: '1rem' }}>Method</th>
                                    <th style={{ padding: '1rem' }}>Date</th>
                                    <th style={{ padding: '1rem' }}>Reference</th>
                                    <th style={{ padding: '1rem' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody style={{ fontSize: '0.875rem' }}>
                                {loading ? (
                                    <tr><td colSpan="6" style={{ padding: '2rem', textAlign: 'center' }}>Loading transactions...</td></tr>
                                ) : payments.length === 0 ? (
                                    <tr><td colSpan="6" style={{ padding: '2rem', textAlign: 'center' }}>No transactions recorded yet.</td></tr>
                                ) : payments.map(p => (
                                    <tr key={p._id} style={{ borderTop: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ fontWeight: '600' }}>{p.student?.firstName} {p.student?.lastName}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{p.student?.studentId}</div>
                                        </td>
                                        <td style={{ padding: '1rem', fontWeight: '600', color: '#1e293b' }}>${p.amount.toLocaleString()}</td>
                                        <td style={{ padding: '1rem' }}>{p.paymentMethod}</td>
                                        <td style={{ padding: '1rem' }}>{new Date(p.date).toLocaleDateString()}</td>
                                        <td style={{ padding: '1rem', fontFamily: 'monospace', color: '#64748b' }}>{p.reference || '-'}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{
                                                padding: '0.25rem 0.6rem',
                                                borderRadius: '9999px',
                                                fontSize: '0.75rem',
                                                fontWeight: '600',
                                                background: p.status === 'completed' ? '#dcfce7' : '#fee2e2',
                                                color: p.status === 'completed' ? '#166534' : '#991b1b'
                                            }}>
                                                {p.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FinanceDashboard;
