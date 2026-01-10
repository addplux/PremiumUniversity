import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import './Dashboard.css';

const FinanceAdminDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [recentPayments, setRecentPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [statsRes, paymentsRes] = await Promise.all([
                axios.get('/finance/stats'),
                axios.get('/finance?limit=10')
            ]);

            if (statsRes.data.success) setStats(statsRes.data.data);
            if (paymentsRes.data.success) setRecentPayments(paymentsRes.data.data.slice(0, 10));
        } catch (error) {
            console.error('Failed to fetch finance data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8">Loading finance dashboard...</div>;

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>🏦 Finance Administration</h1>
                <p>Welcome back, {user?.firstName}. Manage student fees and payments.</p>
            </div>

            {/* Financial Statistics */}
            <div className="dashboard-grid">
                <div className="dashboard-card" style={{ borderLeft: '4px solid #10b981' }}>
                    <h4>💰 Total Revenue</h4>
                    <div className="stat-big">K{stats?.totalRevenue?.toLocaleString() || 0}</div>
                    <p className="text-small">All-time collections</p>
                </div>
                <div className="dashboard-card" style={{ borderLeft: '4px solid #3b82f6' }}>
                    <h4>📊 Total Payments</h4>
                    <div className="stat-big">{stats?.totalPayments || 0}</div>
                    <p className="text-small">Payment records</p>
                </div>
                <div className="dashboard-card" style={{ borderLeft: '4px solid #f59e0b' }}>
                    <h4>📅 This Month</h4>
                    <div className="stat-big">
                        K{stats?.monthlyRevenue?.find(m => m._id === new Date().getMonth() + 1)?.revenue?.toLocaleString() || 0}
                    </div>
                    <p className="text-small">Current month revenue</p>
                </div>
                <div className="dashboard-card" style={{ borderLeft: '4px solid #8b5cf6' }}>
                    <h4>📈 Average Payment</h4>
                    <div className="stat-big">
                        K{stats?.totalPayments > 0 ? Math.round(stats.totalRevenue / stats.totalPayments).toLocaleString() : 0}
                    </div>
                    <p className="text-small">Per transaction</p>
                </div>
            </div>

            {/* Recent Payments */}
            <div className="dashboard-section" style={{ marginTop: '2rem' }}>
                <h2>Recent Payments</h2>
                <div className="applications-table">
                    {recentPayments.map((payment) => (
                        <div key={payment._id} className="table-row">
                            <div className="table-cell">
                                <strong>{payment.student?.firstName} {payment.student?.lastName}</strong>
                                <p className="text-small">{payment.description || payment.paymentMethod}</p>
                            </div>
                            <div className="table-cell">
                                <span className="stat-big" style={{ color: '#10b981', fontSize: '1.1rem' }}>
                                    +K{payment.amount.toLocaleString()}
                                </span>
                            </div>
                            <div className="table-cell text-small">
                                {new Date(payment.date).toLocaleDateString()}
                            </div>
                        </div>
                    ))}
                    {recentPayments.length === 0 && <p>No payments recorded yet.</p>}
                </div>
                <Link to="/admin/finance" className="btn-text">View all payments →</Link>
            </div>

            {/* Monthly Revenue Chart */}
            {stats?.monthlyRevenue && stats.monthlyRevenue.length > 0 && (
                <div className="dashboard-section" style={{ marginTop: '2rem' }}>
                    <h2>Monthly Revenue Trend</h2>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', height: '200px' }}>
                        {stats.monthlyRevenue.map((month) => {
                            const maxRevenue = Math.max(...stats.monthlyRevenue.map(m => m.revenue));
                            const height = (month.revenue / maxRevenue) * 100;
                            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

                            return (
                                <div key={month._id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <div style={{
                                        width: '100%',
                                        height: `${height}%`,
                                        backgroundColor: '#10b981',
                                        borderRadius: '4px 4px 0 0',
                                        minHeight: '20px'
                                    }}></div>
                                    <p className="text-small" style={{ marginTop: '0.5rem' }}>{monthNames[month._id - 1]}</p>
                                    <p className="text-small" style={{ fontWeight: 'bold' }}>K{month.revenue.toLocaleString()}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Quick Actions */}
            <div className="dashboard-section" style={{ marginTop: '2rem' }}>
                <h2>Quick Actions</h2>
                <div className="dashboard-grid">
                    <Link to="/admin/finance/record" className="dashboard-card" style={{ textDecoration: 'none', cursor: 'pointer' }}>
                        <h4>➕ Record Payment</h4>
                        <p className="text-small">Add new student payment</p>
                    </Link>
                    <Link to="/admin/finance" className="dashboard-card" style={{ textDecoration: 'none', cursor: 'pointer' }}>
                        <h4>📋 Payment History</h4>
                        <p className="text-small">View all transactions</p>
                    </Link>
                    <Link to="/admin/finance/reports" className="dashboard-card" style={{ textDecoration: 'none', cursor: 'pointer' }}>
                        <h4>📊 Financial Reports</h4>
                        <p className="text-small">Generate reports</p>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default FinanceAdminDashboard;
