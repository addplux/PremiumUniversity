import { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';

const HomeworkManager = () => {
    const [homework, setHomework] = useState([]);
    const [filteredHomework, setFilteredHomework] = useState([]);
    const [programmes, setProgrammes] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingHomework, setEditingHomework] = useState(null);

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
        dueDate: '',
        totalPoints: 100,
        instructions: '',
        allowLateSubmission: true
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
        fetchHomework();
        fetchProgrammes();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [filters, homework]);

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
        let filtered = [...homework];

        if (filters.periodicSemester) {
            filtered = filtered.filter(h => h.periodicSemester === filters.periodicSemester);
        }
        if (filters.programme) {
            filtered = filtered.filter(h => h.programme?._id === filters.programme);
        }
        if (filters.semester) {
            filtered = filtered.filter(h => h.semester === filters.semester);
        }
        if (filters.batch) {
            filtered = filtered.filter(h => h.batch === filters.batch);
        }
        if (filters.module) {
            filtered = filtered.filter(h => h.module === filters.module);
        }

        setFilteredHomework(filtered);
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
        const headers = ['Assignment Title', 'Periodic Semester', 'Faculty', 'Programme', 'Semester', 'Batch', 'Module', 'Due Date', 'Points'];
        const csvContent = [
            headers.join(','),
            ...filteredHomework.map(h => [
                `"${h.title}"`,
                `"${h.periodicSemester}"`,
                `"${h.faculty}"`,
                `"${h.programme?.name || 'N/A'}"`,
                `"${h.semester}"`,
                `"${h.batch}"`,
                `"${h.module}"`,
                `"${new Date(h.dueDate).toLocaleDateString()}"`,
                `"${h.totalPoints}"`
            ].join(','))
        ].join('\\n');

        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `assignments_export_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            if (editingHomework) {
                await axios.put(
                    `${import.meta.env.VITE_API_URL}/api/homework/${editingHomework._id}`,
                    formData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } else {
                await axios.post(
                    `${import.meta.env.VITE_API_URL}/api/homework`,
                    formData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }
            resetForm();
            fetchHomework();
        } catch (error) {
            console.error('Error saving homework:', error);
            alert('Failed to save assignment');
        }
    };

    const handleEdit = (hw) => {
        setEditingHomework(hw);
        setFormData({
            title: hw.title || '',
            description: hw.description || '',
            periodicSemester: hw.periodicSemester || '',
            programme: hw.programme?._id || '',
            semester: hw.semester || '',
            batch: hw.batch || '',
            module: hw.module || '',
            faculty: hw.faculty || '',
            dueDate: hw.dueDate ? hw.dueDate.split('T')[0] : '',
            totalPoints: hw.totalPoints || 100,
            instructions: hw.instructions || '',
            allowLateSubmission: hw.allowLateSubmission !== undefined ? hw.allowLateSubmission : true
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this assignment?')) return;
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
            periodicSemester: '',
            programme: '',
            semester: '',
            batch: '',
            module: '',
            faculty: '',
            dueDate: '',
            totalPoints: 100,
            instructions: '',
            allowLateSubmission: true
        });
        setEditingHomework(null);
        setShowForm(false);
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>📝 Assignment Listing</h1>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn-secondary" onClick={handleExport}>
                        📤 Export Assignments
                    </button>
                    <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
                        {showForm ? 'Cancel' : '+ Add Assignment'}
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
                    <h2>{editingHomework ? 'Edit Assignment' : 'Add Assignment'}</h2>
                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="form-group">
                                <label>Assignment Title *</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
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
                                <label>Due Date *</label>
                                <input
                                    type="date"
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
                            <label>Description *</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows="3"
                                placeholder="Enter assignment description"
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

            {/* Assignment Table - 5 Columns */}
            <div className="card">
                <h2>Assignment List ({filteredHomework.length})</h2>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Assignment Title</th>
                                <th>Periodic Semester</th>
                                <th>Faculty</th>
                                <th>Programme / Semester / Batch / Module</th>
                                <th>Operation</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredHomework.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                                        No assignments found
                                    </td>
                                </tr>
                            ) : (
                                filteredHomework.map((hw) => (
                                    <tr key={hw._id}>
                                        <td>
                                            <div>
                                                <strong>{hw.title}</strong>
                                                <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.25rem' }}>
                                                    Due: {new Date(hw.dueDate).toLocaleDateString()} | Points: {hw.totalPoints}
                                                </div>
                                            </div>
                                        </td>
                                        <td>{hw.periodicSemester}</td>
                                        <td>{hw.faculty}</td>
                                        <td>
                                            <div style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
                                                <div><strong>Programme:</strong> {hw.programme?.name || 'N/A'}</div>
                                                <div><strong>Semester:</strong> {hw.semester}</div>
                                                <div><strong>Batch:</strong> {hw.batch}</div>
                                                <div><strong>Module:</strong> {hw.module}</div>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                                                <button onClick={() => handleEdit(hw)} className="btn-sm">
                                                    ✏️ Edit
                                                </button>
                                                <button onClick={() => handleDelete(hw._id)} className="btn-sm btn-danger">
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

export default HomeworkManager;
