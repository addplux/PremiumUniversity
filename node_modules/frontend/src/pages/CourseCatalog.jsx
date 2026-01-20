import { useState, useEffect } from 'react';
import axios from 'axios';
import './ApplicationsManager.css'; // Reuse layout styles

const CourseCatalog = () => {
    const [courses, setCourses] = useState([]);
    const [myEnrollments, setMyEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [coursesRes, enrollRes] = await Promise.all([
                axios.get('/courses'),
                axios.get('/enrollments/my')
            ]);

            if (coursesRes.data.success) {
                setCourses(coursesRes.data.data);
            }
            if (enrollRes.data.success) {
                setMyEnrollments(enrollRes.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch catalog:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEnroll = async (courseId) => {
        if (!window.confirm('Confirm enrollment in this course?')) return;
        try {
            const response = await axios.post('/enrollments', { courseId });
            if (response.data.success) {
                alert('Successfully enrolled!');
                // Refresh data to show updated status
                fetchData();
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Enrollment failed');
        }
    };

    const isEnrolled = (courseId) => {
        return myEnrollments.some(enroll => enroll.course._id === courseId || enroll.course === courseId);
    };

    const filteredCourses = filter === 'all'
        ? courses
        : courses.filter(c => c.program === filter);

    return (
        <div className="apps-manager">
            <div className="manager-header">
                <h1>Course Catalog</h1>
                <div className="filters">
                    <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                        <option value="all">All Programs</option>
                        <option value="Registered Nursing">Registered Nursing</option>
                        <option value="Clinical Medicine">Clinical Medicine</option>
                        <option value="Environmental Health Technologist">Environmental Health</option>
                    </select>
                </div>
            </div>

            <div className="catalog-grid" style={{ padding: '0 2rem 2rem 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem', overflowY: 'auto' }}>
                {loading ? <p>Loading courses...</p> : filteredCourses.map(course => {
                    const enrolled = isEnrolled(course._id);
                    return (
                        <div key={course._id} className="course-card" style={{
                            background: 'white',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            padding: '1.5rem',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between'
                        }}>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#64748b', background: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>{course.code}</span>
                                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{course.credits} Credits</span>
                                </div>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: '#1e293b' }}>{course.title}</h3>
                                <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1rem', lineHeight: '1.5' }}>{course.description}</p>
                            </div>

                            <div style={{ marginTop: '1rem' }}>
                                {enrolled ? (
                                    <button disabled style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        background: '#ecfdf5',
                                        color: '#059669',
                                        border: '1px solid #10b981',
                                        borderRadius: '6px',
                                        fontWeight: '600',
                                        cursor: 'default'
                                    }}>
                                        ✓ Enrolled
                                    </button>
                                ) : (
                                    <button onClick={() => handleEnroll(course._id)} style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        background: 'var(--primary-color, #1a56db)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        fontWeight: '600',
                                        cursor: 'pointer'
                                    }}>
                                        Enroll Now
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CourseCatalog;
