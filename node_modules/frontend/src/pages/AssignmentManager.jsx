import { useState, useEffect } from 'react';
import axios from 'axios';
import '../pages/ApplicationsManager.css';

const AssignmentManager = () => {
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [assignments, setAssignments] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [selectedAsm, setSelectedAsm] = useState(null);
    const [selectedSub, setSelectedSub] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [grading, setGrading] = useState({ grade: '', feedback: '' });
    const [formData, setFormData] = useState({
        title: '', description: '', deadline: '', maxPoints: 100
    });

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const res = await axios.get('/courses');
            if (res.data.success) {
                setCourses(res.data.data);
                if (res.data.data.length > 0) {
                    setSelectedCourse(res.data.data[0]);
                }
            }
        } catch (error) {
            console.error('Failed to fetch courses:', error);
        }
    };

    useEffect(() => {
        if (selectedCourse) {
            fetchAssignments(selectedCourse._id);
            setSelectedAsm(null);
            setSubmissions([]);
        }
    }, [selectedCourse]);

    const fetchAssignments = async (courseId) => {
        setLoading(true);
        try {
            const res = await axios.get(`/assignments/course/${courseId}`);
            if (res.data.success) {
                setAssignments(res.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch assignments:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSubmissions = async (asmId) => {
        try {
            const res = await axios.get(`/assignments/${asmId}/submissions`);
            if (res.data.success) {
                setSubmissions(res.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch submissions:', error);
        }
    };

    const handleCreateAssignment = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('/assignments', {
                ...formData,
                course: selectedCourse._id
            });
            if (res.data.success) {
                setAssignments([...assignments, res.data.data]);
                setShowForm(false);
                setFormData({ title: '', description: '', deadline: '', maxPoints: 100 });
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to create assignment');
        }
    };

    const handleGradeSubmission = async () => {
        try {
            const res = await axios.put(`/assignments/submission/${selectedSub._id}/grade`, grading);
            if (res.data.success) {
                alert('Grade saved');
                setSubmissions(prev => prev.map(s => s._id === selectedSub._id ? res.data.data : s));
                setSelectedSub(res.data.data);
            }
        } catch (error) {
            alert('Failed to save grade');
        }
    };

    return (
        <div className="apps-manager">
            <div className="manager-header">
                <h1>Assignment Manager</h1>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <select
                        value={selectedCourse?._id || ''}
                        onChange={(e) => setSelectedCourse(courses.find(c => c._id === e.target.value))}
                        className="status-select-large"
                    >
                        {courses.map(c => (
                            <option key={c._id} value={c._id}>{c.code}: {c.title}</option>
                        ))}
                    </select>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        style={{ background: '#1a56db', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer' }}
                    >
                        {showForm ? 'Cancel' : '+ New Assignment'}
                    </button>
                </div>
            </div>

            <div className="manager-content">
                <div className="apps-list-sidebar">
                    {loading ? <p>Loading...</p> : assignments.map(asm => (
                        <div
                            key={asm._id}
                            className={`app-item ${selectedAsm?._id === asm._id ? 'active' : ''}`}
                            onClick={() => {
                                setSelectedAsm(asm);
                                setSelectedSub(null);
                                fetchSubmissions(asm._id);
                            }}
                        >
                            <div className="app-item-header">
                                <span className="app-name">{asm.title}</span>
                            </div>
                            <p className="app-program">{asm.maxPoints} Points</p>
                            <p className="app-date">Due: {new Date(asm.deadline).toLocaleDateString()}</p>
                        </div>
                    ))}
                </div>

                <div className="app-detail-view">
                    {showForm ? (
                        <div className="app-detail-container">
                            <h2>Create New Assignment</h2>
                            <form onSubmit={handleCreateAssignment} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '500px' }}>
                                <input placeholder="Title" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required className="status-select-large" />
                                <textarea placeholder="Description" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} required className="status-select-large" rows="4" />
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <div style={{ flex: 1 }}>
                                        <label>Deadline</label>
                                        <input type="datetime-local" value={formData.deadline} onChange={e => setFormData({ ...formData, deadline: e.target.value })} required className="status-select-large" />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label>Max Points</label>
                                        <input type="number" value={formData.maxPoints} onChange={e => setFormData({ ...formData, maxPoints: e.target.value })} required className="status-select-large" />
                                    </div>
                                </div>
                                <button type="submit" style={{ background: '#10b981', color: 'white', padding: '0.75rem', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Create Assignment</button>
                            </form>
                        </div>
                    ) : selectedAsm ? (
                        <div className="app-detail-container">
                            <h2>{selectedAsm.title}</h2>
                            <p>{selectedAsm.description}</p>

                            <h3 style={{ marginTop: '2rem' }}>Submissions</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
                                {submissions.length === 0 ? <p>No submissions yet.</p> : submissions.map(sub => (
                                    <div
                                        key={sub._id}
                                        style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer', background: selectedSub?._id === sub._id ? '#f1f5f9' : 'white' }}
                                        onClick={() => {
                                            setSelectedSub(sub);
                                            setGrading({ grade: sub.grade || '', feedback: sub.feedback || '' });
                                        }}
                                    >
                                        <div>
                                            <strong>{sub.student.firstName} {sub.student.lastName}</strong>
                                            <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>Submitted: {new Date(sub.submittedAt).toLocaleString()}</p>
                                        </div>
                                        <span className={`status-badge status-${sub.status}`}>{sub.status}</span>
                                    </div>
                                ))}
                            </div>

                            {selectedSub && (
                                <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                    <h3>Grade Submission</h3>
                                    <div style={{ marginBottom: '1rem', padding: '1rem', background: 'white', border: '1px solid #cbd5e1', borderRadius: '4px' }}>
                                        {selectedSub.content}
                                    </div>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                                        <div style={{ flex: '0 0 100px' }}>
                                            <label>Grade</label>
                                            <input type="number" max={selectedAsm.maxPoints} value={grading.grade} onChange={e => setGrading({ ...grading, grade: e.target.value })} className="status-select-large" />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <label>Feedback</label>
                                            <input value={grading.feedback} onChange={e => setGrading({ ...grading, feedback: e.target.value })} className="status-select-large" placeholder="Great work..." />
                                        </div>
                                        <button onClick={handleGradeSubmission} style={{ height: '42px', background: '#10b981', color: 'white', padding: '0 1.5rem', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Save Grade</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="no-selection">
                            <p>Select an assignment to manage submissions</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AssignmentManager;
