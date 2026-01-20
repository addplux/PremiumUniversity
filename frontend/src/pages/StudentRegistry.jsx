import { useState, useEffect } from 'react';
import axios from 'axios';
import './ApplicationsManager.css'; // Reusing existing layout styles

const StudentRegistry = () => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [roleFilter, setRoleFilter] = useState('student');
    const [showAddForm, setShowAddForm] = useState(false);
    const [showUpdateForm, setShowUpdateForm] = useState(false);
    const [searchRollNo, setSearchRollNo] = useState('');
    const [searching, setSearching] = useState(false);

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

    const handleSearchByRollNo = async () => {
        if (!searchRollNo.trim()) {
            alert('Please enter a roll number');
            return;
        }

        setSearching(true);
        try {
            const response = await axios.get(`/users/search/roll/${searchRollNo}`);
            if (response.data.success) {
                setSelectedUser(response.data.data);
                // Optionally filter the list to show only this student
                setUsers([response.data.data]);
            }
        } catch (error) {
            console.error('Failed to search student:', error);
            alert(error.response?.data?.message || 'Student not found');
        } finally {
            setSearching(false);
        }
    };

    const handlePrint = () => {
        if (!selectedUser) {
            alert('Please select a student to print');
            return;
        }
        window.print();
    };

    const handleBack = () => {
        setSelectedUser(null);
        setSearchRollNo('');
        fetchUsers(); // Reload full list
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
                <div className="filters" style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                        <option value="student">Students</option>
                        <option value="admin">Admins</option>
                        <option value="user">All Users</option>
                    </select>

                    {roleFilter === 'student' && (
                        <>
                            <input
                                type="text"
                                placeholder="Search by Roll Number"
                                value={searchRollNo}
                                onChange={(e) => setSearchRollNo(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearchByRollNo()}
                                style={{
                                    padding: '0.6rem',
                                    border: '1px solid #cbd5e1',
                                    borderRadius: '6px',
                                    fontSize: '0.95rem',
                                    minWidth: '200px'
                                }}
                            />
                            <button
                                onClick={handleSearchByRollNo}
                                disabled={searching}
                                style={{
                                    background: '#10b981',
                                    color: 'white',
                                    border: 'none',
                                    padding: '0.6rem 1rem',
                                    borderRadius: '6px',
                                    cursor: searching ? 'not-allowed' : 'pointer',
                                    fontWeight: '600',
                                    fontSize: '0.95rem'
                                }}
                            >
                                🔍 {searching ? 'Searching...' : 'Search'}
                            </button>
                            <button
                                onClick={handlePrint}
                                disabled={!selectedUser}
                                style={{
                                    background: selectedUser ? '#8b5cf6' : '#cbd5e1',
                                    color: 'white',
                                    border: 'none',
                                    padding: '0.6rem 1rem',
                                    borderRadius: '6px',
                                    cursor: selectedUser ? 'pointer' : 'not-allowed',
                                    fontWeight: '600',
                                    fontSize: '0.95rem'
                                }}
                            >
                                🖨️ Print
                            </button>
                            <button
                                onClick={() => setShowAddForm(true)}
                                style={{
                                    background: '#3b82f6',
                                    color: 'white',
                                    border: 'none',
                                    padding: '0.6rem 1rem',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    fontSize: '0.95rem'
                                }}
                            >
                                ➕ Add
                            </button>
                            <button
                                onClick={() => setShowUpdateForm(true)}
                                disabled={!selectedUser}
                                style={{
                                    background: selectedUser ? '#f59e0b' : '#cbd5e1',
                                    color: 'white',
                                    border: 'none',
                                    padding: '0.6rem 1rem',
                                    borderRadius: '6px',
                                    cursor: selectedUser ? 'pointer' : 'not-allowed',
                                    fontWeight: '600',
                                    fontSize: '0.95rem'
                                }}
                            >
                                ✏️ Update
                            </button>
                            <button
                                onClick={handleBack}
                                style={{
                                    background: '#64748b',
                                    color: 'white',
                                    border: 'none',
                                    padding: '0.6rem 1rem',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    fontSize: '0.95rem'
                                }}
                            >
                                ← Back
                            </button>
                        </>
                    )}
                </div>
            </div>

            {showAddForm && (
                <AddStudentForm
                    onClose={() => setShowAddForm(false)}
                    onSuccess={() => {
                        setShowAddForm(false);
                        fetchUsers();
                    }}
                />
            )}

            {showUpdateForm && selectedUser && (
                <UpdateStudentForm
                    student={selectedUser}
                    onClose={() => setShowUpdateForm(false)}
                    onSuccess={(updatedStudent) => {
                        setShowUpdateForm(false);
                        setSelectedUser(updatedStudent);
                        fetchUsers();
                    }}
                />
            )}

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

                {user.role === 'student' && (
                    <section className="detail-section">
                        <h3>Student Information</h3>
                        <div className="info-grid">
                            <InfoItem label="Roll Number" value={user.rollNo} />
                            <InfoItem label="Class" value={user.class} />
                            <InfoItem label="Course" value={user.course} />
                            <InfoItem label="Branch" value={user.branch} />
                            <InfoItem label="Batch" value={user.batch} />
                            <InfoItem label="Parents Name" value={user.parentsName} />
                        </div>
                    </section>
                )}

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

const AddStudentForm = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        dateOfBirth: '',
        address: '',
        city: '',
        rollNo: '',
        class: '',
        course: '',
        branch: '',
        batch: '',
        parentsName: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await axios.post('/users', {
                ...formData,
                role: 'student'
            });

            if (res.data.success) {
                alert('Student added successfully!');
                onSuccess();
            }
        } catch (error) {
            console.error('Failed to add student:', error);
            setError(error.response?.data?.message || 'Failed to add student');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
        }}>
            <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '2rem',
                maxWidth: '800px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ margin: 0 }}>Add New Student</h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '1.5rem',
                            cursor: 'pointer',
                            color: '#64748b'
                        }}
                    >
                        ×
                    </button>
                </div>

                {error && (
                    <div style={{
                        background: '#fee2e2',
                        color: '#b91c1c',
                        padding: '0.75rem',
                        borderRadius: '6px',
                        marginBottom: '1rem'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>First Name *</label>
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                required
                                style={{
                                    width: '100%',
                                    padding: '0.6rem',
                                    border: '1px solid #cbd5e1',
                                    borderRadius: '6px',
                                    fontSize: '0.95rem'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Last Name *</label>
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                required
                                style={{
                                    width: '100%',
                                    padding: '0.6rem',
                                    border: '1px solid #cbd5e1',
                                    borderRadius: '6px',
                                    fontSize: '0.95rem'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Email *</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                style={{
                                    width: '100%',
                                    padding: '0.6rem',
                                    border: '1px solid #cbd5e1',
                                    borderRadius: '6px',
                                    fontSize: '0.95rem'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Phone *</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                                style={{
                                    width: '100%',
                                    padding: '0.6rem',
                                    border: '1px solid #cbd5e1',
                                    borderRadius: '6px',
                                    fontSize: '0.95rem'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Password *</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                minLength={6}
                                style={{
                                    width: '100%',
                                    padding: '0.6rem',
                                    border: '1px solid #cbd5e1',
                                    borderRadius: '6px',
                                    fontSize: '0.95rem'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Date of Birth *</label>
                            <input
                                type="date"
                                name="dateOfBirth"
                                value={formData.dateOfBirth}
                                onChange={handleChange}
                                required
                                style={{
                                    width: '100%',
                                    padding: '0.6rem',
                                    border: '1px solid #cbd5e1',
                                    borderRadius: '6px',
                                    fontSize: '0.95rem'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Roll Number *</label>
                            <input
                                type="text"
                                name="rollNo"
                                value={formData.rollNo}
                                onChange={handleChange}
                                required
                                style={{
                                    width: '100%',
                                    padding: '0.6rem',
                                    border: '1px solid #cbd5e1',
                                    borderRadius: '6px',
                                    fontSize: '0.95rem'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Class *</label>
                            <input
                                type="text"
                                name="class"
                                value={formData.class}
                                onChange={handleChange}
                                required
                                placeholder="e.g., Year 1, Grade 10"
                                style={{
                                    width: '100%',
                                    padding: '0.6rem',
                                    border: '1px solid #cbd5e1',
                                    borderRadius: '6px',
                                    fontSize: '0.95rem'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Course *</label>
                            <input
                                type="text"
                                name="course"
                                value={formData.course}
                                onChange={handleChange}
                                required
                                placeholder="e.g., Computer Science"
                                style={{
                                    width: '100%',
                                    padding: '0.6rem',
                                    border: '1px solid #cbd5e1',
                                    borderRadius: '6px',
                                    fontSize: '0.95rem'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Branch *</label>
                            <input
                                type="text"
                                name="branch"
                                value={formData.branch}
                                onChange={handleChange}
                                required
                                placeholder="e.g., Main Campus"
                                style={{
                                    width: '100%',
                                    padding: '0.6rem',
                                    border: '1px solid #cbd5e1',
                                    borderRadius: '6px',
                                    fontSize: '0.95rem'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Batch *</label>
                            <input
                                type="text"
                                name="batch"
                                value={formData.batch}
                                onChange={handleChange}
                                required
                                placeholder="e.g., 2024, 2024-2028"
                                style={{
                                    width: '100%',
                                    padding: '0.6rem',
                                    border: '1px solid #cbd5e1',
                                    borderRadius: '6px',
                                    fontSize: '0.95rem'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Parents Name *</label>
                            <input
                                type="text"
                                name="parentsName"
                                value={formData.parentsName}
                                onChange={handleChange}
                                required
                                style={{
                                    width: '100%',
                                    padding: '0.6rem',
                                    border: '1px solid #cbd5e1',
                                    borderRadius: '6px',
                                    fontSize: '0.95rem'
                                }}
                            />
                        </div>

                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Address *</label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                required
                                style={{
                                    width: '100%',
                                    padding: '0.6rem',
                                    border: '1px solid #cbd5e1',
                                    borderRadius: '6px',
                                    fontSize: '0.95rem'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>City *</label>
                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                required
                                style={{
                                    width: '100%',
                                    padding: '0.6rem',
                                    border: '1px solid #cbd5e1',
                                    borderRadius: '6px',
                                    fontSize: '0.95rem'
                                }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                padding: '0.7rem 1.5rem',
                                border: '1px solid #cbd5e1',
                                background: 'white',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: '600'
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                padding: '0.7rem 1.5rem',
                                border: 'none',
                                background: loading ? '#94a3b8' : '#3b82f6',
                                color: 'white',
                                borderRadius: '6px',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                fontWeight: '600'
                            }}
                        >
                            {loading ? 'Adding...' : 'Add Student'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const UpdateStudentForm = ({ student, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        firstName: student.firstName || '',
        lastName: student.lastName || '',
        phone: student.phone || '',
        dateOfBirth: student.dateOfBirth ? student.dateOfBirth.split('T')[0] : '',
        address: student.address || '',
        city: student.city || '',
        rollNo: student.rollNo || '',
        class: student.class || '',
        course: student.course || '',
        branch: student.branch || '',
        batch: student.batch || '',
        parentsName: student.parentsName || ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await axios.put(`/users/${student._id}`, formData);

            if (res.data.success) {
                alert('Student updated successfully!');
                onSuccess(res.data.data);
            }
        } catch (error) {
            console.error('Failed to update student:', error);
            setError(error.response?.data?.message || 'Failed to update student');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
        }}>
            <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '2rem',
                maxWidth: '800px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ margin: 0 }}>Update Student</h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '1.5rem',
                            cursor: 'pointer',
                            color: '#64748b'
                        }}
                    >
                        ×
                    </button>
                </div>

                {error && (
                    <div style={{
                        background: '#fee2e2',
                        color: '#b91c1c',
                        padding: '0.75rem',
                        borderRadius: '6px',
                        marginBottom: '1rem'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>First Name</label>
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                style={{
                                    width: '100%',
                                    padding: '0.6rem',
                                    border: '1px solid #cbd5e1',
                                    borderRadius: '6px',
                                    fontSize: '0.95rem'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Last Name</label>
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                style={{
                                    width: '100%',
                                    padding: '0.6rem',
                                    border: '1px solid #cbd5e1',
                                    borderRadius: '6px',
                                    fontSize: '0.95rem'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Phone</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                style={{
                                    width: '100%',
                                    padding: '0.6rem',
                                    border: '1px solid #cbd5e1',
                                    borderRadius: '6px',
                                    fontSize: '0.95rem'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Date of Birth</label>
                            <input
                                type="date"
                                name="dateOfBirth"
                                value={formData.dateOfBirth}
                                onChange={handleChange}
                                style={{
                                    width: '100%',
                                    padding: '0.6rem',
                                    border: '1px solid #cbd5e1',
                                    borderRadius: '6px',
                                    fontSize: '0.95rem'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Roll Number</label>
                            <input
                                type="text"
                                name="rollNo"
                                value={formData.rollNo}
                                onChange={handleChange}
                                style={{
                                    width: '100%',
                                    padding: '0.6rem',
                                    border: '1px solid #cbd5e1',
                                    borderRadius: '6px',
                                    fontSize: '0.95rem'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Class</label>
                            <input
                                type="text"
                                name="class"
                                value={formData.class}
                                onChange={handleChange}
                                placeholder="e.g., Year 1, Grade 10"
                                style={{
                                    width: '100%',
                                    padding: '0.6rem',
                                    border: '1px solid #cbd5e1',
                                    borderRadius: '6px',
                                    fontSize: '0.95rem'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Course</label>
                            <input
                                type="text"
                                name="course"
                                value={formData.course}
                                onChange={handleChange}
                                placeholder="e.g., Computer Science"
                                style={{
                                    width: '100%',
                                    padding: '0.6rem',
                                    border: '1px solid #cbd5e1',
                                    borderRadius: '6px',
                                    fontSize: '0.95rem'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Branch</label>
                            <input
                                type="text"
                                name="branch"
                                value={formData.branch}
                                onChange={handleChange}
                                placeholder="e.g., Main Campus"
                                style={{
                                    width: '100%',
                                    padding: '0.6rem',
                                    border: '1px solid #cbd5e1',
                                    borderRadius: '6px',
                                    fontSize: '0.95rem'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Batch</label>
                            <input
                                type="text"
                                name="batch"
                                value={formData.batch}
                                onChange={handleChange}
                                placeholder="e.g., 2024, 2024-2028"
                                style={{
                                    width: '100%',
                                    padding: '0.6rem',
                                    border: '1px solid #cbd5e1',
                                    borderRadius: '6px',
                                    fontSize: '0.95rem'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Parents Name</label>
                            <input
                                type="text"
                                name="parentsName"
                                value={formData.parentsName}
                                onChange={handleChange}
                                style={{
                                    width: '100%',
                                    padding: '0.6rem',
                                    border: '1px solid #cbd5e1',
                                    borderRadius: '6px',
                                    fontSize: '0.95rem'
                                }}
                            />
                        </div>

                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Address</label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                style={{
                                    width: '100%',
                                    padding: '0.6rem',
                                    border: '1px solid #cbd5e1',
                                    borderRadius: '6px',
                                    fontSize: '0.95rem'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>City</label>
                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                style={{
                                    width: '100%',
                                    padding: '0.6rem',
                                    border: '1px solid #cbd5e1',
                                    borderRadius: '6px',
                                    fontSize: '0.95rem'
                                }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                padding: '0.7rem 1.5rem',
                                border: '1px solid #cbd5e1',
                                background: 'white',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: '600'
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                padding: '0.7rem 1.5rem',
                                border: 'none',
                                background: loading ? '#94a3b8' : '#f59e0b',
                                color: 'white',
                                borderRadius: '6px',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                fontWeight: '600'
                            }}
                        >
                            {loading ? 'Updating...' : 'Update Student'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Print styles
const printStyles = `
@media print {
    .apps-manager > *:not(.manager-content) {
        display: none !important;
    }
    .apps-list-sidebar {
        display: none !important;
    }
    .app-detail-view {
        width: 100% !important;
        max-width: 100% !important;
    }
    button {
        display: none !important;
    }
}
`;

// Inject print styles
if (typeof document !== 'undefined') {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = printStyles;
    document.head.appendChild(styleSheet);
}

export default StudentRegistry;
