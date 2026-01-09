import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await axios.get('/dashboard/admin');
            if (res.data.success) {
                setStats(res.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8">Loading dashboard overview...</div>;

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Executive Overview</h1>
                <p>Welcome back, {user?.firstName}. Here is what's happening today.</p>
            </div>

            <div className="dashboard-grid">
                <div className="dashboard-card">
                    <h4>📝 Admissions</h4>
                    <div className="stat-big">{stats.applications.pending}</div>
                    <p className="text-small">Pending of {stats.applications.total} Total</p>
                </div>
                <div className="dashboard-card" style={{ borderLeft: '4px solid #10b981' }}>
                    <h4>💰 Total Revenue</h4>
                    <div className="stat-big">${stats.finance.totalRevenue.toLocaleString()}</div>
                    <p className="text-small">Accumulated Payments</p>
                </div>
                <div className="dashboard-card" style={{ borderLeft: '4px solid #3b82f6' }}>
                    <h4>👨‍🎓 Active Students</h4>
                    <div className="stat-big">{stats.users.students}</div>
                    <p className="text-small">Registered in registry</p>
                </div>
                <div className="dashboard-card" style={{ borderLeft: '4px solid #f59e0b' }}>
                    <h4>📚 Courses</h4>
                    <div className="stat-big">{stats.academics.courses}</div>
                    <p className="text-small">Active catalog items</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem', marginTop: '2rem' }}>
                <div className="dashboard-section">
                    <h2>Recent Applications</h2>
                    <div className="applications-table">
                        {stats.recentActivity.applications.map((app) => (
                            <div key={app._id} className="table-row">
                                <div className="table-cell">
                                    <strong>{app.personalInfo.firstName} {app.personalInfo.lastName}</strong>
                                    <p className="text-small">{app.program}</p>
                                </div>
                                <div className="table-cell">
                                    <span className={`status-badge status-${app.status}`}>
                                        {app.status.replace('_', ' ')}
                                    </span>
                                </div>
                                <div className="table-cell text-small">
                                    {new Date(app.submittedAt).toLocaleDateString()}
                                </div>
                            </div>
                        ))}
                    </div>
                    <a href="/admin/applications" className="btn-text">View all applications →</a>
                </div>

                <div className="dashboard-section">
                    <h2>Recent Payments</h2>
                    <div className="contact-messages">
                        {stats.recentActivity.payments.map((payment) => (
                            <div key={payment._id} className="message-card" style={{ padding: '1rem', marginBottom: '0.8rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <strong>{payment.student.firstName} {payment.student.lastName}</strong>
                                        <p className="text-small">{new Date(payment.date).toLocaleDateString()}</p>
                                    </div>
                                    <div style={{ fontWeight: 'bold', color: '#10b981' }}>
                                        +${payment.amount.toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {stats.recentActivity.payments.length === 0 && <p>No recent payments.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
