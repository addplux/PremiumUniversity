import { useState, useEffect } from 'react';
import axios from 'axios';
import './ApplicationsManager.css';

const LectureManager = () => {
    const [lectures, setLectures] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [courses, setCourses] = useState([]);
    const [selectedLecture, setSelectedLecture] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [lecturesRes, teachersRes, coursesRes] = await Promise.all([
                axios.get('/lectures'),
                axios.get('/teachers'),
                axios.get('/courses')
            ]);

            if (lecturesRes.data.success) setLectures(lecturesRes.data.data);
            if (teachersRes.data.success) setTeachers(teachersRes.data.data);
            if (coursesRes.data.success) setCourses(coursesRes.data.data);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (lectureId) => {
        if (!window.confirm('Are you sure you want to delete this lecture?')) return;
        try {
            await axios.delete(`/lectures/${lectureId}`);
            setLectures(prev => prev.filter(l => l._id !== lectureId));
            if (selectedLecture?._id === lectureId) setSelectedLecture(null);
            alert('Lecture deleted successfully');
        } catch (error) {
            console.error('Failed to delete lecture:', error);
            alert('Failed to delete lecture');
        }
    };

    return (
        <div className="apps-manager">
            <div className="manager-header">
                <h1>Lecture Manager</h1>
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
                    + Add Lecture
                </button>
            </div>

            {showAddForm && (
                <AddLectureForm
                    teachers={teachers}
                    courses={courses}
                    onClose={() => setShowAddForm(false)}
                    onSuccess={() => {
                        setShowAddForm(false);
                        fetchData();
                    }}
                />
            )}

            <div className="manager-content">
                <div className="apps-list-sidebar">
                    {loading ? <p>Loading...</p> : lectures.map(lecture => (
                        <div
                            key={lecture._id}
                            className={`app-item ${selectedLecture?._id === lecture._id ? 'active' : ''}`}
                            onClick={() => setSelectedLecture(lecture)}
                        >
                            <div className="app-item-header">
                                <span className="app-name">{lecture.title}</span>
                            </div>
                            <p className="app-program">{lecture.course?.code} - {lecture.course?.title}</p>
                            <p className="app-date">{lecture.schedule?.day} {lecture.schedule?.startTime}</p>
                        </div>
                    ))}
                </div>

                <div className="app-detail-view">
                    {selectedLecture ? (
                        <LectureDetail lecture={selectedLecture} onDelete={handleDelete} />
                    ) : (
                        <div className="no-selection">
                            <p>Select a lecture to view details</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const LectureDetail = ({ lecture, onDelete }) => (
    <div className="app-detail-container">
        <div className="detail-header">
            <div>
                <h2>{lecture.title}</h2>
                <p className="detail-program">Course: <strong>{lecture.course?.code} - {lecture.course?.title}</strong></p>
            </div>
            <button
                onClick={() => onDelete(lecture._id)}
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
                <h3>Lecture Details</h3>
                <div className="info-grid">
                    <InfoItem label="Teacher" value={`${lecture.teacher?.firstName} ${lecture.teacher?.lastName} (${lecture.teacher?.employeeId})`} />
                    <InfoItem label="Room" value={lecture.room} />
                    <InfoItem label="Semester" value={lecture.semester} />
                    <InfoItem label="Academic Year" value={lecture.academicYear} />
                </div>
            </section>

            <section className="detail-section">
                <h3>Schedule</h3>
                <div className="info-grid">
                    <InfoItem label="Day" value={lecture.schedule?.day} />
                    <InfoItem label="Start Time" value={lecture.schedule?.startTime} />
                    <InfoItem label="End Time" value={lecture.schedule?.endTime} />
                </div>
            </section>

            {lecture.description && (
                <section className="detail-section">
                    <h3>Description</h3>
                    <p>{lecture.description}</p>
                </section>
            )}
        </div>
    </div>
);

const InfoItem = ({ label, value }) => (
    <div className="info-item">
        <label>{label}</label>
        <p>{value || '-'}</p>
    </div>
);

const AddLectureForm = ({ teachers, courses, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        title: '',
        course: '',
        teacher: '',
        schedule: { day: 'Monday', startTime: '', endTime: '' },
        room: '',
        semester: '',
        academicYear: '',
        description: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await axios.post('/lectures', formData);
            if (res.data.success) {
                alert('Lecture added successfully!');
                onSuccess();
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to add lecture');
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
                    <h2 style={{ margin: 0 }}>Add New Lecture</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
                </div>

                {error && <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Title *</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                                style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Course *</label>
                            <select
                                value={formData.course}
                                onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                                required
                                style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                            >
                                <option value="">Select Course</option>
                                {courses.map(c => (
                                    <option key={c._id} value={c._id}>{c.code} - {c.title}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Teacher *</label>
                            <select
                                value={formData.teacher}
                                onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
                                required
                                style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                            >
                                <option value="">Select Teacher</option>
                                {teachers.map(t => (
                                    <option key={t._id} value={t._id}>{t.firstName} {t.lastName} ({t.employeeId})</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Day *</label>
                            <select
                                value={formData.schedule.day}
                                onChange={(e) => setFormData({ ...formData, schedule: { ...formData.schedule, day: e.target.value } })}
                                style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                            >
                                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                                    <option key={day} value={day}>{day}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Start Time *</label>
                            <input
                                type="time"
                                value={formData.schedule.startTime}
                                onChange={(e) => setFormData({ ...formData, schedule: { ...formData.schedule, startTime: e.target.value } })}
                                required
                                style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>End Time *</label>
                            <input
                                type="time"
                                value={formData.schedule.endTime}
                                onChange={(e) => setFormData({ ...formData, schedule: { ...formData.schedule, endTime: e.target.value } })}
                                required
                                style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Room</label>
                            <input
                                type="text"
                                value={formData.room}
                                onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                                style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Semester</label>
                            <input
                                type="text"
                                value={formData.semester}
                                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                                placeholder="e.g., Fall 2024"
                                style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Academic Year</label>
                            <input
                                type="text"
                                value={formData.academicYear}
                                onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                                placeholder="e.g., 2024-2025"
                                style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                            />
                        </div>

                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                                style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                        <button type="button" onClick={onClose} style={{ padding: '0.7rem 1.5rem', border: '1px solid #cbd5e1', background: 'white', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Cancel</button>
                        <button type="submit" disabled={loading} style={{ padding: '0.7rem 1.5rem', border: 'none', background: loading ? '#94a3b8' : '#3b82f6', color: 'white', borderRadius: '6px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: '600' }}>
                            {loading ? 'Adding...' : 'Add Lecture'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LectureManager;
