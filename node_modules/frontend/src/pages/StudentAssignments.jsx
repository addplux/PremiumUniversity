import { useState, useEffect } from 'react';
import axios from 'axios';
import '../pages/ApplicationsManager.css'; // Consistency

const StudentAssignments = () => {
    const [enrollments, setEnrollments] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(null); // id of assignment being submitted
    const [submissionContent, setSubmissionContent] = useState('');

    useEffect(() => {
        fetchEnrollments();
    }, []);

    const fetchEnrollments = async () => {
        try {
            const res = await axios.get('/enrollments/my');
            if (res.data.success) {
                setEnrollments(res.data.data);
                if (res.data.data.length > 0) {
                    setSelectedCourse(res.data.data[0].course);
                }
            }
        } catch (error) {
            console.error('Failed to fetch enrollments:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedCourse) {
            fetchAssignments(selectedCourse._id);
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

    const handleSubmit = async (assignmentId) => {
        if (!submissionContent) return alert('Please enter some content');
        try {
            const res = await axios.post(`/assignments/${assignmentId}/submit`, {
                content: submissionContent
            });
            if (res.data.success) {
                alert('Assignment submitted successfully');
                setSubmitting(null);
                setSubmissionContent('');
                fetchAssignments(selectedCourse._id); // Refresh to show submission
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Submission failed');
        }
    };

    return (
        <div className="apps-manager">
            <div className="manager-header">
                <h1>Assignments</h1>
                <div className="filters">
                    <select
                        value={selectedCourse?._id || ''}
                        onChange={(e) => setSelectedCourse(enrollments.find(enr => enr.course._id === e.target.value).course)}
                    >
                        {enrollments.map(enr => (
                            <option key={enr.course._id} value={enr.course._id}>
                                {enr.course.code}: {enr.course.title}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="manager-content">
                <div className="apps-list-sidebar">
                    {loading && assignments.length === 0 ? <p>Loading...</p> : assignments.length === 0 ? <p className="p-4">No assignments for this course.</p> : assignments.map(asm => (
                        <div
                            key={asm._id}
                            className={`app-item ${submitting === asm._id ? 'active' : ''}`}
                            onClick={() => setSubmitting(asm._id)}
                        >
                            <div className="app-item-header">
                                <span className="app-name">{asm.title}</span>
                                <span className={`status-dot status-${asm.mySubmission ? 'accepted' : 'pending'}`}></span>
                            </div>
                            <p className="app-program">Max Points: {asm.maxPoints}</p>
                            <p className="app-date">Due: {new Date(asm.deadline).toLocaleDateString()}</p>
                        </div>
                    ))}
                </div>

                <div className="app-detail-view">
                    {submitting ? (
                        <div className="app-detail-container">
                            {(() => {
                                const asm = assignments.find(a => a._id === submitting);
                                return (
                                    <>
                                        <h2>{asm.title}</h2>
                                        <p style={{ color: '#64748b', marginBottom: '1rem' }}>{asm.description}</p>

                                        {asm.mySubmission ? (
                                            <div style={{ background: '#f0f9ff', padding: '1rem', borderRadius: '6px' }}>
                                                <h3>Your Submission</h3>
                                                <p><strong>Status:</strong> {asm.mySubmission.status}</p>
                                                <p><strong>Submitted:</strong> {new Date(asm.mySubmission.submittedAt).toLocaleString()}</p>
                                                <div style={{ background: 'white', padding: '1rem', border: '1px solid #e2e8f0', marginTop: '0.5rem' }}>
                                                    {asm.mySubmission.content}
                                                </div>
                                                {asm.mySubmission.grade !== null && (
                                                    <div style={{ marginTop: '1rem', borderTop: '1px solid #bae6fd', paddingTop: '1rem' }}>
                                                        <p><strong>Grade:</strong> {asm.mySubmission.grade} / {asm.maxPoints}</p>
                                                        <p><strong>Feedback:</strong> {asm.mySubmission.feedback || 'No feedback provided'}</p>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div>
                                                <h3>Submit Work</h3>
                                                <textarea
                                                    value={submissionContent}
                                                    onChange={(e) => setSubmissionContent(e.target.value)}
                                                    placeholder="Type your response or paste a link to your work..."
                                                    style={{ width: '100%', height: '200px', padding: '1rem', border: '1px solid #cbd5e1', borderRadius: '6px', marginBottom: '1rem' }}
                                                />
                                                <button
                                                    onClick={() => handleSubmit(asm._id)}
                                                    style={{ background: '#10b981', color: 'white', padding: '0.75rem 1.5rem', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                                                >
                                                    Submit Assignment
                                                </button>
                                            </div>
                                        )}
                                    </>
                                );
                            })()}
                        </div>
                    ) : (
                        <div className="no-selection">
                            <p>Select an assignment to view or submit</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentAssignments;
