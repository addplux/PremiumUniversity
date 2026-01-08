import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import './Dashboard.css';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [applications, setApplications] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [stats, setStats] = useState({ total: 0, pending: 0, accepted: 0, rejected: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [appsRes, contactsRes] = await Promise.all([
                axios.get('/applications'),
                axios.get('/contact')
            ]);

            if (appsRes.data.success) {
                const apps = appsRes.data.data;
                setApplications(apps);
                setStats({
                    total: apps.length,
                    pending: apps.filter(a => a.status === 'pending').length,
                    accepted: apps.filter(a => a.status === 'accepted').length,
                    rejected: apps.filter(a => a.status === 'rejected').length
                });
            }

            if (contactsRes.data.success) {
                setContacts(contactsRes.data.data.slice(0, 5));
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (appId, newStatus) => {
        try {
            await axios.put(`/applications/${appId}/status`, {
                status: newStatus,
                comment: `Status updated to ${newStatus}`
            });
            fetchData(); // Refresh data
        } catch (error) {
            console.error('Failed to update status:', error);
        }
    };

    return (
        <div className="dashboard-page">
            <Navbar />

            <div className="dashboard-container">
                <div className="dashboard-header">
                    <h1>Admin Dashboard</h1>
                    <p>Manage applications and monitor activity</p>
                </div>

                <div className="dashboard-grid">
                    <div className="dashboard-card">
                        <h4>📊 Total Applications</h4>
                        <div className="stat-big">{stats.total}</div>
                    </div>
                    <div className="dashboard-card">
                        <h4>⏳ Pending</h4>
                        <div className="stat-big">{stats.pending}</div>
                    </div>
                    <div className="dashboard-card">
                        <h4>✅ Accepted</h4>
                        <div className="stat-big">{stats.accepted}</div>
                    </div>
                    <div className="dashboard-card">
                        <h4>❌ Rejected</h4>
                        <div className="stat-big">{stats.rejected}</div>
                    </div>
                </div>

                <div className="dashboard-section">
                    <h2>Recent Applications</h2>
                    {loading ? (
                        <p>Loading...</p>
                    ) : (
                        <div className="applications-table">
                            {applications.slice(0, 10).map((app) => (
                                <div key={app._id} className="table-row">
                                    <div className="table-cell">
                                        <strong>{app.personalInfo.firstName} {app.personalInfo.lastName}</strong>
                                        <p className="text-small">{app.program}</p>
                                    </div>
                                    <div className="table-cell">
                                        <p className="text-small">{new Date(app.submittedAt).toLocaleDateString()}</p>
                                    </div>
                                    <div className="table-cell">
                                        <select
                                            value={app.status}
                                            onChange={(e) => handleStatusUpdate(app._id, e.target.value)}
                                            className="status-select"
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="under_review">Under Review</option>
                                            <option value="accepted">Accepted</option>
                                            <option value="rejected">Rejected</option>
                                            <option value="waitlisted">Waitlisted</option>
                                        </select>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="dashboard-section">
                    <h2>Recent Contact Messages</h2>
                    {contacts.length === 0 ? (
                        <p>No contacts yet</p>
                    ) : (
                        <div className="contact-messages">
                            {contacts.map((contact) => (
                                <div key={contact._id} className="message-card">
                                    <div className="message-header">
                                        <strong>{contact.name}</strong>
                                        <span className="text-small">{new Date(contact.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <p className="message-subject">{contact.subject}</p>
                                    <p className="text-small">{contact.email}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
