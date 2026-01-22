import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import './Dashboard.css';

const SystemAdminDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [recentLogs, setRecentLogs] = useState([]);
    const [systemHealth, setSystemHealth] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [healthRes, statsRes, logsRes] = await Promise.all([
                axios.get('/system/health'),
                axios.get('/system/stats'),
                axios.get('/system/logs?limit=10')
            ]);

            if (healthRes.data.success) setSystemHealth(healthRes.data.data);
            if (statsRes.data.success) setStats(statsRes.data.data);
            if (logsRes.data.success) setRecentLogs(logsRes.data.data);
        } catch (error) {
            console.error('Failed to fetch system data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8">Loading system dashboard...</div>;

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>System Administration</h1>
                <p>Welcome back, {user?.firstName}. System monitoring and management.</p>
            </div>

            {/* System Health */}
            <div className="dashboard-grid">
                <div className="dashboard-card" style={{ borderLeft: '4px solid #10b981' }}>
                    <h4>System Status</h4>
                    <div className="stat-big">{systemHealth?.status || 'Unknown'}</div>
                    <p className="text-small">Database: {systemHealth?.database || 'Unknown'}</p>
                </div>
                <div className="dashboard-card" style={{ borderLeft: '4px solid #3b82f6' }}>
                    <h4>Total Users</h4>
                    <div className="stat-big">{systemHealth?.stats?.totalUsers || 0}</div>
                    <p className="text-small">Registered accounts</p>
                </div>
                <div className="dashboard-card" style={{ borderLeft: '4px solid #f59e0b' }}>
                    <h4>Audit Logs</h4>
                    <div className="stat-big">{systemHealth?.stats?.totalAuditLogs || 0}</div>
                    <p className="text-small">Total tracked actions</p>
                </div>
                <div className="dashboard-card" style={{ borderLeft: '4px solid #8b5cf6' }}>
                    <h4>Uptime</h4>
                    <div className="stat-big">{Math.floor((systemHealth?.stats?.uptime || 0) / 60)}m</div>
                    <p className="text-small">Server running time</p>
                </div>
            </div>

            {/* User Statistics by Role */}
            <div className="dashboard-section" style={{ marginTop: '2rem' }}>
                <h2>Users by Role</h2>
                <div className="dashboard-grid">
                    {stats?.usersByRole?.map((roleData) => (
                        <div key={roleData._id} className="dashboard-card">
                            <h4>{roleData._id || 'Unknown'}</h4>
                            <div className="stat-big">{roleData.count}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent Activity */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem' }}>
                <div className="dashboard-section">
                    <h2>Recent Audit Logs</h2>
                    <div className="applications-table">
                        {recentLogs.map((log) => (
                            <div key={log._id} className="table-row">
                                <div className="table-cell">
                                    <strong>{log.user?.firstName} {log.user?.lastName}</strong>
                                    <p className="text-small">{log.action.replace(/_/g, ' ')}</p>
                                </div>
                                <div className="table-cell text-small">
                                    {new Date(log.createdAt).toLocaleString()}
                                </div>
                            </div>
                        ))}
                        {recentLogs.length === 0 && <p>No recent activity.</p>}
                    </div>
                    <Link to="/admin/system/logs" className="btn-text">View all logs →</Link>
                </div>

                <div className="dashboard-section">
                    <h2>Security Overview</h2>
                    <div className="dashboard-card">
                        <h4>🔐 Recent Logins (24h)</h4>
                        <div className="stat-big">{stats?.recentLogins || 0}</div>
                    </div>
                    <div className="dashboard-card" style={{ marginTop: '1rem' }}>
                        <h4>⚠️ Failed Logins (24h)</h4>
                        <div className="stat-big" style={{ color: stats?.failedLogins > 5 ? '#ef4444' : '#10b981' }}>
                            {stats?.failedLogins || 0}
                        </div>
                    </div>
                    <Link to="/admin/system/security" className="btn-text">View security details →</Link>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="dashboard-section" style={{ marginTop: '2rem' }}>
                <h2>Quick Actions</h2>
                <div className="dashboard-grid">
                    <Link to="/admin/system/users" className="dashboard-card" style={{ textDecoration: 'none', cursor: 'pointer' }}>
                        <h4>Manage Users</h4>
                        <p className="text-small">Create, edit, and delete user accounts</p>
                    </Link>
                    <Link to="/admin/system/logs" className="dashboard-card" style={{ textDecoration: 'none', cursor: 'pointer' }}>
                        <h4>Audit Logs</h4>
                        <p className="text-small">View all system activity</p>
                    </Link>
                    <Link to="/admin/system/security" className="dashboard-card" style={{ textDecoration: 'none', cursor: 'pointer' }}>
                        <h4>Security</h4>
                        <p className="text-small">Monitor security events</p>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default SystemAdminDashboard;
