import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const StudentDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await axios.get('/dashboard/student');
            if (res.data.success) {
                setStats(res.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch student dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8">Loading your dashboard...</div>;

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Academic Overview</h1>
                <p>Welcome back, {user?.firstName}. Here is your current progress.</p>
            </div>

            <div className="dashboard-grid">
                <div className="dashboard-card">
                    <h3>🎓 Academic Status</h3>
                    <div className="stats-mini">
                        <div className="stat-mini">
                            <span className="stat-number">{stats.academics.gpa}</span>
                            <span className="stat-label">Cumulative GPA</span>
                        </div>
                        <div className="stat-mini">
                            <span className="stat-number">{stats.academics.totalCredits}</span>
                            <span className="stat-label">Credits Earned</span>
                        </div>
                    </div>
                </div>

                <div className="dashboard-card">
                    <h3>✍️ Assignments</h3>
                    <div className="stats-mini">
                        <div className="stat-mini">
                            <span className="stat-number">{stats.assignments.pending}</span>
                            <span className="stat-label">Pending</span>
                        </div>
                        <div className="stat-mini">
                            <span className="stat-number">{stats.assignments.total}</span>
                            <span className="stat-label">Total Assigned</span>
                        </div>
                    </div>
                </div>

                <div className="dashboard-card">
                    <h3>💰 Finance</h3>
                    <div className="profile-info">
                        {stats.finance.lastPayment ? (
                            <>
                                <p><strong>Last Payment:</strong> ${stats.finance.lastPayment.amount.toLocaleString()}</p>
                                <p><strong>Date:</strong> {new Date(stats.finance.lastPayment.date).toLocaleDateString()}</p>
                                <p><strong>Status:</strong> {stats.finance.lastPayment.status}</p>
                            </>
                        ) : (
                            <p>No payment history found.</p>
                        )}
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem', marginTop: '2rem' }}>
                <div className="dashboard-section">
                    <div className="section-header-dash">
                        <h2>Upcoming Deadlines</h2>
                        <a href="/dashboard/assignments" className="btn-text">View all assignments →</a>
                    </div>

                    <div className="applications-table">
                        {stats.assignments.upcoming.length === 0 ? (
                            <p className="p-4">All caught up! No pending assignments.</p>
                        ) : stats.assignments.upcoming.map((asm) => (
                            <div key={asm._id} className="table-row">
                                <div className="table-cell">
                                    <strong>{asm.title}</strong>
                                    <p className="text-small" style={{ color: '#ef4444' }}>
                                        Due: {new Date(asm.deadline).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="table-cell">
                                    <span className="text-small">{asm.maxPoints} Points</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="dashboard-section">
                    <h2>Course Overview</h2>
                    <div className="profile-info">
                        <div style={{ marginBottom: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
                            <p style={{ margin: 0, fontWeight: 'bold' }}>Active Enrollments</p>
                            <h2 style={{ fontSize: '2rem', margin: '0.5rem 0' }}>{stats.academics.enrolledCourses}</h2>
                            <a href="/dashboard/courses" className="text-small" style={{ color: 'var(--primary-color)' }}>Browse Catalog →</a>
                        </div>
                        <div style={{ background: '#f0f9ff', padding: '1rem', borderRadius: '8px' }}>
                            <p style={{ margin: 0, fontWeight: 'bold' }}>Completed Units</p>
                            <h2 style={{ fontSize: '2rem', margin: '0.5rem 0' }}>{stats.academics.completedCourses}</h2>
                            <a href="/dashboard/grades" className="text-small" style={{ color: 'var(--primary-color)' }}>View Transcript →</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
