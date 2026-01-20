import { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';

const ClassworkManager = () => {
    const [classwork, setClasswork] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        subject: '',
        class: '',
        date: '',
        duration: 45,
        activityType: 'exercise',
        totalPoints: 10
    });

    useEffect(() => {
        fetchClasswork();
    }, []);

    const fetchClasswork = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/classwork`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setClasswork(response.data);
        } catch (error) {
            console.error('Error fetching classwork:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post(
                `${import.meta.env.VITE_API_URL}/api/classwork`,
                formData,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            resetForm();
            fetchClasswork();
        } catch (error) {
            console.error('Error saving classwork:', error);
            alert('Failed to save classwork');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this classwork?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${import.meta.env.VITE_API_URL}/api/classwork/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchClasswork();
        } catch (error) {
            console.error('Error deleting classwork:', error);
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            subject: '',
            class: '',
            date: '',
            duration: 45,
            activityType: 'exercise',
            totalPoints: 10
        });
        setShowForm(false);
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>✏️ Classwork Management</h1>
                <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
                    {showForm ? 'Cancel' : '+ Create Classwork'}
                </button>
            </div>

            {showForm && (
                <div className="card" style={{ marginBottom: '2rem' }}>
                    <h2>Create Classwork</h2>
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
                            <label>Description *</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows="3"
                                required
                            />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="form-group">
                                <label>Subject *</label>
                                <input
                                    type="text"
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Class *</label>
                                <input
                                    type="text"
                                    value={formData.class}
                                    onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Date *</label>
                                <input
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Duration (minutes)</label>
                                <input
                                    type="number"
                                    value={formData.duration}
                                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Activity Type *</label>
                                <select
                                    value={formData.activityType}
                                    onChange={(e) => setFormData({ ...formData, activityType: e.target.value })}
                                    required
                                >
                                    <option value="quiz">Quiz</option>
                                    <option value="discussion">Discussion</option>
                                    <option value="exercise">Exercise</option>
                                    <option value="presentation">Presentation</option>
                                    <option value="lab">Lab</option>
                                    <option value="project">Project</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Total Points</label>
                                <input
                                    type="number"
                                    value={formData.totalPoints}
                                    onChange={(e) => setFormData({ ...formData, totalPoints: parseInt(e.target.value) })}
                                />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <button type="submit" className="btn-primary">Create Classwork</button>
                            <button type="button" onClick={resetForm} className="btn-secondary">Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="card">
                <h2>Classwork Activities</h2>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Subject</th>
                                <th>Class</th>
                                <th>Date</th>
                                <th>Type</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {classwork.map((cw) => (
                                <tr key={cw._id}>
                                    <td>{cw.title}</td>
                                    <td>{cw.subject}</td>
                                    <td>{cw.class}</td>
                                    <td>{new Date(cw.date).toLocaleDateString()}</td>
                                    <td>
                                        <span className={`badge badge-${cw.activityType}`}>
                                            {cw.activityType}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`badge badge-${cw.status}`}>
                                            {cw.status}
                                        </span>
                                    </td>
                                    <td>
                                        <button onClick={() => handleDelete(cw._id)} className="btn-sm btn-danger">Delete</button>
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

export default ClassworkManager;
