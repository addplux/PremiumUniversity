import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import './Dashboard.css';

const AcademicAdminDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        courses: 0,
        assignments: 0,
        submissions: 0,
        onlineClasses: 0
    });
    const [upcomingClasses, setUpcomingClasses] = useState([]);
    const [recentAssignments, setRecentAssignments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [coursesRes, classesRes] = await Promise.all([
                axios.get('/courses'),
                axios.get('/online-classes/upcoming')
            ]);

            if (coursesRes.data.success) {
                setStats(prev => ({ ...prev, courses: coursesRes.data.count }));
            }
            if (classesRes.data.success) {
                setUpcomingClasses(classesRes.data.data.slice(0, 5));
                setStats(prev => ({ ...prev, onlineClasses: classesRes.data.count }));
            }
        } catch (error) {
            console.error('Failed to fetch academic data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8">Loading academic dashboard...</div>;

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>📚 Academic Administration</h1>
                <p>Welcome back, {user?.firstName}. Manage courses, assignments, and grades.</p>
            </div>

            {/* Academic Statistics */}
            <div className="dashboard-grid">
                <div className="dashboard-card" style={{ borderLeft: '4px solid #3b82f6' }}>
                    <h4>📚 Active Courses</h4>
                    <div className="stat-big">{stats.courses}</div>
                    <p className="text-small">In catalog</p>
                </div>
                <div className="dashboard-card" style={{ borderLeft: '4px solid #f59e0b' }}>
                    <h4>📝 Assignments</h4>
                    <div className="stat-big">{stats.assignments}</div>
                    <p className="text-small">Active assignments</p>
                </div>
                <div className="dashboard-card" style={{ borderLeft: '4px solid #10b981' }}>
                    <h4>✅ Submissions</h4>
                    <div className="stat-big">{stats.submissions}</div>
                    <p className="text-small">Pending review</p>
                </div>
                <div className="dashboard-card" style={{ borderLeft: '4px solid #8b5cf6' }}>
                    <h4>💻 Online Classes</h4>
                    <div className="stat-big">{stats.onlineClasses}</div>
                    <p className="text-small">Upcoming sessions</p>
                </div>
            </div>

            {/* Upcoming Online Classes */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem' }}>
                <div className="dashboard-section">
                    <h2>Upcoming Online Classes</h2>
                    <div className="applications-table">
                        {upcomingClasses.map((cls) => (
                            <div key={cls._id} className="table-row">
                                <div className="table-cell">
                                    <strong>{cls.title}</strong>
                                    <p className="text-small">{cls.course?.title || 'Unknown Course'}</p>
                                </div>
                                <div className="table-cell text-small">
                                    {new Date(cls.scheduledDate).toLocaleString()}
                                </div>
                            </div>
                        ))}
                        {upcomingClasses.length === 0 && <p>No upcoming classes scheduled.</p>}
                    </div>
                    <Link to="/admin/academic/online-classes" className="btn-text">Manage online classes →</Link>
                </div>

                <div className="dashboard-section">
                    <h2>Quick Stats</h2>
                    <div className="dashboard-card">
                        <h4>📊 Course Enrollments</h4>
                        <div className="stat-big">-</div>
                        <p className="text-small">Total active enrollments</p>
                    </div>
                    <div className="dashboard-card" style={{ marginTop: '1rem' }}>
                        <h4>🎓 Grades Posted</h4>
                        <div className="stat-big">-</div>
                        <p className="text-small">This semester</p>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="dashboard-section" style={{ marginTop: '2rem' }}>
                <h2>Quick Actions</h2>
                <div className="dashboard-grid">
                    <Link to="/admin/academic/courses" className="dashboard-card" style={{ textDecoration: 'none', cursor: 'pointer' }}>
                        <h4>📚 Manage Courses</h4>
                        <p className="text-small">Create and edit courses</p>
                    </Link>
                    <Link to="/admin/academic/assignments" className="dashboard-card" style={{ textDecoration: 'none', cursor: 'pointer' }}>
                        <h4>📝 Assignments</h4>
                        <p className="text-small">Post and grade assignments</p>
                    </Link>
                    <Link to="/admin/academic/grades" className="dashboard-card" style={{ textDecoration: 'none', cursor: 'pointer' }}>
                        <h4>🎓 Post Grades</h4>
                        <p className="text-small">Manage CA marks and GPA</p>
                    </Link>
                    <Link to="/admin/academic/timetable" className="dashboard-card" style={{ textDecoration: 'none', cursor: 'pointer' }}>
                        <h4>📅 Timetable</h4>
                        <p className="text-small">Manage class schedules</p>
                    </Link>
                    <Link to="/admin/academic/online-classes" className="dashboard-card" style={{ textDecoration: 'none', cursor: 'pointer' }}>
                        <h4>💻 Online Classes</h4>
                        <p className="text-small">Schedule virtual sessions</p>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AcademicAdminDashboard;
