import { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';

const ClassworkManager = () => {
    const [classwork, setClasswork] = useState([]);
    const [filteredClasswork, setFilteredClasswork] = useState([]);
    const [programmes, setProgrammes] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingClasswork, setEditingClasswork] = useState(null);

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
        periodicSemester: '',
        programme: '',
        semester: '',
        batch: '',
        module: '',
        faculty: '',
        date: '',
        duration: 45,
        activityType: 'exercise',
        totalPoints: 10,
        instructions: ''
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
        fetchClasswork();
        fetchProgrammes();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [filters, classwork]);

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
        let filtered = [...classwork];

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

        setFilteredClasswork(filtered);
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
        const headers = ['Classwork Title', 'Activity Type', 'Periodic Semester', 'Faculty', 'Programme', 'Semester', 'Batch', 'Module', 'Date'];
        const csvContent = [
            headers.join(','),
            ...filteredClasswork.map(c => [
                `"${c.title}"`,
                `"${c.activityType}"`,
                `"${c.periodicSemester}"`,
                `"${c.faculty}"`,
                `"${c.programme?.name || 'N/A'}"`,
                `"${c.semester}"`,
                `"${c.batch}"`,
                `"${c.module}"`,
                `"${new Date(c.date).toLocaleDateString()}"`
            ].join(','))
        ].join('\\n');

        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `classwork_export_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            if (editingClasswork) {
                await axios.put(
                    `${import.meta.env.VITE_API_URL}/api/classwork/${editingClasswork._id}`,
                    formData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } else {
                await axios.post(
                    `${import.meta.env.VITE_API_URL}/api/classwork`,
                    formData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }
            resetForm();
            fetchClasswork();
        } catch (error) {
            console.error('Error saving classwork:', error);
            alert('Failed to save classwork');
        }
    };

    const handleEdit = (cw) => {
        setEditingClasswork(cw);
        setFormData({
            title: cw.title || '',
            description: cw.description || '',
            periodicSemester: cw.periodicSemester || '',
            programme: cw.programme?._id || '',
            semester: cw.semester || '',
            batch: cw.batch || '',
            module: cw.module || '',
            faculty: cw.faculty || '',
            date: cw.date ? cw.date.split('T')[0] : '',
            duration: cw.duration || 45,
            activityType: cw.activityType || 'exercise',
            totalPoints: cw.totalPoints || 10,
            instructions: cw.instructions || ''
        });
        setShowForm(true);
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
            periodicSemester: '',
            programme: '',
            semester: '',
            batch: '',
            module: '',
            faculty: '',
            date: '',
            duration: 45,
            activityType: 'exercise',
            totalPoints: 10,
            instructions: ''
        });
        setEditingClasswork(null);
        setShowForm(false);
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>✏️ Classwork Listing</h1>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn-secondary" onClick={handleExport}>
                        📤 Export Classwork
                    </button>
                    <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
                        {showForm ? 'Cancel' : '+ Add Classwork'}
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
                    <h2>{editingClasswork ? 'Edit Classwork' : 'Add Classwork'}</h2>
                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="form-group">
                                <label>Classwork Title *</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
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
                                <label>Total Points</label>
                                <input
                                    type="number"
                                    value={formData.totalPoints}
                                    onChange={(e) => setFormData({ ...formData, totalPoints: parseInt(e.target.value) })}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Description *</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows="3"
                                placeholder="Enter classwork description"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Instructions</label>
                            <textarea
                                value={formData.instructions}
                                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                                rows="3"
                                placeholder="Enter detailed instructions"
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

            {/* Classwork Table - 5 Columns */}
            <div className="card">
                <h2>Classwork List ({filteredClasswork.length})</h2>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Classwork Title</th>
                                <th>Periodic Semester</th>
                                <th>Faculty</th>
                                <th>Programme / Semester / Batch / Module</th>
                                <th>Operation</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredClasswork.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                                        No classwork found
                                    </td>
                                </tr>
                            ) : (
                                filteredClasswork.map((cw) => (
                                    <tr key={cw._id}>
                                        <td>
                                            <div>
                                                <strong>{cw.title}</strong>
                                                <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.25rem' }}>
                                                    <span className={`badge badge-${cw.activityType}`} style={{ fontSize: '0.75rem' }}>
                                                        {cw.activityType}
                                                    </span>
                                                    {' '} Date: {new Date(cw.date).toLocaleDateString()} | Points: {cw.totalPoints}
                                                </div>
                                            </div>
                                        </td>
                                        <td>{cw.periodicSemester}</td>
                                        <td>{cw.faculty}</td>
                                        <td>
                                            <div style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
                                                <div><strong>Programme:</strong> {cw.programme?.name || 'N/A'}</div>
                                                <div><strong>Semester:</strong> {cw.semester}</div>
                                                <div><strong>Batch:</strong> {cw.batch}</div>
                                                <div><strong>Module:</strong> {cw.module}</div>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                                                <button onClick={() => handleEdit(cw)} className="btn-sm">
                                                    ✏️ Edit
                                                </button>
                                                <button onClick={() => handleDelete(cw._id)} className="btn-sm btn-danger">
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

export default ClassworkManager;
