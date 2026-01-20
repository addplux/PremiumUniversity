import { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        role: 'student'
    });

    useEffect(() => {
        fetchUsers();
    }, [roleFilter]);

    const fetchUsers = async () => {
        try {
            const params = {};
            if (roleFilter) params.role = roleFilter;

            const res = await axios.get('/users', { params });
            if (res.data.success) {
                setUsers(res.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
            alert('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('/users', formData);
            if (res.data.success) {
                alert('User created successfully!');
                setShowCreateModal(false);
                setFormData({
                    firstName: '',
                    lastName: '',
                    email: '',
                    phone: '',
                    password: '',
                    role: 'student'
                });
                fetchUsers();
            }
        } catch (error) {
            console.error('Failed to create user:', error);
            alert(error.response?.data?.message || 'Failed to create user');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!confirm('Are you sure you want to delete this user?')) return;

        try {
            const res = await axios.delete(`/users/${userId}`);
            if (res.data.success) {
                alert('User deleted successfully');
                fetchUsers();
            }
        } catch (error) {
            console.error('Failed to delete user:', error);
            alert(error.response?.data?.message || 'Failed to delete user');
        }
    };

    const handleChangeRole = async (userId, newRole) => {
        if (!confirm(`Change user role to ${newRole}?`)) return;

        try {
            const res = await axios.put(`/users/${userId}/role`, { role: newRole });
            if (res.data.success) {
                alert('Role updated successfully');
                fetchUsers();
            }
        } catch (error) {
            console.error('Failed to update role:', error);
            alert(error.response?.data?.message || 'Failed to update role');
        }
    };

    const filteredUsers = users.filter(user =>
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-8">Loading users...</div>;

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>👥 User Management</h1>
                <p>Create, edit, and manage user accounts</p>
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                />
                <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                >
                    <option value="">All Roles</option>
                    <option value="student">Students</option>
                    <option value="finance_admin">Finance Admins</option>
                    <option value="academic_admin">Academic Admins</option>
                    <option value="system_admin">System Admins</option>
                </select>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="btn-primary"
                    style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', backgroundColor: '#3b82f6', color: 'white', border: 'none', cursor: 'pointer' }}
                >
                    ➕ Create User
                </button>
            </div>

            {/* Users Table */}
            <div className="dashboard-section">
                <div className="applications-table">
                    <div className="table-row" style={{ fontWeight: 'bold', backgroundColor: '#f9fafb' }}>
                        <div className="table-cell">Name</div>
                        <div className="table-cell">Email</div>
                        <div className="table-cell">Role</div>
                        <div className="table-cell">Actions</div>
                    </div>
                    {filteredUsers.map((user) => (
                        <div key={user._id} className="table-row">
                            <div className="table-cell">
                                <strong>{user.firstName} {user.lastName}</strong>
                                <p className="text-small">{user.phone}</p>
                            </div>
                            <div className="table-cell">{user.email}</div>
                            <div className="table-cell">
                                <select
                                    value={user.role}
                                    onChange={(e) => handleChangeRole(user._id, e.target.value)}
                                    style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #e5e7eb' }}
                                >
                                    <option value="student">Student</option>
                                    <option value="finance_admin">Finance Admin</option>
                                    <option value="academic_admin">Academic Admin</option>
                                    <option value="system_admin">System Admin</option>
                                </select>
                            </div>
                            <div className="table-cell">
                                <button
                                    onClick={() => handleDeleteUser(user._id)}
                                    style={{ padding: '0.5rem 1rem', borderRadius: '4px', backgroundColor: '#ef4444', color: 'white', border: 'none', cursor: 'pointer' }}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                    {filteredUsers.length === 0 && <p>No users found.</p>}
                </div>
            </div>

            {/* Create User Modal */}
            {showCreateModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '2rem',
                        borderRadius: '12px',
                        maxWidth: '500px',
                        width: '100%'
                    }}>
                        <h2>Create New User</h2>
                        <form onSubmit={handleCreateUser}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>First Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                                />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Last Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                                />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Email</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                                />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Phone</label>
                                <input
                                    type="tel"
                                    required
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                                />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Password</label>
                                <input
                                    type="password"
                                    required
                                    minLength={6}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                                />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Role</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                                >
                                    <option value="student">Student</option>
                                    <option value="finance_admin">Finance Admin</option>
                                    <option value="academic_admin">Academic Admin</option>
                                    <option value="system_admin">System Admin</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                <button
                                    type="submit"
                                    style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', backgroundColor: '#3b82f6', color: 'white', border: 'none', cursor: 'pointer' }}
                                >
                                    Create User
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', backgroundColor: '#6b7280', color: 'white', border: 'none', cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
