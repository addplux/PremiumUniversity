import { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';

const LessonPlanning = () => {
    const [lessonPlans, setLessonPlans] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingPlan, setEditingPlan] = useState(null);
    const [formData, setFormData] = useState({
        subject: '',
        class: '',
        topic: '',
        date: '',
        period: '',
        duration: 60,
        objectives: [''],
        learningOutcomes: [''],
        teachingMethodology: '',
        resources: [''],
        activities: [{ activity: '', duration: 0, description: '' }],
        assessment: '',
        homework: '',
        notes: ''
    });

    useEffect(() => {
        fetchLessonPlans();
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
            subject: plan.subject,
            class: plan.class,
            topic: plan.topic,
            date: plan.date.split('T')[0],
            period: plan.period || '',
            duration: plan.duration,
            objectives: plan.objectives.length ? plan.objectives : [''],
            learningOutcomes: plan.learningOutcomes.length ? plan.learningOutcomes : [''],
            teachingMethodology: plan.teachingMethodology || '',
            resources: plan.resources.length ? plan.resources : [''],
            activities: plan.activities.length ? plan.activities : [{ activity: '', duration: 0, description: '' }],
            assessment: plan.assessment || '',
            homework: plan.homework || '',
            notes: plan.notes || ''
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
            subject: '',
            class: '',
            topic: '',
            date: '',
            period: '',
            duration: 60,
            objectives: [''],
            learningOutcomes: [''],
            teachingMethodology: '',
            resources: [''],
            activities: [{ activity: '', duration: 0, description: '' }],
            assessment: '',
            homework: '',
            notes: ''
        });
        setEditingPlan(null);
        setShowForm(false);
    };

    const addArrayField = (field) => {
        setFormData({ ...formData, [field]: [...formData[field], ''] });
    };

    const updateArrayField = (field, index, value) => {
        const updated = [...formData[field]];
        updated[index] = value;
        setFormData({ ...formData, [field]: updated });
    };

    const removeArrayField = (field, index) => {
        const updated = formData[field].filter((_, i) => i !== index);
        setFormData({ ...formData, [field]: updated });
    };

    const addActivity = () => {
        setFormData({
            ...formData,
            activities: [...formData.activities, { activity: '', duration: 0, description: '' }]
        });
    };

    const updateActivity = (index, field, value) => {
        const updated = [...formData.activities];
        updated[index][field] = value;
        setFormData({ ...formData, activities: updated });
    };

    const removeActivity = (index) => {
        const updated = formData.activities.filter((_, i) => i !== index);
        setFormData({ ...formData, activities: updated });
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
                                <label>Topic *</label>
                                <input
                                    type="text"
                                    value={formData.topic}
                                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
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
                                <label>Period</label>
                                <input
                                    type="text"
                                    value={formData.period}
                                    onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Duration (minutes) *</label>
                                <input
                                    type="number"
                                    value={formData.duration}
                                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Learning Objectives</label>
                            {formData.objectives.map((obj, index) => (
                                <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                    <input
                                        type="text"
                                        value={obj}
                                        onChange={(e) => updateArrayField('objectives', index, e.target.value)}
                                        placeholder="Enter objective"
                                    />
                                    <button type="button" onClick={() => removeArrayField('objectives', index)} className="btn-danger">Remove</button>
                                </div>
                            ))}
                            <button type="button" onClick={() => addArrayField('objectives')} className="btn-secondary">+ Add Objective</button>
                        </div>

                        <div className="form-group">
                            <label>Teaching Methodology</label>
                            <textarea
                                value={formData.teachingMethodology}
                                onChange={(e) => setFormData({ ...formData, teachingMethodology: e.target.value })}
                                rows="3"
                            />
                        </div>

                        <div className="form-group">
                            <label>Assessment</label>
                            <textarea
                                value={formData.assessment}
                                onChange={(e) => setFormData({ ...formData, assessment: e.target.value })}
                                rows="2"
                            />
                        </div>

                        <div className="form-group">
                            <label>Homework</label>
                            <textarea
                                value={formData.homework}
                                onChange={(e) => setFormData({ ...formData, homework: e.target.value })}
                                rows="2"
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <button type="submit" className="btn-primary">
                                {editingPlan ? 'Update' : 'Create'} Lesson Plan
                            </button>
                            <button type="button" onClick={resetForm} className="btn-secondary">Cancel</button>
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
                                <th>Date</th>
                                <th>Subject</th>
                                <th>Class</th>
                                <th>Topic</th>
                                <th>Duration</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {lessonPlans.map((plan) => (
                                <tr key={plan._id}>
                                    <td>{new Date(plan.date).toLocaleDateString()}</td>
                                    <td>{plan.subject}</td>
                                    <td>{plan.class}</td>
                                    <td>{plan.topic}</td>
                                    <td>{plan.duration} min</td>
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
