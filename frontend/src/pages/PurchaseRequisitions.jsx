import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './PurchaseRequisitions.css';

const PurchaseRequisitions = () => {
    const navigate = useNavigate();
    const [requisitions, setRequisitions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [filters, setFilters] = useState({
        status: '',
        priority: '',
        departmentId: ''
    });

    const [formData, setFormData] = useState({
        departmentId: '',
        departmentName: '',
        requiredBy: '',
        purpose: '',
        priority: 'Medium',
        budgetCode: '',
        items: [{
            description: '',
            quantity: 1,
            unit: 'Piece',
            estimatedUnitPrice: 0,
            estimatedTotal: 0,
            specifications: '',
            notes: ''
        }],
        notes: ''
    });

    useEffect(() => {
        fetchRequisitions();
    }, [filters]);

    const fetchRequisitions = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams(filters);
            const res = await axios.get(`/api/requisitions?${params}`);
            if (res.data.success) {
                setRequisitions(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching requisitions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/requisitions', formData);
            alert('Requisition created successfully');
            setShowModal(false);
            resetForm();
            fetchRequisitions();
        } catch (error) {
            console.error('Error creating requisition:', error);
            alert(error.response?.data?.message || 'Failed to create requisition');
        }
    };

    const handleSubmitForApproval = async (id) => {
        if (!window.confirm('Submit this requisition for approval?')) return;
        try {
            await axios.post(`/api/requisitions/${id}/submit`);
            alert('Requisition submitted for approval');
            fetchRequisitions();
        } catch (error) {
            console.error('Error submitting requisition:', error);
            alert('Failed to submit requisition');
        }
    };

    const handleApprove = async (id) => {
        const comments = prompt('Enter approval comments (optional):');
        try {
            await axios.post(`/api/requisitions/${id}/approve`, { comments });
            alert('Requisition approved successfully');
            fetchRequisitions();
        } catch (error) {
            console.error('Error approving requisition:', error);
            alert('Failed to approve requisition');
        }
    };

    const handleReject = async (id) => {
        const comments = prompt('Enter rejection reason:');
        if (!comments) return;
        try {
            await axios.post(`/api/requisitions/${id}/reject`, { comments });
            alert('Requisition rejected');
            fetchRequisitions();
        } catch (error) {
            console.error('Error rejecting requisition:', error);
            alert('Failed to reject requisition');
        }
    };

    const handleConvertToPO = (requisition) => {
        navigate(`/admin/purchase-orders/create`, { state: { requisition } });
    };

    const addItem = () => {
        setFormData({
            ...formData,
            items: [...formData.items, {
                description: '',
                quantity: 1,
                unit: 'Piece',
                estimatedUnitPrice: 0,
                estimatedTotal: 0,
                specifications: '',
                notes: ''
            }]
        });
    };

    const removeItem = (index) => {
        const newItems = formData.items.filter((_, i) => i !== index);
        setFormData({ ...formData, items: newItems });
    };

    const updateItem = (index, field, value) => {
        const newItems = [...formData.items];
        newItems[index][field] = value;

        // Auto-calculate total
        if (field === 'quantity' || field === 'estimatedUnitPrice') {
            newItems[index].estimatedTotal = newItems[index].quantity * newItems[index].estimatedUnitPrice;
        }

        setFormData({ ...formData, items: newItems });
    };

    const resetForm = () => {
        setFormData({
            departmentId: '',
            departmentName: '',
            requiredBy: '',
            purpose: '',
            priority: 'Medium',
            budgetCode: '',
            items: [{
                description: '',
                quantity: 1,
                unit: 'Piece',
                estimatedUnitPrice: 0,
                estimatedTotal: 0,
                specifications: '',
                notes: ''
            }],
            notes: ''
        });
    };

    const getStatusBadge = (status) => {
        const colors = {
            Draft: 'badge-secondary',
            Pending: 'badge-warning',
            Approved: 'badge-success',
            Rejected: 'badge-danger',
            Cancelled: 'badge-secondary',
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

    const getTotalAmount = () => {
        return formData.items.reduce((sum, item) => sum + item.estimatedTotal, 0);
    };

    return (
        <div className="purchase-requisitions">
            <div className="page-header">
                <div>
                    <h1>Purchase Requisitions</h1>
                    <p>Create and manage purchase requests</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    + New Requisition
                </button>
            </div>

            {/* Filters */}
            <div className="filters-section">
                <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="filter-select"
                >
                    <option value="">All Statuses</option>
                    <option value="Draft">Draft</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Converted">Converted</option>
                </select>
                <select
                    value={filters.priority}
                    onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                    className="filter-select"
                >
                    <option value="">All Priorities</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                </select>
            </div>

            {/* Requisitions List */}
            {loading ? (
                <div className="loading-state">Loading requisitions...</div>
            ) : (
                <div className="requisitions-grid">
                    {requisitions.length === 0 ? (
                        <div className="empty-state">
                            <p>No requisitions found</p>
                            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                                Create Your First Requisition
                            </button>
                        </div>
                    ) : (
                        requisitions.map((req) => (
                            <div key={req._id} className="requisition-card">
                                <div className="card-header">
                                    <div>
                                        <h3>{req.requisitionNumber}</h3>
                                        <p className="department">{req.departmentName}</p>
                                    </div>
                                    <div className="badges">
                                        {getStatusBadge(req.status)}
                                        {getPriorityBadge(req.priority)}
                                    </div>
                                </div>

                                <div className="card-body">
                                    <div className="info-row">
                                        <span className="label">Purpose:</span>
                                        <span>{req.purpose}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Required By:</span>
                                        <span>{new Date(req.requiredBy).toLocaleDateString()}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Items:</span>
                                        <span>{req.items.length} item(s)</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Total Amount:</span>
                                        <span className="amount">${req.totalAmount.toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="card-footer">
                                    {req.status === 'Draft' && (
                                        <button
                                            className="btn btn-sm btn-primary"
                                            onClick={() => handleSubmitForApproval(req._id)}
                                        >
                                            Submit for Approval
                                        </button>
                                    )}
                                    {req.status === 'Pending' && (
                                        <>
                                            <button
                                                className="btn btn-sm btn-success"
                                                onClick={() => handleApprove(req._id)}
                                            >
                                                Approve
                                            </button>
                                            <button
                                                className="btn btn-sm btn-danger"
                                                onClick={() => handleReject(req._id)}
                                            >
                                                Reject
                                            </button>
                                        </>
                                    )}
                                    {req.status === 'Approved' && !req.purchaseOrderId && (
                                        <button
                                            className="btn btn-sm btn-primary"
                                            onClick={() => handleConvertToPO(req)}
                                        >
                                            Convert to PO
                                        </button>
                                    )}
                                    <button
                                        className="btn btn-sm btn-secondary"
                                        onClick={() => navigate(`/admin/requisitions/${req._id}`)}
                                    >
                                        View Details
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Create Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => { setShowModal(false); resetForm(); }}>
                    <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>New Purchase Requisition</h2>
                            <button className="close-btn" onClick={() => { setShowModal(false); resetForm(); }}>×</button>
                        </div>

                        <form onSubmit={handleSubmit} className="requisition-form">
                            <div className="form-section">
                                <h3>Basic Information</h3>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Department ID *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.departmentId}
                                            onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Department Name *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.departmentName}
                                            onChange={(e) => setFormData({ ...formData, departmentName: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Required By *</label>
                                        <input
                                            type="date"
                                            required
                                            value={formData.requiredBy}
                                            onChange={(e) => setFormData({ ...formData, requiredBy: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Priority *</label>
                                        <select
                                            required
                                            value={formData.priority}
                                            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                        >
                                            <option value="Low">Low</option>
                                            <option value="Medium">Medium</option>
                                            <option value="High">High</option>
                                            <option value="Urgent">Urgent</option>
                                        </select>
                                    </div>
                                    <div className="form-group full-width">
                                        <label>Purpose *</label>
                                        <textarea
                                            required
                                            value={formData.purpose}
                                            onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                                            rows="2"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Budget Code</label>
                                        <input
                                            type="text"
                                            value={formData.budgetCode}
                                            onChange={(e) => setFormData({ ...formData, budgetCode: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="form-section">
                                <div className="section-header">
                                    <h3>Items</h3>
                                    <button type="button" className="btn btn-sm btn-secondary" onClick={addItem}>
                                        + Add Item
                                    </button>
                                </div>

                                {formData.items.map((item, index) => (
                                    <div key={index} className="item-row">
                                        <div className="item-header">
                                            <h4>Item {index + 1}</h4>
                                            {formData.items.length > 1 && (
                                                <button
                                                    type="button"
                                                    className="btn-remove"
                                                    onClick={() => removeItem(index)}
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </div>
                                        <div className="form-grid">
                                            <div className="form-group full-width">
                                                <label>Description *</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={item.description}
                                                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Quantity *</label>
                                                <input
                                                    type="number"
                                                    required
                                                    min="1"
                                                    value={item.quantity}
                                                    onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value))}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Unit *</label>
                                                <select
                                                    required
                                                    value={item.unit}
                                                    onChange={(e) => updateItem(index, 'unit', e.target.value)}
                                                >
                                                    <option value="Piece">Piece</option>
                                                    <option value="Box">Box</option>
                                                    <option value="Carton">Carton</option>
                                                    <option value="Kg">Kg</option>
                                                    <option value="Liter">Liter</option>
                                                    <option value="Meter">Meter</option>
                                                    <option value="Set">Set</option>
                                                    <option value="Pack">Pack</option>
                                                    <option value="Dozen">Dozen</option>
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label>Est. Unit Price *</label>
                                                <input
                                                    type="number"
                                                    required
                                                    min="0"
                                                    step="0.01"
                                                    value={item.estimatedUnitPrice}
                                                    onChange={(e) => updateItem(index, 'estimatedUnitPrice', parseFloat(e.target.value))}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Total</label>
                                                <input
                                                    type="number"
                                                    value={item.estimatedTotal}
                                                    disabled
                                                    className="readonly"
                                                />
                                            </div>
                                            <div className="form-group full-width">
                                                <label>Specifications</label>
                                                <textarea
                                                    value={item.specifications}
                                                    onChange={(e) => updateItem(index, 'specifications', e.target.value)}
                                                    rows="2"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <div className="total-section">
                                    <strong>Total Estimated Amount:</strong>
                                    <span className="total-amount">${getTotalAmount().toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="form-section">
                                <h3>Additional Notes</h3>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    rows="3"
                                    placeholder="Any additional information..."
                                />
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => { setShowModal(false); resetForm(); }}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Create Requisition
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PurchaseRequisitions;
