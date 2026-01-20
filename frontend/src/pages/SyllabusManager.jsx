import { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';

const SyllabusManager = () => {
    const [syllabi, setSyllabi] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingSyllabus, setEditingSyllabus] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        academicYear: '',
        semester: '1',
        description: '',
        objectives: [''],
        topics: [{ title: '', description: '', weekNumber: 1, duration: 0 }]
    });

    useEffect(() => {
        fetchSyllabi();
    }, []);

    const fetchSyllabi = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/syllabi`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSyllabi(response.data);
        } catch (error) {
            console.error('Error fetching syllabi:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            if (editingSyllabus) {
                await axios.put(
                    `${import.meta.env.VITE_API_URL}/api/syllabi/${editingSyllabus._id}`,
                    formData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } else {
                await axios.post(
                    `${import.meta.env.VITE_API_URL}/api/syllabi`,
                    formData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }
            resetForm();
            fetchSyllabi();
        } catch (error) {
            console.error('Error saving syllabus:', error);
            alert('Failed to save syllabus');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this syllabus?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${import.meta.env.VITE_API_URL}/api/syllabi/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchSyllabi();
        } catch (error) {
            console.error('Error deleting syllabus:', error);
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            academicYear: '',
            semester: '1',
            description: '',
            objectives: [''],
            topics: [{ title: '', description: '', weekNumber: 1, duration: 0 }]
        });
        setEditingSyllabus(null);
        setShowForm(false);
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>📚 Syllabus Management</h1>
                <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
                    {showForm ? 'Cancel' : '+ New Syllabus'}
                </button>
            </div>

            {showForm && (
                <div className="card" style={{ marginBottom: '2rem' }}>
                    <h2>{editingSyllabus ? 'Edit Syllabus' : 'Create Syllabus'}</h2>
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
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="form-group">
                                <label>Academic Year *</label>
                                <input
                                    type="text"
                                    value={formData.academicYear}
                                    onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                                    placeholder="e.g., 2024-2025"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Semester *</label>
                                <select
                                    value={formData.semester}
                                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                                    required
                                >
                                    <option value="1">Semester 1</option>
                                    <option value="2">Semester 2</option>
                                    <option value="3">Semester 3</option>
                                    <option value="Full Year">Full Year</option>
                                </select>
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows="3"
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <button type="submit" className="btn-primary">
                                {editingSyllabus ? 'Update' : 'Create'} Syllabus
                            </button>
                            <button type="button" onClick={resetForm} className="btn-secondary">Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="card">
                <h2>Syllabi</h2>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Academic Year</th>
                                <th>Semester</th>
                                <th>Status</th>
                                <th>Version</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {syllabi.map((syllabus) => (
                                <tr key={syllabus._id}>
                                    <td>{syllabus.title}</td>
                                    <td>{syllabus.academicYear}</td>
                                    <td>{syllabus.semester}</td>
                                    <td>
                                        <span className={`badge badge-${syllabus.status}`}>
                                            {syllabus.status}
                                        </span>
                                    </td>
                                    <td>v{syllabus.version}</td>
                                    <td>
                                        <button onClick={() => handleDelete(syllabus._id)} className="btn-sm btn-danger">Delete</button>
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

export default SyllabusManager;
