import { useState, useEffect } from 'react';
import axios from 'axios';
import './ApplicationsManager.css'; // Reusing existing layout styles

const StudentRegistry = () => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [roleFilter, setRoleFilter] = useState('student');

    useEffect(() => {
        fetchUsers();
    }, [roleFilter]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/users?role=${roleFilter}`);
            if (response.data.success) {
                setUsers(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

        try {
            await axios.delete(`/users/${userId}`);
            setUsers(prev => prev.filter(u => u._id !== userId));
            if (selectedUser?._id === userId) setSelectedUser(null);
            alert('User deleted successfully');
        } catch (error) {
            console.error('Failed to delete user:', error);
            alert('Failed to delete user');
        }
    };

    return (
        <div className="apps-manager">
            <div className="manager-header">
                <h1>People Registry</h1>
                <div className="filters">
                    <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                        <option value="student">Students</option>
                        <option value="admin">Admins</option>
                        <option value="user">All Users</option>
                    </select>
                </div>
            </div>

            <div className="manager-content">
                <div className="apps-list-sidebar">
                    {loading ? <p>Loading...</p> : users.length === 0 ? <p className="p-4">No users found.</p> : users.map(user => (
                        <div
                            key={user._id}
                            className={`app-item ${selectedUser?._id === user._id ? 'active' : ''}`}
                            onClick={() => setSelectedUser(user)}
                        >
                            <div className="app-item-header">
                                <span className="app-name">{user.firstName} {user.lastName}</span>
                                <span className={`status-dot status-accepted`}></span>
                            </div>
                            <p className="app-program">{user.email}</p>
                            <p className="app-date">Joined: {new Date(user.createdAt).toLocaleDateString()}</p>
                        </div>
                    ))}
                </div>

                <div className="app-detail-view">
                    {selectedUser ? (
                        <UserDetail
                            user={selectedUser}
                            onDelete={handleDeleteUser}
                        />
                    ) : (
                        <div className="no-selection">
                            <p>Select a person to view details</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const UserDetail = ({ user, onDelete }) => {
    const [enrollments, setEnrollments] = useState([]);
    const [loadingEnrollments, setLoadingEnrollments] = useState(false);
    const [availableCourses, setAvailableCourses] = useState([]);
    const [showEnrollForm, setShowEnrollForm] = useState(false);
    const [selectedCourseId, setSelectedCourseId] = useState('');

    useEffect(() => {
        if (user) {
            fetchEnrollments();
            setShowEnrollForm(false);
        }
    }, [user._id]);

    const fetchEnrollments = async () => {
        setLoadingEnrollments(true);
        try {
            const res = await axios.get(`/enrollments/student/${user._id}`);
            if (res.data.success) {
                setEnrollments(res.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch enrollments:', error);
        } finally {
            setLoadingEnrollments(false);
        }
    };

    const fetchCourses = async () => {
        try {
            const res = await axios.get('/courses');
            if (res.data.success) {
                // Filter out already enrolled courses if needed, but backend blocks it.
                // UI filter is better.
                const enrolledIds = enrollments.map(e => e.course._id);
                setAvailableCourses(res.data.data.filter(c => !enrolledIds.includes(c._id)));
            }
        } catch (error) {
            console.error('Failed to fetch courses:', error);
        }
    };

    const handleEnroll = async () => {
        if (!selectedCourseId) return;
        try {
            const res = await axios.post('/enrollments', {
                courseId: selectedCourseId,
                studentId: user._id
            });
            if (res.data.success) {
                alert('Student enrolled successfully');
                fetchEnrollments(); // Refresh list
                setShowEnrollForm(false);
                setSelectedCourseId('');
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to enroll');
        }
    };

    const handleDrop = async (enrollmentId) => {
        if (!window.confirm('Are you sure you want to drop this course?')) return;
        try {
            await axios.delete(`/enrollments/${enrollmentId}`);
            setEnrollments(prev => prev.filter(e => e._id !== enrollmentId));
        } catch (error) {
            alert('Failed to drop course');
        }
    };

    const openEnrollForm = () => {
        setShowEnrollForm(true);
        fetchCourses();
    };

    return (
        <div className="app-detail-container">
            <div className="detail-header">
                <div>
                    <h2>{user.firstName} {user.lastName}</h2>
                    <p className="detail-program">Role: <strong>{user.role}</strong></p>
                </div>
                <div className="actions">
                    <button
                        onClick={() => onDelete(user._id)}
                        style={{
                            background: '#fee2e2',
                            color: '#b91c1c',
                            border: 'none',
                            padding: '0.5rem 1rem',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '600'
                        }}
                    >
                        Delete User
                    </button>
                </div>
            </div>

            <div className="detail-grid">
                <section className="detail-section">
                    <h3>Contact & Profile</h3>
                    <div className="info-grid">
                        <InfoItem label="Email" value={user.email} />
                        <InfoItem label="Phone" value={user.phone} />
                        <InfoItem label="City" value={user.city} />
                        <InfoItem label="Address" value={user.address} />
                        <InfoItem label="DOB" value={user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : '-'} />
                    </div>
                </section>

                <section className="detail-section">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3>Enrollment Status</h3>
                        <button
                            onClick={openEnrollForm}
                            style={{
                                background: '#dbeafe', color: '#1e40af', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem'
                            }}
                        >
                            + Enroll Course
                        </button>
                    </div>

                    {showEnrollForm && (
                        <div style={{ marginBottom: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                            <h4>Enroll in New Course</h4>
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                <select
                                    value={selectedCourseId}
                                    onChange={e => setSelectedCourseId(e.target.value)}
                                    style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                                >
                                    <option value="">Select a course...</option>
                                    {availableCourses.map(c => (
                                        <option key={c._id} value={c._id}>{c.code}: {c.title}</option>
                                    ))}
                                </select>
                                <button onClick={handleEnroll} style={{ background: '#10b981', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}>Save</button>
                                <button onClick={() => setShowEnrollForm(false)} style={{ background: '#94a3b8', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                            </div>
                        </div>
                    )}

                    {loadingEnrollments ? <p>Loading enrollments...</p> : enrollments.length === 0 ? (
                        <div className="info-alert" style={{ background: '#f0f9ff', padding: '1rem', borderRadius: '6px' }}>
                            <p style={{ margin: 0, color: '#0369a1' }}>No active enrollments found.</p>
                        </div>
                    ) : (
                        <div className="enrollments-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {enrollments.map(enr => (
                                <div key={enr._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                                    <div>
                                        <p style={{ margin: 0, fontWeight: '600' }}>{enr.course.code}</p>
                                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>{enr.course.title}</p>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <span className={`status-badge status-${enr.status}`} style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem', borderRadius: '99px', background: '#ecfdf5', color: '#059669' }}>{enr.status}</span>
                                        <button
                                            onClick={() => handleDrop(enr._id)}
                                            style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}
                                        >
                                            Drop
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

const InfoItem = ({ label, value }) => (
    <div className="info-item">
        <label>{label}</label>
        <p>{value || '-'}</p>
    </div>
);

export default StudentRegistry;
