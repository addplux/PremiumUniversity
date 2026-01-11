import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Bar, Pie } from 'react-chartjs-2'; // Assuming chart.js wrapper is or will be installed, or we use simple CSS bars if not
// Note: If no chart lib is installed, we'll fall back to CSS bars as seen in dashboard
import './Dashboard.css';

const FinanceReports = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState('all'); // all, year, month

    useEffect(() => {
        fetchReports();
    }, [dateRange]);

    const fetchReports = async () => {
        setLoading(true);
        try {
            // Re-using the robust stats endpoint
            const res = await axios.get('/finance/stats');
            if (res.data.success) {
                setStats(res.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch reports:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8">Generating financial reports...</div>;

    // Helper for CSS charts
    const getMonthName = (monthIdx) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return months[monthIdx - 1] || 'Unknown';
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <button onClick={() => navigate('/admin/finance')} className="btn-text">
                    ← Back to Dashboard
                </button>
                <h1>📊 Financial Reports</h1>
                <p>Overview of revenue, transactions, and payment methods.</p>
            </div>

            {/* Print / Export Actions */}
            <div className="dashboard-section" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button className="btn-secondary" onClick={() => window.print()}>
                    🖨️ Print Report
                </button>
                <button className="btn-primary" disabled>
                    📥 Export CSV (Coming Soon)
                </button>
            </div>

            {/* Summary Cards */}
            <div className="dashboard-grid">
                <div className="dashboard-card" style={{ background: '#f8fafc' }}>
                    <p className="text-small">Total Revenue</p>
                    <h2 style={{ fontSize: '2rem', color: '#10b981' }}>K{stats?.totalRevenue?.toLocaleString()}</h2>
                </div>
                <div className="dashboard-card" style={{ background: '#f8fafc' }}>
                    <p className="text-small">Total Transactions</p>
                    <h2 style={{ fontSize: '2rem', color: '#3b82f6' }}>{stats?.totalPayments}</h2>
                </div>
                <div className="dashboard-card" style={{ background: '#f8fafc' }}>
                    <p className="text-small">Avg. Transaction Value</p>
                    <h2 style={{ fontSize: '2rem', color: '#8b5cf6' }}>
                        K{stats?.totalPayments > 0 ? Math.round(stats.totalRevenue / stats.totalPayments).toLocaleString() : 0}
                    </h2>
                </div>
            </div>

            {/* Monthly Revenue Chart */}
            <div className="dashboard-section" style={{ marginTop: '2rem' }}>
                <h3>Monthly Revenue Trend</h3>
                <div style={{
                    marginTop: '2rem',
                    height: '300px',
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: '2%',
                    borderBottom: '1px solid #e2e8f0',
                    paddingBottom: '1rem'
                }}>
                    {stats?.monthlyRevenue?.map((month) => {
                        const maxRevenue = Math.max(...stats.monthlyRevenue.map(m => m.revenue));
                        const height = (month.revenue / maxRevenue) * 100;

                        return (
                            <div key={month._id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                                <div className="bar-tooltip-container" style={{ width: '100%', height: `${height}%`, position: 'relative' }}>
                                    <div style={{
                                        width: '100%',
                                        height: '100%',
                                        backgroundColor: '#3b82f6',
                                        borderRadius: '4px 4px 0 0',
                                        opacity: 0.8,
                                        transition: 'opacity 0.2s'
                                    }}></div>
                                    <span className="tooltip">K{month.revenue.toLocaleString()}</span>
                                </div>
                                <span className="text-small" style={{ marginTop: '0.5rem', fontWeight: '500' }}>
                                    {getMonthName(month._id)}
                                </span>
                            </div>
                        );
                    })}
                    {(!stats?.monthlyRevenue || stats.monthlyRevenue.length === 0) && <p>No revenue data available.</p>}
                </div>
            </div>

            {/* Future: Payment Method Breakdown */}
            <div className="dashboard-section" style={{ marginTop: '2rem' }}>
                <h3>Payment Methods</h3>
                <p className="text-small text-gray-500">Breakdown of payment channels (Mobile Money vs Bank vs Cash) will appear here.</p>
                <div style={{ height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', borderRadius: '8px', marginTop: '1rem' }}>
                    Chart Placeholder
                </div>
            </div>
        </div>
    );
};

export default FinanceReports;
