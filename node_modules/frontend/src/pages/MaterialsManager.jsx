import { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';

const MaterialsManager = () => {
    const [materials, setMaterials] = useState([]);
    const [filteredMaterials, setFilteredMaterials] = useState([]);
    const [programmes, setProgrammes] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingMaterial, setEditingMaterial] = useState(null);

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
        description: '',
        type: 'pdf',
        periodicSemester: '',
        programme: '',
        semester: '',
        batch: '',
        module: '',
        faculty: '',
        fileUrl: '',
        externalLink: '',
        tags: ''
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
        fetchMaterials();
        fetchProgrammes();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [filters, materials]);

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
        let filtered = [...materials];

        if (filters.periodicSemester) {
            filtered = filtered.filter(m => m.periodicSemester === filters.periodicSemester);
        }
        if (filters.programme) {
            filtered = filtered.filter(m => m.programme?._id === filters.programme);
        }
        if (filters.semester) {
            filtered = filtered.filter(m => m.semester === filters.semester);
        }
        if (filters.batch) {
            filtered = filtered.filter(m => m.batch === filters.batch);
        }
        if (filters.module) {
            filtered = filtered.filter(m => m.module === filters.module);
        }

        setFilteredMaterials(filtered);
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
        const headers = ['Material Title', 'Type', 'Periodic Semester', 'Faculty', 'Programme', 'Semester', 'Batch', 'Module'];
        const csvContent = [
            headers.join(','),
            ...filteredMaterials.map(m => [
                `"${m.title}"`,
                `"${m.type}"`,
                `"${m.periodicSemester}"`,
                `"${m.faculty}"`,
                `"${m.programme?.name || 'N/A'}"`,
                `"${m.semester}"`,
                `"${m.batch}"`,
                `"${m.module}"`
            ].join(','))
        ].join('\\n');

        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `study_materials_export_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const data = {
                ...formData,
                tags: formData.tags.split(',').map(t => t.trim()).filter(t => t)
            };

            if (editingMaterial) {
                await axios.put(
                    `${import.meta.env.VITE_API_URL}/api/materials/${editingMaterial._id}`,
                    data,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } else {
                await axios.post(
                    `${import.meta.env.VITE_API_URL}/api/materials`,
                    data,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }
            resetForm();
            fetchMaterials();
        } catch (error) {
            console.error('Error saving material:', error);
            alert('Failed to save study material');
        }
    };

    const handleEdit = (material) => {
        setEditingMaterial(material);
        setFormData({
            title: material.title || '',
            description: material.description || '',
            type: material.type || 'pdf',
            periodicSemester: material.periodicSemester || '',
            programme: material.programme?._id || '',
            semester: material.semester || '',
            batch: material.batch || '',
            module: material.module || '',
            faculty: material.faculty || '',
            fileUrl: material.fileUrl || '',
            externalLink: material.externalLink || '',
            tags: material.tags?.join(', ') || ''
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this study material?')) return;
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
            periodicSemester: '',
            programme: '',
            semester: '',
            batch: '',
            module: '',
            faculty: '',
            fileUrl: '',
            externalLink: '',
            tags: ''
        });
        setEditingMaterial(null);
        setShowForm(false);
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>📁 Study Material Listing</h1>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn-secondary" onClick={handleExport}>
                        📤 Export Materials
                    </button>
                    <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
                        {showForm ? 'Cancel' : '+ Add Material'}
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
                    <h2>{editingMaterial ? 'Edit Study Material' : 'Add Study Material'}</h2>
                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="form-group">
                                <label>Material Title *</label>
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
                                    <option value="pdf">PDF</option>
                                    <option value="video">Video</option>
                                    <option value="link">External Link</option>
                                    <option value="document">Document</option>
                                    <option value="presentation">Presentation</option>
                                    <option value="image">Image</option>
                                    <option value="other">Other</option>
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
                                placeholder="https://example.com/file.pdf"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows="3"
                                placeholder="Enter material description"
                            />
                        </div>

                        <div className="form-group">
                            <label>Tags (comma-separated)</label>
                            <input
                                type="text"
                                value={formData.tags}
                                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                placeholder="e.g., textbook, notes, reference"
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

            {/* Materials Table - 5 Columns */}
            <div className="card">
                <h2>Study Material List ({filteredMaterials.length})</h2>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Material Title</th>
                                <th>Periodic Semester</th>
                                <th>Faculty</th>
                                <th>Programme / Semester / Batch / Module</th>
                                <th>Operation</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredMaterials.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                                        No study materials found
                                    </td>
                                </tr>
                            ) : (
                                filteredMaterials.map((material) => (
                                    <tr key={material._id}>
                                        <td>
                                            <div>
                                                <strong>{material.title}</strong>
                                                <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.25rem' }}>
                                                    <span className={`badge badge-${material.type}`} style={{ fontSize: '0.75rem' }}>
                                                        {material.type}
                                                    </span>
                                                    {' '} Views: {material.views || 0} | Downloads: {material.downloads || 0}
                                                </div>
                                            </div>
                                        </td>
                                        <td>{material.periodicSemester}</td>
                                        <td>{material.faculty}</td>
                                        <td>
                                            <div style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
                                                <div><strong>Programme:</strong> {material.programme?.name || 'N/A'}</div>
                                                <div><strong>Semester:</strong> {material.semester}</div>
                                                <div><strong>Batch:</strong> {material.batch}</div>
                                                <div><strong>Module:</strong> {material.module}</div>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                                                <button onClick={() => handleEdit(material)} className="btn-sm">
                                                    ✏️ Edit
                                                </button>
                                                <button onClick={() => handleDelete(material._id)} className="btn-sm btn-danger">
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

export default MaterialsManager;
