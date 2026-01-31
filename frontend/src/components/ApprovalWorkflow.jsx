import { useState } from 'react';
import './ApprovalWorkflow.css';

const ApprovalWorkflow = ({
    approvalHistory = [],
    currentStatus,
    onApprove,
    onReject,
    canApprove = false
}) => {
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [comments, setComments] = useState('');

    const handleApprove = async () => {
        if (onApprove) {
            await onApprove(comments);
            setShowApproveModal(false);
            setComments('');
        }
    };

    const handleReject = async () => {
        if (!comments.trim()) {
            alert('Please provide a reason for rejection');
            return;
        }
        if (onReject) {
            await onReject(comments);
            setShowRejectModal(false);
            setComments('');
        }
    };

    const getStatusIcon = (action) => {
        const icons = {
            'Submitted': '📤',
            'Approved': '✅',
            'Rejected': '❌',
            'Pending': '⏳',
            'Returned': '↩️'
        };
        return icons[action] || '📝';
    };

    const getStatusColor = (action) => {
        const colors = {
            'Approved': '#10b981',
            'Rejected': '#ef4444',
            'Pending': '#f59e0b',
            'Submitted': '#3b82f6',
            'Returned': '#6b7280'
        };
        return colors[action] || '#6b7280';
    };

    return (
        <div className="approval-workflow">
            <div className="workflow-header">
                <h3>Approval Workflow</h3>
                {canApprove && currentStatus === 'Pending' && (
                    <div className="workflow-actions">
                        <button
                            className="btn btn-success"
                            onClick={() => setShowApproveModal(true)}
                        >
                            ✓ Approve
                        </button>
                        <button
                            className="btn btn-danger"
                            onClick={() => setShowRejectModal(true)}
                        >
                            ✗ Reject
                        </button>
                    </div>
                )}
            </div>

            {/* Timeline */}
            <div className="approval-timeline">
                {approvalHistory.length === 0 ? (
                    <div className="empty-timeline">
                        <p>No approval history yet</p>
                    </div>
                ) : (
                    approvalHistory.map((item, index) => (
                        <div key={index} className="timeline-item">
                            <div
                                className="timeline-marker"
                                style={{ background: getStatusColor(item.action) }}
                            >
                                {getStatusIcon(item.action)}
                            </div>
                            <div className="timeline-content">
                                <div className="timeline-header">
                                    <strong>{item.action}</strong>
                                    <span className="timeline-date">
                                        {new Date(item.date).toLocaleString()}
                                    </span>
                                </div>
                                <div className="timeline-body">
                                    <p className="approver-info">
                                        By: {item.approverName || item.approverId?.name || 'System'}
                                        {item.approverRole && ` (${item.approverRole})`}
                                    </p>
                                    {item.comments && (
                                        <p className="approval-comments">
                                            <strong>Comments:</strong> {item.comments}
                                        </p>
                                    )}
                                    {item.level && (
                                        <span className="approval-level">Level {item.level}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Approve Modal */}
            {showApproveModal && (
                <div className="modal-overlay" onClick={() => setShowApproveModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Approve Request</h2>
                            <button className="close-btn" onClick={() => setShowApproveModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <p>Are you sure you want to approve this request?</p>
                            <div className="form-group">
                                <label>Comments (Optional)</label>
                                <textarea
                                    value={comments}
                                    onChange={(e) => setComments(e.target.value)}
                                    rows="4"
                                    placeholder="Add any comments about this approval..."
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button
                                className="btn btn-secondary"
                                onClick={() => setShowApproveModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-success"
                                onClick={handleApprove}
                            >
                                Confirm Approval
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="modal-overlay" onClick={() => setShowRejectModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Reject Request</h2>
                            <button className="close-btn" onClick={() => setShowRejectModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <p>Please provide a reason for rejection:</p>
                            <div className="form-group">
                                <label>Reason *</label>
                                <textarea
                                    value={comments}
                                    onChange={(e) => setComments(e.target.value)}
                                    rows="4"
                                    placeholder="Explain why this request is being rejected..."
                                    required
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button
                                className="btn btn-secondary"
                                onClick={() => setShowRejectModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-danger"
                                onClick={handleReject}
                            >
                                Confirm Rejection
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ApprovalWorkflow;
