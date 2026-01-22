import { useState, useEffect } from 'react';
import axios from 'axios';
import './ApplicationsManager.css'; // Reusing consistency

const CourseManager = () => {
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        title: '', code: '', description: '', program: 'Registered Nursing', credits: 3, semester: 'Year 1 Semester 1'
    });

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const response = await axios.get('/courses');
            if (response.data.success) {
                setCourses(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch courses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (courseId) => {
        if (!window.confirm('Delete this course?')) return;
        try {
            await axios.delete(`/courses/${courseId}`);
            setCourses(prev => prev.filter(c => c._id !== courseId));
            if (selectedCourse?._id === courseId) setSelectedCourse(null);
        } catch (error) {
            alert('Failed to delete course');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (selectedCourse && showForm) {
                // Update mode
                const res = await axios.put(`/courses/${selectedCourse._id}`, formData);
                setCourses(prev => prev.map(c => c._id === selectedCourse._id ? res.data.data : c));
                setSelectedCourse(res.data.data);
                setShowForm(false);
                setFormData({ title: '', code: '', description: '', program: 'Registered Nursing', credits: 3, semester: 'Year 1 Semester 1' });
            } else {
                // Create mode
                const res = await axios.post('/courses', formData);
                setCourses([...courses, res.data.data]);
                setShowForm(false);
                setFormData({ title: '', code: '', description: '', program: 'Registered Nursing', credits: 3, semester: 'Year 1 Semester 1' });
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to save course');
        }
    };

    return (
        <div className="apps-manager">
            <div className="manager-header">
                <h1>Course Management</h1>
                <button
                    onClick={() => {
                        setSelectedCourse(null);
                        setFormData({ title: '', code: '', description: '', program: 'Registered Nursing', credits: 3, semester: 'Year 1 Semester 1' });
                        setShowForm(!showForm);
                    }}
                    style={{
                        background: 'var(--primary-color, #1a56db)',
                        color: 'white',
                        border: 'none',
                        padding: '0.5rem 1rem',
                        borderRadius: '6px',
                        cursor: 'pointer'
                    }}
                >
                    {showForm ? 'Cancel' : '+ Add Course'}
                </button>
            </div>

            <div className="manager-content">
                <div className="apps-list-sidebar">
                    {loading ? <p>Loading...</p> : courses.map(course => (
                        <div
                            key={course._id}
                            className={`app-item ${selectedCourse?._id === course._id ? 'active' : ''}`}
                            onClick={() => { setSelectedCourse(course); setShowForm(false); }}
                        >
                            <div className="app-item-header">
                                <span className="app-name">{course.code}</span>
                                <span className={`status-dot status-accepted`}></span>
                            </div>
                            <p className="app-program">{course.title}</p>
                            <p className="app-date">{course.program}</p>
                        </div>
                    ))}
                </div>

                <div className="app-detail-view">
                    {showForm ? (
                        <div className="app-detail-container">
                            <h2>{selectedCourse ? 'Edit Course' : 'Add New Course'}</h2>
                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '500px' }}>
                                <input placeholder="Course Code (e.g., NUR101)" value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} required className="status-select-large" />
                                <input placeholder="Course Title" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required className="status-select-large" />
                                <textarea placeholder="Description" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} required className="status-select-large" rows="4" />
                                <select value={formData.program} onChange={e => setFormData({ ...formData, program: e.target.value })} className="status-select-large">
                                    <option>Registered Nursing</option>
                                    <option>Clinical Medicine</option>
                                    <option>Environmental Health Technologist</option>
                                    <option>EN to RN Abridged</option>
                                </select>
                                <input placeholder="Credits" type="number" value={formData.credits} onChange={e => setFormData({ ...formData, credits: e.target.value })} required className="status-select-large" />
                                <input placeholder="Semester" value={formData.semester} onChange={e => setFormData({ ...formData, semester: e.target.value })} required className="status-select-large" />
                                <button type="submit" style={{ background: '#10b981', color: 'white', padding: '0.75rem', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                                    {selectedCourse ? 'Update Course' : 'Create Course'}
                                </button>
                            </form>
                        </div>
                    ) : selectedCourse ? (
                        <div className="app-detail-container">
                            <div className="detail-header">
                                <div>
                                    <h2>{selectedCourse.code}: {selectedCourse.title}</h2>
                                    <p className="detail-program">{selectedCourse.program}</p>
                                </div>
                                <div className="actions">
                                    <button
                                        onClick={() => {
                                            setFormData({
                                                title: selectedCourse.title,
                                                code: selectedCourse.code,
                                                description: selectedCourse.description,
                                                program: selectedCourse.program,
                                                credits: selectedCourse.credits,
                                                semester: selectedCourse.semester
                                            });
                                            setShowForm(true);
                                        }}
                                        style={{
                                            background: '#f3f4f6',
                                            color: '#374151',
                                            border: 'none',
                                            padding: '0.5rem 1rem',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            marginRight: '0.5rem'
                                        }}
                                    >
                                        Edit
                                    </button>
                                    <button onClick={() => handleDelete(selectedCourse._id)} style={{ background: '#fee2e2', color: '#b91c1c', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer' }}>Delete</button>
                                </div>
                            </div>
                            <div className="detail-grid" style={{ gridTemplateColumns: '1fr' }}>
                                <section className="detail-section">
                                    <h3>Course Details</h3>
                                    <p><strong>Credits:</strong> {selectedCourse.credits}</p>
                                    <p><strong>Semester:</strong> {selectedCourse.semester}</p>
                                    <p style={{ marginTop: '1rem', lineHeight: 1.6 }}>{selectedCourse.description}</p>
                                </section>
                            </div>
                        </div>
                    ) : (
                        <div className="no-selection">
                            <p>Select a course or add a new one</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CourseManager;
