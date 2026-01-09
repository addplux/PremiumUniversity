import { useState, useEffect } from 'react';
import axios from 'axios';
import '../pages/ApplicationsManager.css';

const GradesDashboard = () => {
    const [transcript, setTranscript] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTranscript();
    }, []);

    const fetchTranscript = async () => {
        try {
            const res = await axios.get('/enrollments/transcript');
            if (res.data.success) {
                setTranscript(res.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch transcript:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8">Loading academic records...</div>;

    return (
        <div className="apps-manager">
            <div className="manager-header">
                <h1>Academic Performance</h1>
            </div>

            <div style={{ padding: '1.5rem' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1.5rem',
                    marginBottom: '2rem'
                }}>
                    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', borderLeft: '4px solid var(--primary-color, #1a56db)' }}>
                        <p style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>Cumulative GPA</p>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: '700', color: '#1e293b' }}>{transcript?.gpa || '0.00'}</h2>
                    </div>
                    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', borderLeft: '4px solid #10b981' }}>
                        <p style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>Total Credits Earned</p>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: '700', color: '#1e293b' }}>{transcript?.totalCredits || 0}</h2>
                    </div>
                </div>

                <h3>Course Records</h3>
                <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px 0 rgba(0,0,0,0.1)', overflow: 'hidden', marginTop: '1rem' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <tr>
                                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', color: '#64748b' }}>COURSE</th>
                                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', color: '#64748b' }}>SEMESTER</th>
                                <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.75rem', color: '#64748b' }}>CREDITS</th>
                                <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.75rem', color: '#64748b' }}>GRADE</th>
                                <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.75rem', color: '#64748b' }}>POINTS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transcript?.records.length === 0 ? (
                                <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center' }}>No completed courses found.</td></tr>
                            ) : transcript?.records.map(record => (
                                <tr key={record._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ fontWeight: '600', color: '#1e293b' }}>{record.courseCode}</div>
                                        <div style={{ fontSize: '0.875rem', color: '#64748b' }}>{record.courseTitle}</div>
                                    </td>
                                    <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{record.semester}</td>
                                    <td style={{ padding: '1rem', textAlign: 'center', fontSize: '0.875rem' }}>{record.credits}</td>
                                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                                        <span style={{
                                            padding: '0.25rem 0.6rem',
                                            borderRadius: '6px',
                                            background: '#f1f5f9',
                                            fontWeight: '700',
                                            color: '#1e293b'
                                        }}>
                                            {record.grade}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'center', fontSize: '0.875rem', color: '#64748b' }}>{record.points.toFixed(1)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default GradesDashboard;
