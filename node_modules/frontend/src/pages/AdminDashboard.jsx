import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const AdminDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
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

    const managementCategories = [
        {
            title: 'Institution Management',
            icon: '🏛️',
            color: '#3b82f6',
            items: [
                { name: 'Institution Profile', path: '/admin/institution' },
                { name: 'Departments', path: '/admin/departments' },
                { name: 'Programs', path: '/admin/programs' }
            ]
        },
        {
            title: 'Data Management',
            icon: '📊',
            color: '#8b5cf6',
            items: [
                { name: 'Applications', path: '/admin/applications' },
                { name: 'Contact Inquiries', path: '/admin/contact' },
                { name: 'Reports', path: '/admin/reports' }
            ]
        },
        {
            title: 'Academic Management',
            icon: '📚',
            color: '#10b981',
            items: [
                { name: 'Courses', path: '/admin/courses' },
                { name: 'Assignments', path: '/admin/assignments' },
                { name: 'Academic Records', path: '/admin/academic-records' }
            ]
        },
        {
            title: 'ID Cards',
            icon: '🪪',
            color: '#f59e0b',
            items: [
                { name: 'Generate Student ID', path: '/admin/id-cards/student' },
                { name: 'Generate Staff ID', path: '/admin/id-cards/staff' },
                { name: 'ID Card Templates', path: '/admin/id-cards/templates' }
            ]
        },
        {
            title: 'Student Management',
            icon: '👨‍🎓',
            color: '#06b6d4',
            items: [
                { name: 'Student Registry', path: '/admin/students' },
                { name: 'Enrollments', path: '/admin/enrollments' },
                { name: 'Student Records', path: '/admin/student-records' }
            ]
        },
        {
            title: 'Lecturer Management',
            icon: '👨‍🏫',
            color: '#ec4899',
            items: [
                { name: 'Teacher Registry', path: '/admin/teachers' },
                { name: 'Lectures', path: '/admin/lectures' },
                { name: 'Faculty Records', path: '/admin/faculty' }
            ]
        },
        {
            title: 'Timetable Management',
            icon: '📅',
            color: '#14b8a6',
            items: [
                { name: 'Class Schedule', path: '/admin/classes' },
                { name: 'Exam Schedule', path: '/admin/exam-schedule' },
                { name: 'Events Calendar', path: '/admin/events' }
            ]
        },
        {
            title: 'Attendance & Leave',
            icon: '✅',
            color: '#84cc16',
            items: [
                { name: 'Student Attendance', path: '/admin/attendance/students' },
                { name: 'Staff Attendance', path: '/admin/attendance/staff' },
                { name: 'Leave Management', path: '/admin/leave' }
            ]
        },
        {
            title: 'Finance Management',
            icon: '💰',
            color: '#10b981',
            items: [
                { name: 'Payments Dashboard', path: '/admin/finance' },
                { name: 'Record Payment', path: '/admin/finance/record' },
                { name: 'Finance Reports', path: '/admin/finance/reports' }
            ]
        },
        {
            title: 'Fee Management',
            icon: '💳',
            color: '#6366f1',
            items: [
                { name: 'Student Fees', path: '/admin/fees' },
                { name: 'Fee Structure', path: '/admin/fee-structure' },
                { name: 'Fee Reports', path: '/admin/fee-reports' }
            ]
        },
        {
            title: 'Exam Management',
            icon: '📝',
            color: '#ef4444',
            items: [
                { name: 'Examinations', path: '/admin/examinations' },
                { name: 'Grades & Results', path: '/admin/grades' },
                { name: 'Exam Reports', path: '/admin/exam-reports' }
            ]
        },
        {
            title: 'Event & Task Management',
            icon: '📋',
            color: '#f97316',
            items: [
                { name: 'Events', path: '/admin/events' },
                { name: 'Tasks', path: '/admin/tasks' },
                { name: 'Announcements', path: '/admin/announcements' }
            ]
        }
    ];

    if (loading) return <div className="p-8">Loading dashboard overview...</div>;

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Admin Dashboard</h1>
                <p>Welcome back, {user?.firstName}. Manage your institution efficiently.</p>
            </div>

            {/* Quick Stats */}
            <div className="dashboard-grid" style={{ marginBottom: '2rem' }}>
                <div className="dashboard-card">
                    <h4>📝 Admissions</h4>
                    <div className="stat-big">{stats?.applications?.pending || 0}</div>
                    <p className="text-small">Pending of {stats?.applications?.total || 0} Total</p>
                </div>
                <div className="dashboard-card" style={{ borderLeft: '4px solid #10b981' }}>
                    <h4>💰 Total Revenue</h4>
                    <div className="stat-big">${stats?.finance?.totalRevenue?.toLocaleString() || 0}</div>
                    <p className="text-small">Accumulated Payments</p>
                </div>
                <div className="dashboard-card" style={{ borderLeft: '4px solid #3b82f6' }}>
                    <h4>👨‍🎓 Active Students</h4>
                    <div className="stat-big">{stats?.users?.students || 0}</div>
                    <p className="text-small">Registered in registry</p>
                </div>
                <div className="dashboard-card" style={{ borderLeft: '4px solid #f59e0b' }}>
                    <h4>📚 Courses</h4>
                    <div className="stat-big">{stats?.academics?.courses || 0}</div>
                    <p className="text-small">Active catalog items</p>
                </div>
            </div>

            {/* Management Categories */}
            <div style={{ marginTop: '2rem' }}>
                <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: '600' }}>Management Center</h2>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '1.5rem'
                }}>
                    {managementCategories.map((category, index) => (
                        <div
                            key={index}
                            style={{
                                background: 'white',
                                borderRadius: '12px',
                                padding: '1.5rem',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                border: '1px solid #e5e7eb',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                                <span style={{ fontSize: '2rem', marginRight: '0.75rem' }}>{category.icon}</span>
                                <h3 style={{
                                    margin: 0,
                                    fontSize: '1.125rem',
                                    fontWeight: '600',
                                    color: category.color
                                }}>
                                    {category.title}
                                </h3>
                            </div>
                            <ul style={{
                                listStyle: 'none',
                                padding: 0,
                                margin: 0
                            }}>
                                {category.items.map((item, idx) => (
                                    <li key={idx} style={{ marginBottom: '0.5rem' }}>
                                        <button
                                            onClick={() => navigate(item.path)}
                                            style={{
                                                width: '100%',
                                                textAlign: 'left',
                                                padding: '0.75rem 1rem',
                                                background: '#f9fafb',
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                fontSize: '0.875rem',
                                                fontWeight: '500',
                                                color: '#374151',
                                                transition: 'all 0.2s ease'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = category.color;
                                                e.currentTarget.style.color = 'white';
                                                e.currentTarget.style.borderColor = category.color;
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = '#f9fafb';
                                                e.currentTarget.style.color = '#374151';
                                                e.currentTarget.style.borderColor = '#e5e7eb';
                                            }}
                                        >
                                            → {item.name}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
