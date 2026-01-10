import { useState, useEffect } from 'react';
import axios from 'axios';
import '../pages/ApplicationsManager.css';

const GradesDashboard = () => {
    const [grades, setGrades] = useState([]);
    const [overallGPA, setOverallGPA] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchGrades();
    }, []);

    const fetchGrades = async () => {
        try {
            const res = await axios.get('/grades/my');
            if (res.data.success) {
                setGrades(res.data.data);
                setOverallGPA(res.data.overallGPA);
            }
        } catch (error) {
            console.error('Failed to fetch grades:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8">Loading your grades...</div>;

    return (
        <div className="apps-manager">
            <div className="manager-header">
                <h1>📊 My Grades</h1>
                <p>View your academic performance and GPA</p>
            </div>

            <div style={{ padding: '1.5rem' }}>
                {/* Overall GPA Card */}
                <div style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    padding: '2rem',
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                    marginBottom: '2rem',
                    color: 'white'
                }}>
                    <p style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem', opacity: 0.9 }}>Overall GPA</p>
                    <h2 style={{ fontSize: '3.5rem', fontWeight: '700', margin: 0 }}>{overallGPA}</h2>
                    <p style={{ fontSize: '0.875rem', marginTop: '0.5rem', opacity: 0.8 }}>Based on {grades.length} course{grades.length !== 1 ? 's' : ''}</p>
                </div>

                {/* Grades Table */}
                <h3 style={{ marginBottom: '1rem' }}>Course Grades</h3>
                <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px 0 rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                            <tr>
                                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Course Name</th>
                                <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>CA Marks</th>
                                <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Exam Marks</th>
                                <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Total</th>
                                <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Grade</th>
                                <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>GPA</th>
                                <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Semester</th>
                            </tr>
                        </thead>
                        <tbody>
                            {grades.length === 0 ? (
                                <tr>
                                    <td colSpan="7" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</div>
                                        <p style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>No grades posted yet</p>
                                        <p style={{ fontSize: '0.875rem' }}>Your grades will appear here once your instructors post them</p>
                                    </td>
                                </tr>
                            ) : grades.map((grade, index) => (
                                <tr key={grade._id} style={{
                                    borderBottom: '1px solid #f1f5f9',
                                    transition: 'background-color 0.2s',
                                    cursor: 'pointer'
                                }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                                >
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '0.95rem' }}>
                                            {grade.course?.title || 'Unknown Course'}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                                            {grade.course?.code || 'N/A'}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'center', fontSize: '0.95rem', fontWeight: '600', color: '#3b82f6' }}>
                                        {grade.caMarks}
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'center', fontSize: '0.95rem', fontWeight: '600', color: '#8b5cf6' }}>
                                        {grade.examMarks}
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                                        <span style={{
                                            fontSize: '1rem',
                                            fontWeight: '700',
                                            color: '#1e293b'
                                        }}>
                                            {grade.totalMarks}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                                        <span style={{
                                            padding: '0.4rem 0.8rem',
                                            borderRadius: '8px',
                                            background: grade.grade === 'F' ? '#fee2e2' : grade.grade.startsWith('A') ? '#dcfce7' : grade.grade.startsWith('B') ? '#dbeafe' : '#fef3c7',
                                            color: grade.grade === 'F' ? '#991b1b' : grade.grade.startsWith('A') ? '#166534' : grade.grade.startsWith('B') ? '#1e40af' : '#92400e',
                                            fontWeight: '700',
                                            fontSize: '0.95rem'
                                        }}>
                                            {grade.grade}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'center', fontSize: '0.95rem', fontWeight: '700', color: '#10b981' }}>
                                        {grade.gpa.toFixed(1)}
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'center', fontSize: '0.875rem', color: '#64748b' }}>
                                        {grade.semester} {grade.academicYear}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Remarks Section */}
                {grades.some(g => g.remarks) && (
                    <div style={{ marginTop: '2rem' }}>
                        <h3 style={{ marginBottom: '1rem' }}>Instructor Remarks</h3>
                        {grades.filter(g => g.remarks).map(grade => (
                            <div key={grade._id} style={{
                                background: '#f8fafc',
                                padding: '1rem',
                                borderRadius: '8px',
                                marginBottom: '0.5rem',
                                borderLeft: '4px solid #3b82f6'
                            }}>
                                <strong>{grade.course?.title}:</strong> {grade.remarks}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default GradesDashboard;
