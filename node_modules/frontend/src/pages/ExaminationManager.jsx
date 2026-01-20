import { useState, useEffect } from 'react';
import axios from 'axios';
import './ApplicationsManager.css';

const ExaminationManager = () => {
    const [examinations, setExaminations] = useState([]);
    const [selectedExam, setSelectedExam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);

    useEffect(() => {
        fetchExaminations();
    }, []);

    const fetchExaminations = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/examinations');
            if (response.data.success) {
                setExaminations(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch examinations:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (examId) => {
        if (!window.confirm('Are you sure you want to delete this examination record?')) return;
        try {
            await axios.delete(`/examinations/${examId}`);
            setExaminations(prev => prev.filter(e => e._id !== examId));
            if (selectedExam?._id === examId) setSelectedExam(null);
            alert('Examination record deleted successfully');
        } catch (error) {
            console.error('Failed to delete examination:', error);
            alert('Failed to delete examination record');
        }
    };

    return (
        <div className="apps-manager">
            <div className="manager-header">
                <h1>Examination Manager</h1>
                <button
                    onClick={() => setShowAddForm(true)}
                    style={{
                        background: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        padding: '0.6rem 1.2rem',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '600'
                    }}
                >
                    + Add Student Marks
                </button>
            </div>

            {showAddForm && (
                <AddExaminationForm
                    onClose={() => setShowAddForm(false)}
                    onSuccess={() => {
                        setShowAddForm(false);
                        fetchExaminations();
                    }}
                />
            )}

            <div className="manager-content">
                <div className="apps-list-sidebar">
                    {loading ? <p>Loading...</p> : examinations.map(exam => (
                        <div
                            key={exam._id}
                            className={`app-item ${selectedExam?._id === exam._id ? 'active' : ''}`}
                            onClick={() => setSelectedExam(exam)}
                        >
                            <div className="app-item-header">
                                <span className="app-name">{exam.student?.firstName} {exam.student?.lastName}</span>
                                <span className="status-badge">GPA: {exam.gpa}</span>
                            </div>
                            <p className="app-program">Roll No: {exam.student?.rollNo}</p>
                            <p className="app-date">{exam.semester} - {exam.academicYear}</p>
                        </div>
                    ))}
                </div>

                <div className="app-detail-view">
                    {selectedExam ? (
                        <ExaminationDetail exam={selectedExam} onDelete={handleDelete} />
                    ) : (
                        <div className="no-selection">
                            <p>Select an examination record to view details</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const ExaminationDetail = ({ exam, onDelete }) => (
    <div className="app-detail-container">
        <div className="detail-header">
            <div>
                <h2>{exam.student?.firstName} {exam.student?.lastName}</h2>
                <p className="detail-program">Roll No: <strong>{exam.student?.rollNo}</strong> | {exam.semester} - {exam.academicYear}</p>
            </div>
            <button
                onClick={() => onDelete(exam._id)}
                style={{
                    background: '#fee2e2',
                    color: '#b91c1c',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '600'
                }}
            >
                Delete
            </button>
        </div>

        <div className="detail-grid">
            <section className="detail-section">
                <h3>Academic Performance</h3>
                <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', gap: '2rem', marginBottom: '1rem' }}>
                        <div>
                            <label style={{ fontSize: '0.875rem', color: '#64748b' }}>Semester GPA</label>
                            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6', margin: '0.25rem 0' }}>{exam.gpa}</p>
                        </div>
                        {exam.cgpa && (
                            <div>
                                <label style={{ fontSize: '0.875rem', color: '#64748b' }}>Cumulative GPA</label>
                                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981', margin: '0.25rem 0' }}>{exam.cgpa}</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <section className="detail-section">
                <h3>Course Marks</h3>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Course</th>
                                <th style={{ padding: '0.75rem', textAlign: 'center' }}>Marks</th>
                                <th style={{ padding: '0.75rem', textAlign: 'center' }}>Grade</th>
                            </tr>
                        </thead>
                        <tbody>
                            {exam.courses?.map((course, index) => (
                                <tr key={index} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '0.75rem' }}>{course.course}</td>
                                    <td style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '600' }}>{course.marks}/100</td>
                                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                        <span style={{
                                            background: course.grade.startsWith('A') ? '#dcfce7' : course.grade.startsWith('B') ? '#dbeafe' : course.grade.startsWith('C') ? '#fef3c7' : '#fee2e2',
                                            color: course.grade.startsWith('A') ? '#166534' : course.grade.startsWith('B') ? '#1e40af' : course.grade.startsWith('C') ? '#92400e' : '#991b1b',
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '9999px',
                                            fontWeight: '600',
                                            fontSize: '0.875rem'
                                        }}>
                                            {course.grade}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    </div>
);

const AddExaminationForm = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        rollNo: '',
        semester: '',
        academicYear: '',
        courses: [{ course: '', marks: '' }]
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const addCourse = () => {
        setFormData({
            ...formData,
            courses: [...formData.courses, { course: '', marks: '' }]
        });
    };

    const removeCourse = (index) => {
        setFormData({
            ...formData,
            courses: formData.courses.filter((_, i) => i !== index)
        });
    };

    const updateCourse = (index, field, value) => {
        const updatedCourses = [...formData.courses];
        updatedCourses[index][field] = value;
        setFormData({ ...formData, courses: updatedCourses });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await axios.post('/examinations', formData);
            if (res.data.success) {
                alert('Examination record added successfully!');
                onSuccess();
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to add examination record');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
        }}>
            <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '2rem',
                maxWidth: '700px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <h2 style={{ margin: 0 }}>Add Student Marks</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
                </div>

                {error && <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Student Roll Number *</label>
                            <input
                                type="text"
                                value={formData.rollNo}
                                onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                                required
                                placeholder="e.g., 2024001"
                                style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Semester *</label>
                            <input
                                type="text"
                                value={formData.semester}
                                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                                required
                                placeholder="e.g., Fall 2024, Semester 1"
                                style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                            />
                        </div>

                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Academic Year *</label>
                            <input
                                type="text"
                                value={formData.academicYear}
                                onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                                required
                                placeholder="e.g., 2024-2025"
                                style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 style={{ margin: 0 }}>Courses & Marks</h3>
                            <button
                                type="button"
                                onClick={addCourse}
                                style={{
                                    background: '#10b981',
                                    color: 'white',
                                    border: 'none',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '0.875rem',
                                    fontWeight: '600'
                                }}
                            >
                                + Add Course
                            </button>
                        </div>

                        {formData.courses.map((course, index) => (
                            <div key={index} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                <input
                                    type="text"
                                    value={course.course}
                                    onChange={(e) => updateCourse(index, 'course', e.target.value)}
                                    required
                                    placeholder="Course name"
                                    style={{ padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                                />
                                <input
                                    type="number"
                                    value={course.marks}
                                    onChange={(e) => updateCourse(index, 'marks', e.target.value)}
                                    required
                                    min="0"
                                    max="100"
                                    placeholder="Marks"
                                    style={{ padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                                />
                                {formData.courses.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeCourse(index)}
                                        style={{
                                            background: '#fee2e2',
                                            color: '#b91c1c',
                                            border: 'none',
                                            padding: '0.6rem',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontWeight: '600'
                                        }}
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                        <button type="button" onClick={onClose} style={{ padding: '0.7rem 1.5rem', border: '1px solid #cbd5e1', background: 'white', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Cancel</button>
                        <button type="submit" disabled={loading} style={{ padding: '0.7rem 1.5rem', border: 'none', background: loading ? '#94a3b8' : '#3b82f6', color: 'white', borderRadius: '6px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: '600' }}>
                            {loading ? 'Adding...' : 'Add Marks'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ExaminationManager;
