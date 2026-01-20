import { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';

const CircularManager = () => {
    const [circulars, setCirculars] = useState([]);
    const [filteredCirculars, setFilteredCirculars] = useState([]);
    const [programmes, setProgrammes] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingCircular, setEditingCircular] = useState(null);

    // Filter states
    const [filters, setFilters] = useState({
        periodicSemester: '',
        programme: '',
        semester: '',
        batch: '',
        module: ''
    });

    // Form data
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        periodicSemester: '',
        programme: '',
        semester: '',
        batch: '',
        module: '',
        faculty: '',
        category: 'general',
        priority: 'medium',
        targetAudience: 'all',
        requiresAcknowledgment: false
    });

    // Predefined options
    const periodicSemesters = ['2024-2025', '2023-2024', '2022-2023', '2021-2022'];
    const semesters = ['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6'];
    const batches = ['2024', '2023', '2022', '2021', '2020'];
    const modules = [
        'Mathematics',
        'Physics',
        'Chemistry',
        'Biology',
        'Computer Science',
        'English',
        'History',
        'Geography',
        'Business Studies',
        'Economics'
    ];

    useEffect(() => {
        fetchCirculars();
        fetchProgrammes();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [filters, circulars]);

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

    const fetchProgrammes = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/programs`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProgrammes(response.data);
        } catch (error) {
            console.error('Error fetching programmes:', error);
        }
    };

    const applyFilters = () => {
        let filtered = [...circulars];

        if (filters.periodicSemester) {
            filtered = filtered.filter(c => c.periodicSemester === filters.periodicSemester);
        }
        if (filters.programme) {
            filtered = filtered.filter(c => c.programme?._id === filters.programme);
        }
        if (filters.semester) {
            filtered = filtered.filter(c => c.semester === filters.semester);
        }
        if (filters.batch) {
            filtered = filtered.filter(c => c.batch === filters.batch);
        }
        if (filters.module) {
            filtered = filtered.filter(c => c.module === filters.module);
        }

        setFilteredCirculars(filtered);
    };

    const handleSearch = () => {
        applyFilters();
    };

    const handleReset = () => {
        setFilters({
            periodicSemester: '',
            programme: '',
            semester: '',
            batch: '',
            module: ''
        });
    };

    const handleExport = () => {
        // Create CSV content
        const headers = ['Reference No', 'Circular Title', 'Periodic Semester', 'Faculty', 'Programme', 'Semester', 'Batch', 'Module', 'Published By', 'Date'];
        const csvContent = [
            headers.join(','),
            ...filteredCirculars.map(c => [
                `"${c.circularNumber}"`,
                `"${c.title}"`,
                `"${c.periodicSemester}"`,
                `"${c.faculty}"`,
                `"${c.programme?.name || 'N/A'}"`,
                `"${c.semester}"`,
                `"${c.batch}"`,
                `"${c.module}"`,
                `"${c.issuedBy?.name || 'N/A'}"`,
                `"${new Date(c.issuedDate).toLocaleDateString()}"`
            ].join(','))
        ].join('\\n');

        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `circulars_export_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            if (editingCircular) {
                await axios.put(
                    `${import.meta.env.VITE_API_URL}/api/circulars/${editingCircular._id}`,
                    formData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } else {
                await axios.post(
                    `${import.meta.env.VITE_API_URL}/api/circulars`,
                    formData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }
            resetForm();
            fetchCirculars();
        } catch (error) {
            console.error('Error saving circular:', error);
            alert('Failed to save circular');
        }
    };

    const handleEdit = (circular) => {
        setEditingCircular(circular);
        setFormData({
            title: circular.title || '',
            content: circular.content || '',
            periodicSemester: circular.periodicSemester || '',
            programme: circular.programme?._id || '',
            semester: circular.semester || '',
            batch: circular.batch || '',
            module: circular.module || '',
            faculty: circular.faculty || '',
            category: circular.category || 'general',
            priority: circular.priority || 'medium',
            targetAudience: circular.targetAudience || 'all',
            requiresAcknowledgment: circular.requiresAcknowledgment || false
        });
        setShowForm(true);
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
            periodicSemester: '',
            programme: '',
            semester: '',
            batch: '',
            module: '',
            faculty: '',
            category: 'general',
            priority: 'medium',
            targetAudience: 'all',
            requiresAcknowledgment: false
        });
        setEditingCircular(null);
        setShowForm(false);
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>📢 Circular Listing</h1>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn-secondary" onClick={handleExport}>
                        📤 Export Circulars
                    </button>
                    <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
                        {showForm ? 'Cancel' : '+ Add Circular'}
                    </button>
                </div>
            </div>

            {/* Filter Section */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>Search Filters</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                    <div className="form-group">
                        <label>Periodic Semester</label>
                        <select
                            value={filters.periodicSemester}
                            onChange={(e) => setFilters({ ...filters, periodicSemester: e.target.value })}
                        >
                            <option value="">All</option>
                            {periodicSemesters.map(ps => (
                                <option key={ps} value={ps}>{ps}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Programme</label>
                        <select
                            value={filters.programme}
                            onChange={(e) => setFilters({ ...filters, programme: e.target.value })}
                        >
                            <option value="">All</option>
                            {programmes.map(prog => (
                                <option key={prog._id} value={prog._id}>{prog.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Semester</label>
                        <select
                            value={filters.semester}
                            onChange={(e) => setFilters({ ...filters, semester: e.target.value })}
                        >
                            <option value="">All</option>
                            {semesters.map(sem => (
                                <option key={sem} value={sem}>{sem}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Batch</label>
                        <select
                            value={filters.batch}
                            onChange={(e) => setFilters({ ...filters, batch: e.target.value })}
                        >
                            <option value="">All</option>
                            {batches.map(batch => (
                                <option key={batch} value={batch}>{batch}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Module</label>
                        <select
                            value={filters.module}
                            onChange={(e) => setFilters({ ...filters, module: e.target.value })}
                        >
                            <option value="">All</option>
                            {modules.map(mod => (
                                <option key={mod} value={mod}>{mod}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn-primary" onClick={handleSearch}>
                        🔍 Search
                    </button>
                    <button className="btn-secondary" onClick={handleReset}>
                        🔄 Reset
                    </button>
                </div>
            </div>

            {/* Add/Edit Form */}
            {showForm && (
                <div className="card" style={{ marginBottom: '2rem' }}>
                    <h2>{editingCircular ? 'Edit Circular' : 'Add Circular'}</h2>
                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="form-group">
                                <label>Circular Title *</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>

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
                                <label>Periodic Semester *</label>
                                <select
                                    value={formData.periodicSemester}
                                    onChange={(e) => setFormData({ ...formData, periodicSemester: e.target.value })}
                                    required
                                >
                                    <option value="">Select Periodic Semester</option>
                                    {periodicSemesters.map(ps => (
                                        <option key={ps} value={ps}>{ps}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Programme *</label>
                                <select
                                    value={formData.programme}
                                    onChange={(e) => setFormData({ ...formData, programme: e.target.value })}
                                    required
                                >
                                    <option value="">Select Programme</option>
                                    {programmes.map(prog => (
                                        <option key={prog._id} value={prog._id}>{prog.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Semester *</label>
                                <select
                                    value={formData.semester}
                                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                                    required
                                >
                                    <option value="">Select Semester</option>
                                    {semesters.map(sem => (
                                        <option key={sem} value={sem}>{sem}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Batch *</label>
                                <select
                                    value={formData.batch}
                                    onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                                    required
                                >
                                    <option value="">Select Batch</option>
                                    {batches.map(batch => (
                                        <option key={batch} value={batch}>{batch}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Module *</label>
                                <select
                                    value={formData.module}
                                    onChange={(e) => setFormData({ ...formData, module: e.target.value })}
                                    required
                                >
                                    <option value="">Select Module</option>
                                    {modules.map(mod => (
                                        <option key={mod} value={mod}>{mod}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Faculty *</label>
                                <input
                                    type="text"
                                    value={formData.faculty}
                                    onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
                                    placeholder="Enter faculty name"
                                    required
                                />
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
                            <label>Content *</label>
                            <textarea
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                rows="6"
                                placeholder="Enter circular content"
                                required
                            />
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

            {/* Circular Table - 7 Columns */}
            <div className="card">
                <h2>Circular List ({filteredCirculars.length})</h2>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Reference No</th>
                                <th>Circular Title</th>
                                <th>Periodic Semester</th>
                                <th>Faculty</th>
                                <th>Programme / Semester / Batch / Module</th>
                                <th>Published By / Date</th>
                                <th>Operation</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCirculars.length === 0 ? (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                                        No circulars found
                                    </td>
                                </tr>
                            ) : (
                                filteredCirculars.map((circular) => (
                                    <tr key={circular._id}>
                                        <td><strong>{circular.circularNumber}</strong></td>
                                        <td>
                                            <div>
                                                <strong>{circular.title}</strong>
                                                <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.25rem' }}>
                                                    <span className={`badge badge-${circular.category}`} style={{ fontSize: '0.75rem' }}>
                                                        {circular.category}
                                                    </span>
                                                    {' '}
                                                    <span className={`badge badge-${circular.priority}`} style={{ fontSize: '0.75rem' }}>
                                                        {circular.priority}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{circular.periodicSemester}</td>
                                        <td>{circular.faculty}</td>
                                        <td>
                                            <div style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
                                                <div><strong>Programme:</strong> {circular.programme?.name || 'N/A'}</div>
                                                <div><strong>Semester:</strong> {circular.semester}</div>
                                                <div><strong>Batch:</strong> {circular.batch}</div>
                                                <div><strong>Module:</strong> {circular.module}</div>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
                                                <div><strong>By:</strong> {circular.issuedBy?.name || 'N/A'}</div>
                                                <div><strong>Date:</strong> {new Date(circular.issuedDate).toLocaleDateString()}</div>
                                                <div>
                                                    <span className={`badge badge-${circular.status}`} style={{ fontSize: '0.75rem' }}>
                                                        {circular.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                                                {circular.status === 'draft' && (
                                                    <button onClick={() => handlePublish(circular._id)} className="btn-sm">
                                                        📤 Publish
                                                    </button>
                                                )}
                                                <button onClick={() => handleEdit(circular)} className="btn-sm">
                                                    ✏️ Edit
                                                </button>
                                                <button onClick={() => handleDelete(circular._id)} className="btn-sm btn-danger">
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

export default CircularManager;
