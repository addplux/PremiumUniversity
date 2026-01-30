import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css'; // Reuse dashboard styles

const AuditLogManager = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({ resource: '', action: '' });

    useEffect(() => {
        fetchLogs();
    }, [filter]);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/system/audit-logs`, {
                params: filter,
                withCredentials: true
            });
            setLogs(res.data.data);
        } catch (err) {
            console.error('Failed to fetch audit logs', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h1>System Audit Logs</h1>
                <p>Track all critical system mutations and administrative actions.</p>
            </div>

            <div className="stats-grid" style={{ marginBottom: '20px' }}>
                <div className="stat-card">
                    <select
                        value={filter.resource}
                        onChange={(e) => setFilter({ ...filter, resource: e.target.value })}
                        className="form-control"
                    >
                        <option value="">All Resources</option>
                        <option value="Grade">Grades</option>
                        <option value="Payment">Payments</option>
                        <option value="User">Users</option>
                        <option value="Enrollment">Enrollments</option>
                    </select>
                </div>
                <div className="stat-card">
                    <select
                        value={filter.action}
                        onChange={(e) => setFilter({ ...filter, action: e.target.value })}
                        className="form-control"
                    >
                        <option value="">All Actions</option>
                        <option value="CREATE">Create</option>
                        <option value="UPDATE">Update</option>
                        <option value="DELETE">Delete</option>
                    </select>
                </div>
            </div>

            <div className="table-container">
                {loading ? (
                    <p>Loading logs...</p>
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Timestamp</th>
                                <th>User</th>
                                <th>Action</th>
                                <th>Resource</th>
                                <th>Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map((log) => (
                                <tr key={log._id}>
                                    <td>{new Date(log.timestamp).toLocaleString()}</td>
                                    <td>{log.userId?.email || log.userId || 'System'}</td>
                                    <td>
                                        <span className={`badge badge-${log.action.toLowerCase()}`}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td>{log.resource}</td>
                                    <td>
                                        <small>{JSON.stringify(log.metadata?.body || {}).substring(0, 50)}...</small>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default AuditLogManager;
