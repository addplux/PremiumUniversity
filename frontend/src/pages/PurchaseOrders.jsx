import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './PurchaseOrders.css';

const PurchaseOrders = () => {
    const navigate = useNavigate();
    const [purchaseOrders, setPurchaseOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        status: '',
        supplierId: ''
    });

    useEffect(() => {
        fetchPurchaseOrders();
    }, [filters]);

    const fetchPurchaseOrders = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams(filters);
            const res = await axios.get(`/api/purchase-orders?${params}`);
            if (res.data.success) {
                setPurchaseOrders(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching purchase orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendToSupplier = async (id) => {
        if (!window.confirm('Send this purchase order to the supplier?')) return;
        try {
            await axios.post(`/api/purchase-orders/${id}/send`);
            alert('Purchase order sent to supplier');
            fetchPurchaseOrders();
        } catch (error) {
            console.error('Error sending PO:', error);
            alert('Failed to send purchase order');
        }
    };

    const handleConfirmOrder = async (id) => {
        if (!window.confirm('Confirm this purchase order?')) return;
        try {
            await axios.post(`/api/purchase-orders/${id}/confirm`);
            alert('Purchase order confirmed');
            fetchPurchaseOrders();
        } catch (error) {
            console.error('Error confirming PO:', error);
            alert('Failed to confirm purchase order');
        }
    };

    const handleReceiveGoods = (po) => {
        navigate(`/admin/purchase-orders/${po._id}/receive`);
    };

    const handleCancelOrder = async (id) => {
        const reason = prompt('Enter cancellation reason:');
        if (!reason) return;
        try {
            await axios.post(`/api/purchase-orders/${id}/cancel`, { reason });
            alert('Purchase order cancelled');
            fetchPurchaseOrders();
        } catch (error) {
            console.error('Error cancelling PO:', error);
            alert('Failed to cancel purchase order');
        }
    };

    const getStatusBadge = (status) => {
        const colors = {
            'Draft': 'badge-secondary',
            'Pending Approval': 'badge-warning',
            'Approved': 'badge-info',
            'Sent': 'badge-info',
            'Confirmed': 'badge-success',
            'In Transit': 'badge-warning',
            'Partially Delivered': 'badge-warning',
            'Delivered': 'badge-success',
            'Invoiced': 'badge-info',
            'Paid': 'badge-success',
            'Completed': 'badge-success',
            'Cancelled': 'badge-danger',
            'Rejected': 'badge-danger'
        };
        return <span className={`badge ${colors[status]}`}>{status}</span>;
    };

    const getPaymentStatusBadge = (status) => {
        const colors = {
            'Pending': 'badge-warning',
            'Partial': 'badge-info',
            'Paid': 'badge-success'
        };
        return <span className={`badge ${colors[status]}`}>{status}</span>;
    };

    return (
        <div className="purchase-orders">
            <div className="page-header">
                <div>
                    <h1>Purchase Orders</h1>
                    <p>Manage and track purchase orders</p>
                </div>
                <button className="btn btn-primary" onClick={() => navigate('/admin/requisitions')}>
                    View Requisitions
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
                    <option value="Sent">Sent</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="In Transit">In Transit</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                </select>
            </div>

            {/* Purchase Orders List */}
            {loading ? (
                <div className="loading-state">Loading purchase orders...</div>
            ) : (
                <div className="po-grid">
                    {purchaseOrders.length === 0 ? (
                        <div className="empty-state">
                            <p>No purchase orders found</p>
                            <button className="btn btn-primary" onClick={() => navigate('/admin/requisitions')}>
                                Create from Requisition
                            </button>
                        </div>
                    ) : (
                        purchaseOrders.map((po) => (
                            <div key={po._id} className="po-card">
                                <div className="card-header">
                                    <div>
                                        <h3>{po.poNumber}</h3>
                                        <p className="supplier">{po.supplierId?.name || 'N/A'}</p>
                                    </div>
                                    <div className="badges">
                                        {getStatusBadge(po.status)}
                                        {getPaymentStatusBadge(po.paymentStatus)}
                                    </div>
                                </div>

                                <div className="card-body">
                                    <div className="info-row">
                                        <span className="label">Order Date:</span>
                                        <span>{new Date(po.orderDate).toLocaleDateString()}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Expected Delivery:</span>
                                        <span>{new Date(po.expectedDeliveryDate).toLocaleDateString()}</span>
                                    </div>
                                    {po.actualDeliveryDate && (
                                        <div className="info-row">
                                            <span className="label">Delivered On:</span>
                                            <span>{new Date(po.actualDeliveryDate).toLocaleDateString()}</span>
                                        </div>
                                    )}
                                    <div className="info-row">
                                        <span className="label">Items:</span>
                                        <span>{po.items.length} item(s)</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Total Amount:</span>
                                        <span className="amount">${po.totalAmount.toLocaleString()}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Grand Total:</span>
                                        <span className="amount grand">${po.grandTotal.toLocaleString()}</span>
                                    </div>
                                    {po.deliveries && po.deliveries.length > 0 && (
                                        <div className="info-row">
                                            <span className="label">Deliveries:</span>
                                            <span>{po.deliveries.length} delivery(ies)</span>
                                        </div>
                                    )}
                                </div>

                                <div className="card-footer">
                                    {po.status === 'Draft' && (
                                        <button
                                            className="btn btn-sm btn-primary"
                                            onClick={() => handleSendToSupplier(po._id)}
                                        >
                                            Send to Supplier
                                        </button>
                                    )}
                                    {po.status === 'Sent' && (
                                        <button
                                            className="btn btn-sm btn-success"
                                            onClick={() => handleConfirmOrder(po._id)}
                                        >
                                            Confirm Order
                                        </button>
                                    )}
                                    {['Confirmed', 'In Transit', 'Partially Delivered'].includes(po.status) && (
                                        <button
                                            className="btn btn-sm btn-primary"
                                            onClick={() => handleReceiveGoods(po)}
                                        >
                                            Receive Goods
                                        </button>
                                    )}
                                    {!['Completed', 'Cancelled'].includes(po.status) && (
                                        <button
                                            className="btn btn-sm btn-danger"
                                            onClick={() => handleCancelOrder(po._id)}
                                        >
                                            Cancel
                                        </button>
                                    )}
                                    <button
                                        className="btn btn-sm btn-secondary"
                                        onClick={() => navigate(`/admin/purchase-orders/${po._id}`)}
                                    >
                                        View Details
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default PurchaseOrders;
