import { useState, useEffect } from 'react';
import axios from 'axios';
import './AutomatedReordering.css';

const AutomatedReordering = () => {
    const [rules, setRules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [logs, setLogs] = useState([]);
    const [isChecking, setIsChecking] = useState(false);

    // Form state
    const [showForm, setShowForm] = useState(false);
    const [newRule, setNewRule] = useState({
        name: '',
        productId: '', // Would be a dropdown in real app
        warehouseId: '', // Would be a dropdown
        minStockLevel: 10,
        maxStockLevel: 50,
        reorderQuantity: 0, // 0 means auto-calc to max
        autoApprove: false
    });

    useEffect(() => {
        fetchRules();
    }, []);

    const fetchRules = async () => {
        try {
            setLoading(true);
            const res = await axios.get('/api/automation/reorder-rules');
            if (res.data.success) {
                setRules(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching rules:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateRule = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/automation/reorder-rules', newRule);
            alert('Rule created successfully');
            setShowForm(false);
            fetchRules();
        } catch (error) {
            alert('Error creating rule: ' + error.response?.data?.message || error.message);
        }
    };

    const handleTriggerCheck = async () => {
        try {
            setIsChecking(true);
            const res = await axios.post('/api/automation/trigger');
            if (res.data.success) {
                setLogs(prev => [
                    { time: new Date(), message: res.data.message, details: res.data.data },
                    ...prev
                ]);
            }
        } catch (error) {
            console.error('Trigger error:', error);
            setLogs(prev => [
                { time: new Date(), message: 'Error running automation check', type: 'error' },
                ...prev
            ]);
        } finally {
            setIsChecking(false);
        }
    };

    return (
        <div className="automation-page">
            <div className="page-header">
                <div>
                    <h1>Automated Reordering</h1>
                    <p>Configure rules to automatically replenish stock when levels get low.</p>
                </div>
                <button
                    className="btn btn-warning trigger-btn"
                    onClick={handleTriggerCheck}
                    disabled={isChecking}
                >
                    {isChecking ? 'Running Checks...' : '⚡ Run Manual Check Now'}
                </button>
            </div>

            <div className="content-grid">
                {/* Rules List */}
                <div className="rules-section card">
                    <div className="section-header">
                        <h3>Active Rules</h3>
                        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
                            + New Rule
                        </button>
                    </div>

                    {showForm && (
                        <div className="rule-form">
                            <h4>Configure New Rule</h4>
                            <form onSubmit={handleCreateRule}>
                                <div className="form-group">
                                    <label>Rule Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        required
                                        value={newRule.name}
                                        onChange={e => setNewRule({ ...newRule, name: e.target.value })}
                                        placeholder="e.g. Standard Office Supplies"
                                    />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Min Stock</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={newRule.minStockLevel}
                                            onChange={e => setNewRule({ ...newRule, minStockLevel: parseInt(e.target.value) })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Max Stock</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={newRule.maxStockLevel}
                                            onChange={e => setNewRule({ ...newRule, maxStockLevel: parseInt(e.target.value) })}
                                        />
                                    </div>
                                </div>
                                <div className="form-actions">
                                    <button type="submit" className="btn btn-primary">Save Rule</button>
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="rules-list">
                        {loading ? <p>Loading rules...</p> : rules.length === 0 ? (
                            <p className="empty-text">No automation rules configured.</p>
                        ) : (
                            rules.map(rule => (
                                <div key={rule._id} className="rule-item">
                                    <div className="rule-info">
                                        <strong>{rule.name}</strong>
                                        <span>Min: {rule.minStockLevel} | Max: {rule.maxStockLevel}</span>
                                    </div>
                                    <div className="rule-meta">
                                        <span className={`badge ${rule.isActive ? 'badge-success' : 'badge-secondary'}`}>
                                            {rule.isActive ? 'Active' : 'Paused'}
                                        </span>
                                        {rule.lastTriggeredAt && (
                                            <span className="last-run">Run: {new Date(rule.lastTriggeredAt).toLocaleDateString()}</span>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Logs Console */}
                <div className="logs-section card">
                    <h3>Automation Logs</h3>
                    <div className="logs-console">
                        {logs.length === 0 ? (
                            <p className="log-empty">System idle. No recent activities.</p>
                        ) : (
                            logs.map((log, idx) => (
                                <div key={idx} className={`log-entry ${log.type || 'info'}`}>
                                    <span className="log-time">{log.time.toLocaleTimeString()}</span>
                                    <span className="log-msg">{log.message}</span>
                                    {log.details && log.details.length > 0 && (
                                        <ul className="log-details">
                                            {log.details.map((d, i) => (
                                                <li key={i}>{d.action} for {d.rule}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AutomatedReordering;
