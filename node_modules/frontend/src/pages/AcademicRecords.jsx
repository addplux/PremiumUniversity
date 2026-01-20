import { useState, useEffect } from 'react';
import axios from 'axios';
import '../pages/ApplicationsManager.jsx'; // Contextual ref

const AcademicRecords = () => {
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [transcript, setTranscript] = useState(null);
    const [enrollments, setEnrollments] = useState([]); // All enrollments (active + completed)
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('transcript'); // 'transcript' or 'grading'
    const [gradingData, setGradingData] = useState({ enrollmentId: '', grade: '', status: 'completed' });

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const res = await axios.get('/users?role=student');
            if (res.data.success) setStudents(res.data.data);
        } catch (error) {
            console.error('Failed to fetch students:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStudentData = async (studentId) => {
        setLoading(true);
        try {
            const [transRes, enrRes] = await Promise.all([
                axios.get(`/enrollments/transcript/${studentId}`),
                axios.get(`/enrollments/student/${studentId}`)
            ]);
            if (transRes.data.success) setTranscript(transRes.data.data);
            if (enrRes.data.success) setEnrollments(enrRes.data.data);
        } catch (error) {
            console.error('Failed to fetch student records:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectStudent = (student) => {
        setSelectedStudent(student);
        fetchStudentData(student._id);
    };

    const handleUpdateGrade = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.put(`/enrollments/${gradingData.enrollmentId}/grade`, {
                grade: gradingData.grade,
                status: gradingData.status
            });
            if (res.data.success) {
                alert('Grade updated successfully');
                fetchStudentData(selectedStudent._id);
                setGradingData({ enrollmentId: '', grade: '', status: 'completed' });
            }
        } catch (error) {
            alert('Failed to update grade');
        }
    };

    return (
        <div className="apps-manager">
            <div className="manager-header">
                <h1>Academic Records</h1>
                {selectedStudent && (
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            className={`nav-link ${viewMode === 'transcript' ? 'active' : ''}`}
                            onClick={() => setViewMode('transcript')}
                            style={{ padding: '0.4rem 1rem', border: '1px solid #cbd5e1', borderRadius: '4px', background: viewMode === 'transcript' ? '#1a56db' : 'white', color: viewMode === 'transcript' ? 'white' : 'inherit' }}
                        >
                            Transcript
                        </button>
                        <button
                            className={`nav-link ${viewMode === 'grading' ? 'active' : ''}`}
                            onClick={() => setViewMode('grading')}
                            style={{ padding: '0.4rem 1rem', border: '1px solid #cbd5e1', borderRadius: '4px', background: viewMode === 'grading' ? '#1a56db' : 'white', color: viewMode === 'grading' ? 'white' : 'inherit' }}
                        >
                            Final Grading
                        </button>
                    </div>
                )}
            </div>

            <div className="manager-content">
                <div className="apps-list-sidebar">
                    <div className="p-4" style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <h3 style={{ fontSize: '0.875rem', color: '#64748b', textTransform: 'uppercase' }}>Students</h3>
                    </div>
                    {students.map(s => (
                        <div
                            key={s._id}
                            className={`app-item ${selectedStudent?._id === s._id ? 'active' : ''}`}
                            onClick={() => handleSelectStudent(s)}
                        >
                            <div className="app-item-header">
                                <span className="app-name">{s.firstName} {s.lastName}</span>
                            </div>
                            <p className="app-program">{s.studentId || 'N/A'}</p>
                        </div>
                    ))}
                </div>

                <div className="app-detail-view">
                    {selectedStudent ? (
                        <div className="app-detail-container">
                            <div style={{ marginBottom: '2rem' }}>
                                <h2>{selectedStudent.firstName} {selectedStudent.lastName}</h2>
                                <p style={{ color: '#64748b' }}>Student ID: {selectedStudent.studentId}</p>
                            </div>

                            {viewMode === 'transcript' ? (
                                <div>
                                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                                        <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', flex: 1 }}>
                                            <p style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#64748b' }}>GPA</p>
                                            <h3 style={{ fontSize: '1.5rem' }}>{transcript?.gpa}</h3>
                                        </div>
                                        <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', flex: 1 }}>
                                            <p style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#64748b' }}>CREDITS</p>
                                            <h3 style={{ fontSize: '1.5rem' }}>{transcript?.totalCredits}</h3>
                                        </div>
                                    </div>

                                    <h3>Academic History</h3>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                                        <thead>
                                            <tr style={{ textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>
                                                <th style={{ padding: '0.75rem' }}>Course</th>
                                                <th style={{ padding: '0.75rem' }}>Semester</th>
                                                <th style={{ padding: '0.75rem' }}>Grade</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {transcript?.records.map(record => (
                                                <tr key={record._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                    <td style={{ padding: '0.75rem' }}>{record.courseCode}: {record.courseTitle}</td>
                                                    <td style={{ padding: '0.75rem' }}>{record.semester}</td>
                                                    <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>{record.grade}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div>
                                    <h3>Manage Final Course Grades</h3>
                                    <p style={{ color: '#64748b', marginBottom: '2rem', fontSize: '0.875rem' }}>
                                        Finalize enrollment by setting the letter grade and status.
                                    </p>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {enrollments.map(enr => (
                                            <div key={enr._id} style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px', background: 'white' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div>
                                                        <strong>{enr.course.code}: {enr.course.title}</strong>
                                                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>Status: {enr.status} | Current Grade: {enr.grade || 'None'}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => setGradingData({ enrollmentId: enr._id, grade: enr.grade || '', status: enr.status })}
                                                        style={{ background: '#f1f5f9', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer' }}
                                                    >
                                                        Edit Grade
                                                    </button>
                                                </div>

                                                {gradingData.enrollmentId === enr._id && (
                                                    <form onSubmit={handleUpdateGrade} style={{ marginTop: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '6px', display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                                                        <div style={{ flex: 1 }}>
                                                            <label style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem' }}>Letter Grade (A, B, etc.)</label>
                                                            <select
                                                                className="status-select-large"
                                                                value={gradingData.grade}
                                                                onChange={e => setGradingData({ ...gradingData, grade: e.target.value })}
                                                            >
                                                                <option value="">Select</option>
                                                                {['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F'].map(g => (
                                                                    <option key={g} value={g}>{g}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                        <div style={{ flex: 1 }}>
                                                            <label style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem' }}>Fulfillment Status</label>
                                                            <select
                                                                className="status-select-large"
                                                                value={gradingData.status}
                                                                onChange={e => setGradingData({ ...gradingData, status: e.target.value })}
                                                            >
                                                                <option value="enrolled">Enrolled</option>
                                                                <option value="completed">Completed</option>
                                                                <option value="failed">Failed</option>
                                                                <option value="dropped">Dropped</option>
                                                            </select>
                                                        </div>
                                                        <button type="submit" style={{ height: '42px', background: '#10b981', color: 'white', padding: '0 1rem', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                                                            Save
                                                        </button>
                                                    </form>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="no-selection">
                            <p>Select a student to view or manage academic records</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AcademicRecords;
