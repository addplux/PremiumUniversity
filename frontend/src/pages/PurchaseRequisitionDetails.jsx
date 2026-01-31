import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ApprovalWorkflow from '../components/ApprovalWorkflow';
import './PurchaseRequisitionDetails.css';

const PurchaseRequisitionDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [requisition, setRequisition] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRequisitionDetails();
    }, [id]);

    const fetchRequisitionDetails = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`/api/requisitions/${id}`);
            if (res.data.success) {
                setRequisition(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching requisition details:', error);
            alert('Failed to load requisition details');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (comments) => {
        try {
            await axios.post(`/api/requisitions/${id}/approve`, { comments });
            alert('Requisition approved successfully');
            fetchRequisitionDetails();
        } catch (error) {
            console.error('Error approving requisition:', error);
            alert('Failed to approve requisition');
        }
    };

    const handleReject = async (comments) => {
        try {
            await axios.post(`/api/requisitions/${id}/reject`, { comments });
            alert('Requisition rejected');
            fetchRequisitionDetails();
        } catch (error) {
            console.error('Error rejecting requisition:', error);
            alert('Failed to reject requisition');
        }
    };

    const handleConvertToPO = () => {
        navigate('/admin/purchase-orders/create', { state: { requisition } });
    };

    const getStatusBadge = (status) => {
        const colors = {
            Draft: 'badge-secondary',
            Pending: 'badge-warning',
            Approved: 'badge-success',
            Rejected: 'badge-danger',
            Converted: 'badge-info'
        };
        return <span className={`badge ${colors[status]}`}>{status}</span>;
    };

    const getPriorityBadge = (priority) => {
        const colors = {
            Low: 'priority-low',
            Medium: 'priority-medium',
            High: 'priority-high',
            Urgent: 'priority-urgent'
        };
        return <span className={`priority-badge ${colors[priority]}`}>{priority}</span>;
    };

    if (loading) return <div className="loading-state">Loading requisition details...</div>;
    if (!requisition) return <div className="error-state">Requisition not found</div>;

    return (
        <div className="requisition-details">
            {/* Header */}
            <div className="details-header">
                <button className="btn-back" onClick={() => navigate('/admin/requisitions')}>
                    ← Back to Requisitions
                </button>
                <div className="header-content">
                    <div className="header-left">
                        <h1>{requisition.requisitionNumber}</h1>
                        <p className="meta-text">
                            Requested by {requisition.departmentName} • {new Date(requisition.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                    <div className="header-right">
                        {getPriorityBadge(requisition.priority)}
                        {getStatusBadge(requisition.status)}
                        {requisition.status === 'Approved' && !requisition.purchaseOrderId && (
                            <button className="btn btn-primary" onClick={handleConvertToPO}>
                                Convert to PO
                            </button>
                        )}
                        {requisition.purchaseOrderId && (
                            <button
                                className="btn btn-secondary"
                                onClick={() => navigate(`/admin/purchase-orders/${requisition.purchaseOrderId}`)}
                            >
                                View Purchase Order
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="details-grid-layout">
                {/* Main Content */}
                <div className="main-content">
                    {/* Items Table */}
                    <div className="detail-card">
                        <h3>Requisition Items</h3>
                        <div className="table-responsive">
                            <table className="items-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Description</th>
                                        <th>Qty</th>
                                        <th>Unit</th>
                                        <th>Est. Price</th>
                                        <th>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {requisition.items.map((item, index) => (
                                        <tr key={index}>
                                            <td>{index + 1}</td>
                                            <td>
                                                <div className="item-desc">
                                                    <strong>{item.description}</strong>
                                                    {item.specifications && <small>{item.specifications}</small>}
                                                </div>
                                            </td>
                                            <td>{item.quantity}</td>
                                            <td>{item.unit}</td>
                                            <td>${item.estimatedUnitPrice.toLocaleString()}</td>
                                            <td className="amount">${item.estimatedTotal.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colSpan="5" className="text-right"><strong>Total Vendor Estimated Amount:</strong></td>
                                        <td className="total-amount">${requisition.totalAmount.toLocaleString()}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    {/* Workflow */}
                    <div className="mt-6">
                        <ApprovalWorkflow
                            approvalHistory={requisition.approvalHistory}
                            currentStatus={requisition.status}
                            onApprove={handleApprove}
                            onReject={handleReject}
                            canApprove={true} // In a real app, check user role/permissions here
                        />
                    </div>
                </div>

                {/* Sidebar */}
                <div className="sidebar">
                    <div className="detail-card">
                        <h3>General Information</h3>
                        <div className="info-group">
                            <label>Required By Date</label>
                            <span>{new Date(requisition.requiredBy).toLocaleDateString()}</span>
                        </div>
                        <div className="info-group">
                            <label>Budget Code</label>
                            <span>{requisition.budgetCode || 'N/A'}</span>
                        </div>
                        <div className="info-group">
                            <label>Department</label>
                            <span>{requisition.departmentName}</span>
                        </div>
                        <div className="info-group">
                            <label>Requested By</label>
                            <span>{requisition.requestedBy?.name || 'Unknown'}</span>
                        </div>
                    </div>

                    {requisition.notes && (
                        <div className="detail-card">
                            <h3>Notes</h3>
                            <p className="notes-text">{requisition.notes}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PurchaseRequisitionDetails;
