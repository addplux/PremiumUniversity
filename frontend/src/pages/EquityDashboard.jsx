import { useState, useEffect } from 'react';
import axios from 'axios';
import '../pages/ApplicationsManager.css';

const EquityDashboard = () => {
    const [auditType, setAuditType] = useState('grading');
    const [loading, setLoading] = useState(false);
    const [currentAudit, setCurrentAudit] = useState(null);
    const [history, setHistory] = useState([]);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const res = await axios.get('/ai/equity/history');
            if (res.data.success) {
                setHistory(res.data.data);
                if (res.data.data.length > 0 && !currentAudit) {
                    setCurrentAudit(res.data.data[0]);
                }
            }
        } catch (error) {
            console.error('Failed to fetch history:', error);
        }
    };

    const runAudit = async () => {
        try {
            setLoading(true);
            const res = await axios.post('/ai/equity/run', { type: auditType });
            if (res.data.success) {
                setCurrentAudit(res.data.data);
                fetchHistory(); // Refresh history
            }
        } catch (error) {
            console.error('Audit failed:', error);
            alert('Failed to run audit');
        } finally {
            setLoading(false);
        }
    };

    const renderFindings = () => {
        if (!currentAudit || !currentAudit.findings) return null;

        return currentAudit.findings.map((finding, idx) => (
            <div key={idx} style={{
                background: finding.severity === 'high' ? '#fef2f2' : finding.severity === 'medium' ? '#fffbeb' : '#f0fdf4',
                border: `1px solid ${finding.severity === 'high' ? '#fecaca' : finding.severity === 'medium' ? '#fde68a' : '#bbf7d0'}`,
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1rem'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <h4 style={{ margin: 0, color: '#1e293b' }}>{finding.category}</h4>
                    <span style={{
                        fontSize: '0.75rem',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        background: 'white',
                        fontWeight: '600',
                        color: finding.severity === 'high' ? '#ef4444' : finding.severity === 'medium' ? '#f59e0b' : '#22c55e'
                    }}>
                        {finding.severity.toUpperCase()} SEVERITY
                    </span>
                </div>
                <p style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '0.5rem' }}>{finding.description}</p>

                <div style={{ fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic' }}>
                    Recommendation: {finding.recommendation}
                </div>
            </div>
        ));
    };

    return (
        <div className="apps-manager">
            <div className="manager-header">
                <h1>Equity & Bias Audit</h1>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <select
                        value={auditType}
                        onChange={(e) => setAuditType(e.target.value)}
                        style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #e2e8f0' }}
                    >
                        <option value="grading">Grading Fairness</option>
                        <option value="admissions">Admissions</option>
                        <option value="financial_aid">Financial Aid</option>
                    </select>
                    <button
                        className="btn-primary"
                        onClick={runAudit}
                        disabled={loading}
                    >
                        {loading ? 'Analyzing...' : 'Run New Audit'}
                    </button>
                </div>
            </div>

            <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: '250px 1fr', gap: '2rem' }}>
                {/* Sidebar History */}
                <div style={{ background: 'white', borderRadius: '12px', padding: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', height: 'fit-content' }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Audit History</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {history.map(audit => (
                            <div
                                key={audit._id}
                                onClick={() => setCurrentAudit(audit)}
                                style={{
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    background: currentAudit?._id === audit._id ? '#f1f5f9' : 'transparent',
                                    cursor: 'pointer',
                                    border: '1px solid transparent',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <div style={{ fontWeight: '500', fontSize: '0.9rem', textTransform: 'capitalize' }}>
                                    {audit.auditType} Audit
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                    {new Date(audit.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Content */}
                <div>
                    {currentAudit ? (
                        <>
                            <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
                                <div style={{ marginBottom: '2rem' }}>
                                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Audit Results</h2>
                                    <div style={{ color: '#64748b', fontSize: '0.9rem' }}>
                                        Analyzed {currentAudit.metrics?.totalAnalyzed || 0} records from {new Date(currentAudit.period?.startDate).toLocaleDateString()} to {new Date(currentAudit.period?.endDate).toLocaleDateString()}
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                                    <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
                                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Overall Pass Rate</div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e293b' }}>
                                            {currentAudit.metrics?.outcomeRates?.overall?.toFixed(1)}%
                                        </div>
                                    </div>
                                    <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
                                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Male Pass Rate</div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#3b82f6' }}>
                                            {currentAudit.metrics?.outcomeRates?.male?.toFixed(1)}%
                                        </div>
                                    </div>
                                    <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
                                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Female Pass Rate</div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#ec4899' }}>
                                            {currentAudit.metrics?.outcomeRates?.female?.toFixed(1)}%
                                        </div>
                                    </div>
                                </div>

                                <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Findings & Recommendations</h3>
                                {renderFindings()}
                            </div>
                        </>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
                            Select an audit from history or run a new one.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EquityDashboard;
