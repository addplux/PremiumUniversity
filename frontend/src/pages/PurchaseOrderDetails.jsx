import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './PurchaseOrderDetails.css';

const PurchaseOrderDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [po, setPO] = useState(null);
    const [loading, setLoading] = useState(true);
    const [generatingPdf, setGeneratingPdf] = useState(false);

    useEffect(() => {
        fetchPODetails();
    }, [id]);

    const fetchPODetails = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`/api/purchase-orders/${id}`);
            if (res.data.success) {
                setPO(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching PO details:', error);
            alert('Failed to load purchase order details');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPDF = async () => {
        try {
            setGeneratingPdf(true);
            const res = await axios.get(`/api/purchase-orders/${id}/pdf`, {
                responseType: 'blob'
            });

            // Create blob link to download
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `PO-${po.poNumber}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to generate PDF');
        } finally {
            setGeneratingPdf(false);
        }
    };

    const handleReceiveGoods = () => {
        navigate(`/admin/purchase-orders/${id}/receive`);
    };

    const getStatusBadge = (status) => {
        const colors = {
            'Draft': 'badge-secondary',
            'Pending Approval': 'badge-warning',
            'Approved': 'badge-info',
            'Sent': 'badge-info',
            'Confirmed': 'badge-success',
            'Partially Delivered': 'badge-warning',
            'Delivered': 'badge-success',
            'Completed': 'badge-success',
            'Cancelled': 'badge-danger'
        };
        return <span className={`badge ${colors[status]}`}>{status}</span>;
    };

    if (loading) return <div className="loading-state">Loading purchase order...</div>;
    if (!po) return <div className="error-state">Purchase Order not found</div>;

    return (
        <div className="po-details">
            {/* Header */}
            <div className="details-header">
                <button className="btn-back" onClick={() => navigate('/admin/purchase-orders')}>
                    ← Back to Orders
                </button>
                <div className="header-content">
                    <div className="header-left">
                        <h1>{po.poNumber}</h1>
                        <p className="meta-text">
                            Ordered on {new Date(po.orderDate).toLocaleDateString()} • {po.supplierId?.name}
                        </p>
                    </div>
                    <div className="header-right">
                        {getStatusBadge(po.status)}
                        <button
                            className="btn btn-secondary"
                            onClick={handleDownloadPDF}
                            disabled={generatingPdf}
                        >
                            {generatingPdf ? 'Generating...' : '📄 Download PDF'}
                        </button>
                        {['Confirmed', 'Partially Delivered'].includes(po.status) && (
                            <button className="btn btn-primary" onClick={handleReceiveGoods}>
                                Receive Goods
                            </button>
                        )}
                        {po.status === 'Draft' && (
                            <button className="btn btn-primary" onClick={() => alert('Sending to supplier...')}>
                                Send to Supplier
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="details-grid-layout">
                <div className="main-content">
                    {/* Items Table */}
                    <div className="detail-card">
                        <h3>Order Items</h3>
                        <div className="table-responsive">
                            <table className="items-table">
                                <thead>
                                    <tr>
                                        <th>Item</th>
                                        <th>SKU</th>
                                        <th>Qty</th>
                                        <th>Unit Price</th>
                                        <th>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {po.items.map((item, index) => (
                                        <tr key={index}>
                                            <td>
                                                <div className="item-desc">
                                                    <strong>{item.description}</strong>
                                                </div>
                                            </td>
                                            <td>{item.productId?.sku || '-'}</td>
                                            <td>{item.quantity} {item.unit}</td>
                                            <td>${item.unitPrice.toLocaleString()}</td>
                                            <td className="amount">${item.totalPrice.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colSpan="4" className="text-right">Subtotal:</td>
                                        <td className="amount">${po.totalAmount.toLocaleString()}</td>
                                    </tr>
                                    <tr>
                                        <td colSpan="4" className="text-right">Tax (VAT):</td>
                                        <td className="amount">${po.taxAmount.toLocaleString()}</td>
                                    </tr>
                                    <tr className="grand-total-row">
                                        <td colSpan="4" className="text-right"><strong>Grand Total:</strong></td>
                                        <td className="total-amount">${po.grandTotal.toLocaleString()}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    {/* Deliveries Section */}
                    {po.deliveries && po.deliveries.length > 0 && (
                        <div className="detail-card mt-6">
                            <h3>Delivery History</h3>
                            <div className="deliveries-list">
                                {po.deliveries.map((delivery, idx) => (
                                    <div key={idx} className="delivery-item">
                                        <div className="delivery-header">
                                            <strong>Grn #{delivery.grnNumber}</strong>
                                            <span>{new Date(delivery.receivedDate).toLocaleString()}</span>
                                        </div>
                                        <div className="delivery-info">
                                            <span>Received By: {delivery.receivedBy?.name || 'Unknown'}</span>
                                            {delivery.deliveryNoteNumber && (
                                                <span>Note: {delivery.deliveryNoteNumber}</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="sidebar">
                    <div className="detail-card">
                        <h3>Supplier Info</h3>
                        <div className="info-group">
                            <label>Name</label>
                            <span>{po.supplierId?.name}</span>
                        </div>
                        <div className="info-group">
                            <label>Contact</label>
                            <span>{po.supplierId?.contactPerson?.name}</span>
                        </div>
                        <div className="info-group">
                            <label>Email</label>
                            <span>{po.supplierId?.email}</span>
                        </div>
                        <div className="info-group">
                            <label>Phone</label>
                            <span>{po.supplierId?.phone}</span>
                        </div>
                    </div>

                    <div className="detail-card">
                        <h3>Shipping & Delivery</h3>
                        <div className="info-group">
                            <label>Expected Date</label>
                            <span>{new Date(po.expectedDeliveryDate).toLocaleDateString()}</span>
                        </div>
                        <div className="info-group">
                            <label>Delivery Address</label>
                            <span className="address-text">{po.deliveryAddress}</span>
                        </div>
                        <div className="info-group">
                            <label>Billing Address</label>
                            <span className="address-text">{po.billingAddress}</span>
                        </div>
                    </div>

                    <div className="detail-card">
                        <h3>Payment Info</h3>
                        <div className="info-group">
                            <label>Terms</label>
                            <span>{po.paymentTerms}</span>
                        </div>
                        <div className="info-group">
                            <label>Status</label>
                            <span className={`badge ${po.paymentStatus === 'Paid' ? 'badge-success' : 'badge-warning'}`}>
                                {po.paymentStatus}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PurchaseOrderDetails;
