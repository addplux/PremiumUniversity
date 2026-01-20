import { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';

const NotificationCenter = () => {
    const [notifications, setNotifications] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingNotification, setEditingNotification] = useState(null);

    // Form data
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        type: 'info',
        priority: 'medium',
        targetAudience: 'all'
    });

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/notifications`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(response.data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const handleExport = () => {
        // Create CSV content
        const headers = ['Notification Title', 'Description', 'Status', 'Date', 'Type', 'Priority'];
        const csvContent = [
            headers.join(','),
            ...notifications.map(n => [
                `"${n.title}"`,
                `"${n.message}"`,
                `"${n.isRead ? 'Read' : 'Unread'}"`,
                `"${new Date(n.createdAt).toLocaleDateString()}"`,
                `"${n.type}"`,
                `"${n.priority}"`
            ].join(','))
        ].join('\\n');

        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `notifications_export_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            if (editingNotification) {
                await axios.put(
                    `${import.meta.env.VITE_API_URL}/api/notifications/${editingNotification._id}`,
                    formData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } else {
                await axios.post(
                    `${import.meta.env.VITE_API_URL}/api/notifications`,
                    formData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }
            resetForm();
            fetchNotifications();
        } catch (error) {
            console.error('Error saving notification:', error);
            alert('Failed to save notification');
        }
    };

    const handleEdit = (notification) => {
        setEditingNotification(notification);
        setFormData({
            title: notification.title || '',
            message: notification.message || '',
            type: notification.type || 'info',
            priority: notification.priority || 'medium',
            targetAudience: notification.targetAudience || 'all'
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this notification?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${import.meta.env.VITE_API_URL}/api/notifications/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchNotifications();
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(
                `${import.meta.env.VITE_API_URL}/api/notifications/${id}/read`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchNotifications();
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            message: '',
            type: 'info',
            priority: 'medium',
            targetAudience: 'all'
        });
        setEditingNotification(null);
        setShowForm(false);
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>🔔 Notification Center</h1>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn-secondary" onClick={handleExport}>
                        📤 Export Notifications
                    </button>
                    <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
                        {showForm ? 'Cancel' : '+ Add Notification'}
                    </button>
                </div>
            </div>

            {/* Add/Edit Form */}
            {showForm && (
                <div className="card" style={{ marginBottom: '2rem' }}>
                    <h2>{editingNotification ? 'Edit Notification' : 'Add Notification'}</h2>
                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="form-group">
                                <label>Notification Title *</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Type *</label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    required
                                >
                                    <option value="info">Info</option>
                                    <option value="success">Success</option>
                                    <option value="warning">Warning</option>
                                    <option value="error">Error</option>
                                    <option value="announcement">Announcement</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Priority *</label>
                                <select
                                    value={formData.priority}
                                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                    required
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                    <option value="urgent">Urgent</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Target Audience *</label>
                                <select
                                    value={formData.targetAudience}
                                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                                    required
                                >
                                    <option value="all">All</option>
                                    <option value="students">Students</option>
                                    <option value="teachers">Teachers</option>
                                    <option value="staff">Staff</option>
                                    <option value="parents">Parents</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Description *</label>
                            <textarea
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                rows="4"
                                placeholder="Enter notification message"
                                required
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                            <button type="submit" className="btn-primary">
                                Submit
                            </button>
                            <button type="button" onClick={resetForm} className="btn-secondary">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Notification Table - 5 Columns */}
            <div className="card">
                <h2>Notification List ({notifications.length})</h2>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Notification Title</th>
                                <th>Description</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th>Operation</th>
                            </tr>
                        </thead>
                        <tbody>
                            {notifications.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                                        No notifications found
                                    </td>
                                </tr>
                            ) : (
                                notifications.map((notification) => (
                                    <tr key={notification._id}>
                                        <td>
                                            <div>
                                                <strong>{notification.title}</strong>
                                                <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.25rem' }}>
                                                    <span className={`badge badge-${notification.type}`} style={{ fontSize: '0.75rem' }}>
                                                        {notification.type}
                                                    </span>
                                                    {' '}
                                                    <span className={`badge badge-${notification.priority}`} style={{ fontSize: '0.75rem' }}>
                                                        {notification.priority}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {notification.message}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge ${notification.isRead ? 'badge-success' : 'badge-warning'}`}>
                                                {notification.isRead ? 'Read' : 'Unread'}
                                            </span>
                                        </td>
                                        <td>{new Date(notification.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                                                {!notification.isRead && (
                                                    <button onClick={() => handleMarkAsRead(notification._id)} className="btn-sm">
                                                        ✓ Mark Read
                                                    </button>
                                                )}
                                                <button onClick={() => handleEdit(notification)} className="btn-sm">
                                                    ✏️ Edit
                                                </button>
                                                <button onClick={() => handleDelete(notification._id)} className="btn-sm btn-danger">
                                                    🗑️ Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default NotificationCenter;
