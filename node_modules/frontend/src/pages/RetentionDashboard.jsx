import { useState, useEffect } from 'react';
import axios from 'axios';
import '../pages/ApplicationsManager.css'; // Reusing styles

const RetentionDashboard = () => {
    const [stats, setStats] = useState({ totalTracked: 0, highRisk: 0, riskPercentage: 0 });
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, critical, high, medium, low

    useEffect(() => {
        fetchDashboardData();
    }, [filter]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const query = filter !== 'all' ? `?riskLevel=${filter}` : '';
            const res = await axios.get(`/ai/retention/dashboard${query}`);

            if (res.data.success) {
                setStats(res.data.stats);
                setStudents(res.data.students);
            }
        } catch (error) {
            console.error('Failed to fetch retention data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getRiskColor = (level) => {
        switch (level) {
            case 'critical': return '#ef4444'; // Red-500
            case 'high': return '#f97316'; // Orange-500
            case 'medium': return '#eab308'; // Yellow-500
            default: return '#22c55e'; // Green-500
        }
    };

    const getRiskBadge = (level) => {
        const color = getRiskColor(level);
        return (
            <span style={{
                padding: '4px 8px',
                borderRadius: '12px',
                backgroundColor: `${color}20`,
                color: color,
                fontWeight: '600',
                fontSize: '0.75rem',
                textTransform: 'uppercase'
            }}>
                {level}
            </span>
        );
    };

    return (
        <div className="apps-manager">
            <div className="manager-header">
                <h1>Student Retention AI</h1>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn-secondary" onClick={fetchDashboardData}>Refresh Analysis</button>
                    <div className="status-badge" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></div>
                        AI Model Active
                    </div>
                </div>
            </div>

            <div style={{ padding: '1.5rem' }}>
                {/* Stats Overview */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                    <div className="stat-card" style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Overall Retention Risk</div>
                        <div style={{ fontSize: '2rem', fontWeight: '700', color: stats.riskPercentage > 20 ? '#ef4444' : '#1e293b' }}>
                            {stats.riskPercentage}%
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Of student body at risk</div>
                    </div>

                    <div className="stat-card" style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        <div style={{ fontSize: '0.875rem', color: '#64748b' }}>High Risk Students</div>
                        <div style={{ fontSize: '2rem', fontWeight: '700', color: '#f97316' }}>
                            {stats.highRisk}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Require immediate attention</div>
                    </div>

                    <div className="stat-card" style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Total Monitored</div>
                        <div style={{ fontSize: '2rem', fontWeight: '700', color: '#1e293b' }}>
                            {stats.totalTracked}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Active students</div>
                    </div>
                </div>

                {/* Integration Notice */}
                <div style={{
                    background: 'linear-gradient(to right, #f0fdf4, #dcfce7)',
                    border: '1px solid #bbf7d0',
                    padding: '1rem',
                    borderRadius: '8px',
                    marginBottom: '2rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                }}>
                    <span style={{ fontSize: '1.5rem' }}>🤖</span>
                    <div>
                        <h4 style={{ margin: 0, color: '#166534' }}>AI Prediction Engine</h4>
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.875rem', color: '#15803d' }}>
                            Predictions are updated daily based on academic performance, attendance, and platform engagement.
                            Early intervention has been shown to improve retention by up to 25%.
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                    {['all', 'critical', 'high', 'medium', 'low'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '20px',
                                border: filter === f ? 'none' : '1px solid #e2e8f0',
                                background: filter === f ? '#1e293b' : 'white',
                                color: filter === f ? 'white' : '#64748b',
                                cursor: 'pointer',
                                textTransform: 'capitalize',
                                fontWeight: '500'
                            }}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                {/* Students Table */}
                <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px 0 rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <tr>
                                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', color: '#64748b' }}>STUDENT</th>
                                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', color: '#64748b' }}>RISK LEVEL</th>
                                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', color: '#64748b' }}>RETENTION SCORE</th>
                                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', color: '#64748b' }}>KEY FACTORS</th>
                                <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.75rem', color: '#64748b' }}>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" style={{ padding: '3rem', textAlign: 'center' }}>Running predictive models...</td></tr>
                            ) : students.length === 0 ? (
                                <tr><td colSpan="5" style={{ padding: '3rem', textAlign: 'center' }}>No students found matching this criteria.</td></tr>
                            ) : students.map(record => (
                                <tr key={record._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{
                                                width: '32px', height: '32px',
                                                borderRadius: '50%',
                                                background: '#f1f5f9',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontWeight: '600', color: '#64748b', fontSize: '0.8rem'
                                            }}>
                                                {record.studentId?.firstName?.[0]}{record.studentId?.lastName?.[0]}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '500', fontSize: '0.9rem' }}>
                                                    {record.studentId?.firstName} {record.studentId?.lastName}
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                                    {record.studentId?.studentId || record.studentId?.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        {getRiskBadge(record.riskPrediction.riskLevel)}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div style={{
                                                width: '100px', height: '6px',
                                                background: '#e2e8f0', borderRadius: '3px',
                                                overflow: 'hidden'
                                            }}>
                                                <div style={{
                                                    width: `${record.riskPrediction.score}%`,
                                                    height: '100%',
                                                    background: getRiskColor(record.riskPrediction.riskLevel)
                                                }}></div>
                                            </div>
                                            <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>
                                                {record.riskPrediction.score}
                                            </span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                            {record.riskPrediction.riskFactors.length > 0 ? (
                                                record.riskPrediction.riskFactors.map((factor, i) => (
                                                    <span key={i} style={{
                                                        fontSize: '0.7rem',
                                                        padding: '2px 6px',
                                                        background: '#f1f5f9',
                                                        borderRadius: '4px',
                                                        color: '#475569'
                                                    }}>
                                                        {factor}
                                                    </span>
                                                ))
                                            ) : (
                                                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>None detected</span>
                                            )}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                                        <button
                                            style={{
                                                padding: '6px 12px',
                                                background: 'white', border: '1px solid #e2e8f0',
                                                borderRadius: '6px', fontSize: '0.8rem', fontWeight: '500',
                                                cursor: 'pointer', color: '#475569'
                                            }}
                                            onClick={() => alert(`Scheduling intervention for ${record.studentId?.firstName}...`)}
                                        >
                                            Intervene
                                        </button>
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

export default RetentionDashboard;
