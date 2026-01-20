import { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';

const NotificationCenter = () => {
    const [notifications, setNotifications] = useState([]);
    const [filter, setFilter] = useState('all');
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        fetchNotifications();
        fetchUnreadCount();
    }, [filter]);

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('token');
            const params = filter !== 'all' ? { isRead: filter === 'read' } : {};
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/notifications`, {
                headers: { Authorization: `Bearer ${token}` },
                params
            });
            setNotifications(response.data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const fetchUnreadCount = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/notifications/unread-count`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUnreadCount(response.data.count);
        } catch (error) {
            console.error('Error fetching unread count:', error);
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
            fetchUnreadCount();
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(
                `${import.meta.env.VITE_API_URL}/api/notifications/mark-all/read`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchNotifications();
            fetchUnreadCount();
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const handleDelete = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${import.meta.env.VITE_API_URL}/api/notifications/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchNotifications();
            fetchUnreadCount();
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const getPriorityIcon = (priority) => {
        switch (priority) {
            case 'urgent': return '🔴';
            case 'high': return '🟠';
            case 'medium': return '🟡';
            case 'low': return '🟢';
            default: return '⚪';
        }
    };

    const getTypeIcon = (type) => {
        const icons = {
            assignment: '📝',
            homework: '📚',
            exam: '📋',
            grade: '🎓',
            circular: '📢',
            announcement: '📣',
            fee: '💰',
            attendance: '✅',
            message: '💬',
            system: '⚙️',
            other: '📌'
        };
        return icons[type] || '📌';
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>🔔 Notification Center</h1>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <span className="badge badge-primary">{unreadCount} Unread</span>
                    <button className="btn-secondary" onClick={handleMarkAllAsRead}>
                        Mark All as Read
                    </button>
                </div>
            </div>

            <div className="card" style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        className={filter === 'all' ? 'btn-primary' : 'btn-secondary'}
                        onClick={() => setFilter('all')}
                    >
                        All
                    </button>
                    <button
                        className={filter === 'unread' ? 'btn-primary' : 'btn-secondary'}
                        onClick={() => setFilter('unread')}
                    >
                        Unread
                    </button>
                    <button
                        className={filter === 'read' ? 'btn-primary' : 'btn-secondary'}
                        onClick={() => setFilter('read')}
                    >
                        Read
                    </button>
                </div>
            </div>

            <div className="card">
                {notifications.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                        <p>No notifications to display</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {notifications.map((notification) => (
                            <div
                                key={notification._id}
                                style={{
                                    padding: '1rem',
                                    border: '1px solid #e0e0e0',
                                    borderRadius: '8px',
                                    backgroundColor: notification.isRead ? '#fff' : '#f0f7ff',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'start'
                                }}
                            >
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                        <span style={{ fontSize: '1.5rem' }}>
                                            {getTypeIcon(notification.type)}
                                        </span>
                                        <span style={{ fontSize: '1.2rem' }}>
                                            {getPriorityIcon(notification.priority)}
                                        </span>
                                        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>
                                            {notification.title}
                                        </h3>
                                        {!notification.isRead && (
                                            <span className="badge badge-primary">New</span>
                                        )}
                                    </div>
                                    <p style={{ margin: '0.5rem 0', color: '#555' }}>
                                        {notification.message}
                                    </p>
                                    <div style={{ fontSize: '0.85rem', color: '#888' }}>
                                        {new Date(notification.createdAt).toLocaleString()}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    {!notification.isRead && (
                                        <button
                                            onClick={() => handleMarkAsRead(notification._id)}
                                            className="btn-sm"
                                        >
                                            Mark Read
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDelete(notification._id)}
                                        className="btn-sm btn-danger"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationCenter;
