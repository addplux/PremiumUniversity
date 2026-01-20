import { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';

const MaterialsManager = () => {
    const [materials, setMaterials] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'pdf',
        fileUrl: '',
        externalLink: '',
        subject: '',
        topic: '',
        tags: ''
    });

    useEffect(() => {
        fetchMaterials();
    }, []);

    const fetchMaterials = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/materials`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMaterials(response.data);
        } catch (error) {
            console.error('Error fetching materials:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const data = {
                ...formData,
                tags: formData.tags.split(',').map(t => t.trim()).filter(t => t)
            };
            await axios.post(
                `${import.meta.env.VITE_API_URL}/api/materials`,
                data,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            resetForm();
            fetchMaterials();
        } catch (error) {
            console.error('Error saving material:', error);
            alert('Failed to save material');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this material?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${import.meta.env.VITE_API_URL}/api/materials/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchMaterials();
        } catch (error) {
            console.error('Error deleting material:', error);
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            type: 'pdf',
            fileUrl: '',
            externalLink: '',
            subject: '',
            topic: '',
            tags: ''
        });
        setShowForm(false);
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>📁 Learning Materials</h1>
                <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
                    {showForm ? 'Cancel' : '+ Upload Material'}
                </button>
            </div>

            {showForm && (
                <div className="card" style={{ marginBottom: '2rem' }}>
                    <h2>Upload Learning Material</h2>
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
                            <label>Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows="3"
                            />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="form-group">
                                <label>Type *</label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    required
                                >
                                    <option value="pdf">PDF</option>
                                    <option value="video">Video</option>
                                    <option value="link">External Link</option>
                                    <option value="document">Document</option>
                                    <option value="presentation">Presentation</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Subject</label>
                                <input
                                    type="text"
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>File URL or External Link *</label>
                            <input
                                type="url"
                                value={formData.type === 'link' ? formData.externalLink : formData.fileUrl}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    [formData.type === 'link' ? 'externalLink' : 'fileUrl']: e.target.value
                                })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Tags (comma-separated)</label>
                            <input
                                type="text"
                                value={formData.tags}
                                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                placeholder="e.g., mathematics, algebra, grade-10"
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <button type="submit" className="btn-primary">Upload Material</button>
                            <button type="button" onClick={resetForm} className="btn-secondary">Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="card">
                <h2>Materials Library</h2>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Type</th>
                                <th>Subject</th>
                                <th>Views</th>
                                <th>Downloads</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {materials.map((material) => (
                                <tr key={material._id}>
                                    <td>{material.title}</td>
                                    <td>
                                        <span className={`badge badge-${material.type}`}>
                                            {material.type}
                                        </span>
                                    </td>
                                    <td>{material.subject || 'N/A'}</td>
                                    <td>{material.views || 0}</td>
                                    <td>{material.downloads || 0}</td>
                                    <td>
                                        <button onClick={() => handleDelete(material._id)} className="btn-sm btn-danger">Delete</button>
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

export default MaterialsManager;
