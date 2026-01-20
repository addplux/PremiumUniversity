import { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';

const HomeworkManager = () => {
    const [homework, setHomework] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        subject: '',
        class: '',
        dueDate: '',
        totalPoints: 100,
        instructions: '',
        allowLateSubmission: true
    });

    useEffect(() => {
        fetchHomework();
    }, []);

    const fetchHomework = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/homework`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setHomework(response.data);
        } catch (error) {
            console.error('Error fetching homework:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post(
                `${import.meta.env.VITE_API_URL}/api/homework`,
                formData,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            resetForm();
            fetchHomework();
        } catch (error) {
            console.error('Error saving homework:', error);
            alert('Failed to save homework');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this homework?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${import.meta.env.VITE_API_URL}/api/homework/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchHomework();
        } catch (error) {
            console.error('Error deleting homework:', error);
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            subject: '',
            class: '',
            dueDate: '',
            totalPoints: 100,
            instructions: '',
            allowLateSubmission: true
        });
        setShowForm(false);
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>📝 Homework Management</h1>
                <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
                    {showForm ? 'Cancel' : '+ Assign Homework'}
                </button>
            </div>

            {showForm && (
                <div className="card" style={{ marginBottom: '2rem' }}>
                    <h2>Assign Homework</h2>
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
                                <label>Due Date *</label>
                                <input
                                    type="datetime-local"
                                    value={formData.dueDate}
                                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Total Points *</label>
                                <input
                                    type="number"
                                    value={formData.totalPoints}
                                    onChange={(e) => setFormData({ ...formData, totalPoints: parseInt(e.target.value) })}
                                    required
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Instructions</label>
                            <textarea
                                value={formData.instructions}
                                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                                rows="3"
                            />
                        </div>
                        <div className="form-group">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={formData.allowLateSubmission}
                                    onChange={(e) => setFormData({ ...formData, allowLateSubmission: e.target.checked })}
                                />
                                {' '}Allow Late Submission
                            </label>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <button type="submit" className="btn-primary">Assign Homework</button>
                            <button type="button" onClick={resetForm} className="btn-secondary">Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="card">
                <h2>Homework Assignments</h2>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Subject</th>
                                <th>Class</th>
                                <th>Due Date</th>
                                <th>Points</th>
                                <th>Submissions</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {homework.map((hw) => (
                                <tr key={hw._id}>
                                    <td>{hw.title}</td>
                                    <td>{hw.subject}</td>
                                    <td>{hw.class}</td>
                                    <td>{new Date(hw.dueDate).toLocaleString()}</td>
                                    <td>{hw.totalPoints}</td>
                                    <td>{hw.submissions?.length || 0}</td>
                                    <td>
                                        <span className={`badge badge-${hw.status}`}>
                                            {hw.status}
                                        </span>
                                    </td>
                                    <td>
                                        <button onClick={() => handleDelete(hw._id)} className="btn-sm btn-danger">Delete</button>
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

export default HomeworkManager;
