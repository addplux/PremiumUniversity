import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import './Dashboard.css';

const StudentDashboard = () => {
    const { user } = useAuth();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            const response = await axios.get('/applications/my');
            if (response.data.success) {
                setApplications(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch applications:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const statusColors = {
            pending: '#f7b731',
            under_review: '#3498db',
            accepted: '#27ae60',
            rejected: '#e74c3c',
            waitlisted: '#9b59b6'
        };
        return (
            <span className="status-badge" style={{ backgroundColor: statusColors[status] || '#95a5a6' }}>
                {status.replace('_', ' ').toUpperCase()}
            </span>
        );
    };

    return (
        <div className="dashboard-page">
            <Navbar />

            <div className="dashboard-container">
                <div className="dashboard-header">
                    <h1>Welcome, {user?.firstName}!</h1>
                    <p>Manage your applications and profile</p>
                </div>

                <div className="dashboard-grid">
                    <div className="dashboard-card">
                        <h3>📊 Overview</h3>
                        <div className="stats-mini">
                            <div className="stat-mini">
                                <span className="stat-number">{applications.length}</span>
                                <span className="stat-label">Total Applications</span>
                            </div>
                            <div className="stat-mini">
                                <span className="stat-number">{applications.filter(a => a.status === 'pending').length}</span>
                                <span className="stat-label">Pending</span>
                            </div>
                        </div>
                    </div>

                    <div className="dashboard-card">
                        <h3>👤 Profile</h3>
                        <div className="profile-info">
                            <p><strong>Email:</strong> {user?.email}</p>
                            <p><strong>Phone:</strong> {user?.phone}</p>
                            <p><strong>City:</strong> {user?.city || 'Not provided'}</p>
                        </div>
                    </div>
                </div>

                <div className="dashboard-section">
                    <div className="section-header-dash">
                        <h2>My Applications</h2>
                        <a href="/admissions" className="btn-primary">New Application</a>
                    </div>

                    {loading ? (
                        <p>Loading applications...</p>
                    ) : applications.length === 0 ? (
                        <div className="empty-state">
                            <p>You haven't submitted any applications yet.</p>
                            <a href="/admissions" className="btn-primary">Apply Now</a>
                        </div>
                    ) : (
                        <div className="applications-list">
                            {applications.map((app) => (
                                <div key={app._id} className="application-card">
                                    <div className="app-header">
                                        <div>
                                            <h4>{app.program}</h4>
                                            <p className="app-date">Submitted: {new Date(app.submittedAt).toLocaleDateString()}</p>
                                        </div>
                                        {getStatusBadge(app.status)}
                                    </div>
                                    <div className="app-details">
                                        <p><strong>Name:</strong> {app.personalInfo.firstName} {app.personalInfo.lastName}</p>
                                        <p><strong>Email:</strong> {app.personalInfo.email}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
