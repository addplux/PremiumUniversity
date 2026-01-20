import { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';

const CircularManager = () => {
    const [circulars, setCirculars] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        category: 'general',
        priority: 'medium',
        targetAudience: 'all',
        requiresAcknowledgment: false
    });

    useEffect(() => {
        fetchCirculars();
    }, []);

    const fetchCirculars = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/circulars`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCirculars(response.data);
        } catch (error) {
            console.error('Error fetching circulars:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post(
                `${import.meta.env.VITE_API_URL}/api/circulars`,
                formData,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            resetForm();
            fetchCirculars();
        } catch (error) {
            console.error('Error saving circular:', error);
            alert('Failed to save circular');
        }
    };

    const handlePublish = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(
                `${import.meta.env.VITE_API_URL}/api/circulars/${id}/publish`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchCirculars();
        } catch (error) {
            console.error('Error publishing circular:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this circular?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${import.meta.env.VITE_API_URL}/api/circulars/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchCirculars();
        } catch (error) {
            console.error('Error deleting circular:', error);
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            content: '',
            category: 'general',
            priority: 'medium',
            targetAudience: 'all',
            requiresAcknowledgment: false
        });
        setShowForm(false);
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>📢 Circular Management</h1>
                <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
                    {showForm ? 'Cancel' : '+ Create Circular'}
                </button>
            </div>

            {showForm && (
                <div className="card" style={{ marginBottom: '2rem' }}>
                    <h2>Create Circular</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Title *</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Content *</label>
                            <textarea
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                rows="6"
                                required
                            />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                            <div className="form-group">
                                <label>Category *</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    required
                                >
                                    <option value="academic">Academic</option>
                                    <option value="administrative">Administrative</option>
                                    <option value="event">Event</option>
                                    <option value="holiday">Holiday</option>
                                    <option value="exam">Exam</option>
                                    <option value="general">General</option>
                                    <option value="urgent">Urgent</option>
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
                            <label>
                                <input
                                    type="checkbox"
                                    checked={formData.requiresAcknowledgment}
                                    onChange={(e) => setFormData({ ...formData, requiresAcknowledgment: e.target.checked })}
                                />
                                {' '}Requires Acknowledgment
                            </label>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <button type="submit" className="btn-primary">Create Circular</button>
                            <button type="button" onClick={resetForm} className="btn-secondary">Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="card">
                <h2>Circulars</h2>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Number</th>
                                <th>Title</th>
                                <th>Category</th>
                                <th>Priority</th>
                                <th>Audience</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {circulars.map((circular) => (
                                <tr key={circular._id}>
                                    <td>{circular.circularNumber}</td>
                                    <td>{circular.title}</td>
                                    <td>
                                        <span className={`badge badge-${circular.category}`}>
                                            {circular.category}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`badge badge-${circular.priority}`}>
                                            {circular.priority}
                                        </span>
                                    </td>
                                    <td>{circular.targetAudience}</td>
                                    <td>
                                        <span className={`badge badge-${circular.status}`}>
                                            {circular.status}
                                        </span>
                                    </td>
                                    <td>
                                        {circular.status === 'draft' && (
                                            <button onClick={() => handlePublish(circular._id)} className="btn-sm">Publish</button>
                                        )}
                                        <button onClick={() => handleDelete(circular._id)} className="btn-sm btn-danger">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CircularManager;
