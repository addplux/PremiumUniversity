import { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';

const LessonPlanning = () => {
    const [lessonPlans, setLessonPlans] = useState([]);
    const [programmes, setProgrammes] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingPlan, setEditingPlan] = useState(null);
    const [formData, setFormData] = useState({
        programme: '',
        semester: '',
        batch: '',
        module: '',
        faculty: '',
        startDate: '',
        endDate: '',
        lectureCode: '',
        topic: '',
        description: ''
    });

    // Predefined options
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
        fetchLessonPlans();
        fetchProgrammes();
    }, []);

    const fetchLessonPlans = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/lesson-plans`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLessonPlans(response.data);
        } catch (error) {
            console.error('Error fetching lesson plans:', error);
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            if (editingPlan) {
                await axios.put(
                    `${import.meta.env.VITE_API_URL}/api/lesson-plans/${editingPlan._id}`,
                    formData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } else {
                await axios.post(
                    `${import.meta.env.VITE_API_URL}/api/lesson-plans`,
                    formData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }
            resetForm();
            fetchLessonPlans();
        } catch (error) {
            console.error('Error saving lesson plan:', error);
            alert('Failed to save lesson plan');
        }
    };

    const handleEdit = (plan) => {
        setEditingPlan(plan);
        setFormData({
            programme: plan.programme?._id || '',
            semester: plan.semester || '',
            batch: plan.batch || '',
            module: plan.module || '',
            faculty: plan.faculty || '',
            startDate: plan.startDate ? plan.startDate.split('T')[0] : '',
            endDate: plan.endDate ? plan.endDate.split('T')[0] : '',
            lectureCode: plan.lectureCode || '',
            topic: plan.topic || '',
            description: plan.description || ''
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this lesson plan?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${import.meta.env.VITE_API_URL}/api/lesson-plans/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchLessonPlans();
        } catch (error) {
            console.error('Error deleting lesson plan:', error);
        }
    };

    const resetForm = () => {
        setFormData({
            programme: '',
            semester: '',
            batch: '',
            module: '',
            faculty: '',
            startDate: '',
            endDate: '',
            lectureCode: '',
            topic: '',
            description: ''
        });
        setEditingPlan(null);
        setShowForm(false);
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>📝 Lesson Planning</h1>
                <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
                    {showForm ? 'Cancel' : '+ New Lesson Plan'}
                </button>
            </div>

            {showForm && (
                <div className="card" style={{ marginBottom: '2rem' }}>
                    <h2>{editingPlan ? 'Edit Lesson Plan' : 'Create Lesson Plan'}</h2>
                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="form-group">
                                <label>Programme *</label>
                                <select
                                    value={formData.programme}
                                    onChange={(e) => setFormData({ ...formData, programme: e.target.value })}
                                    required
                                >
                                    <option value="">Select Programme</option>
                                    {programmes.map((prog) => (
                                        <option key={prog._id} value={prog._id}>
                                            {prog.name}
                                        </option>
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
                                    {semesters.map((sem) => (
                                        <option key={sem} value={sem}>
                                            {sem}
                                        </option>
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
                                    {batches.map((batch) => (
                                        <option key={batch} value={batch}>
                                            {batch}
                                        </option>
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
                                    {modules.map((mod) => (
                                        <option key={mod} value={mod}>
                                            {mod}
                                        </option>
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
                                <label>Start Date *</label>
                                <input
                                    type="date"
                                    value={formData.startDate}
                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>End Date *</label>
                                <input
                                    type="date"
                                    value={formData.endDate}
                                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Attachment</label>
                                <input
                                    type="file"
                                    onChange={(e) => {
                                        // File handling would be implemented here
                                        console.log('File selected:', e.target.files[0]);
                                    }}
                                    accept=".pdf,.doc,.docx,.ppt,.pptx"
                                />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                            <div className="form-group">
                                <label>Lecture Code *</label>
                                <input
                                    type="text"
                                    value={formData.lectureCode}
                                    onChange={(e) => setFormData({ ...formData, lectureCode: e.target.value })}
                                    placeholder="e.g., CS101-L01"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Topic *</label>
                                <input
                                    type="text"
                                    value={formData.topic}
                                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                                    placeholder="Enter topic"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Description *</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows="4"
                                placeholder="Enter detailed description of the lesson plan"
                                required
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

            <div className="card">
                <h2>Lesson Plans</h2>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Lecture Code</th>
                                <th>Topic</th>
                                <th>Programme</th>
                                <th>Semester</th>
                                <th>Batch</th>
                                <th>Module</th>
                                <th>Start Date</th>
                                <th>End Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {lessonPlans.map((plan) => (
                                <tr key={plan._id}>
                                    <td>{plan.lectureCode}</td>
                                    <td>{plan.topic}</td>
                                    <td>{plan.programme?.name || 'N/A'}</td>
                                    <td>{plan.semester}</td>
                                    <td>{plan.batch}</td>
                                    <td>{plan.module}</td>
                                    <td>{new Date(plan.startDate).toLocaleDateString()}</td>
                                    <td>{new Date(plan.endDate).toLocaleDateString()}</td>
                                    <td>
                                        <span className={`badge badge-${plan.status}`}>
                                            {plan.status}
                                        </span>
                                    </td>
                                    <td>
                                        <button onClick={() => handleEdit(plan)} className="btn-sm">Edit</button>
                                        <button onClick={() => handleDelete(plan._id)} className="btn-sm btn-danger">Delete</button>
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

export default LessonPlanning;
