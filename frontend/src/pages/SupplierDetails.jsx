import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './SupplierDetails.css';

const SupplierDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [supplier, setSupplier] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [rating, setRating] = useState({ score: 5, comment: '' });

    useEffect(() => {
        fetchSupplierDetails();
    }, [id]);

    const fetchSupplierDetails = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`/api/suppliers/${id}`);
            if (res.data.success) {
                setSupplier(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching supplier details:', error);
            alert('Failed to load supplier details');
        } finally {
            setLoading(false);
        }
    };

    const handleRateSupplier = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`/api/suppliers/${id}/rate`, rating);
            alert('Rating submitted successfully');
            setShowRatingModal(false);
            fetchSupplierDetails();
        } catch (error) {
            console.error('Error rating supplier:', error);
            alert('Failed to submit rating');
        }
    };

    const getStatusBadge = (status) => {
        const colors = {
            Active: 'badge-success',
            Inactive: 'badge-secondary',
            Suspended: 'badge-warning',
            Blacklisted: 'badge-danger'
        };
        return <span className={`badge ${colors[status]}`}>{status}</span>;
    };

    const getRatingStars = (rating) => {
        return '⭐'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));
    };

    if (loading) return <div className="loading-state">Loading supplier details...</div>;
    if (!supplier) return <div className="error-state">Supplier not found</div>;

    return (
        <div className="supplier-details">
            {/* Header */}
            <div className="details-header">
                <button className="btn-back" onClick={() => navigate('/admin/suppliers')}>
                    ← Back to Suppliers
                </button>
                <div className="header-content">
                    <div className="header-left">
                        <h1>{supplier.name}</h1>
                        <p className="supplier-meta">
                            {supplier.category} • {supplier.registrationNumber}
                        </p>
                    </div>
                    <div className="header-right">
                        {getStatusBadge(supplier.status)}
                        <button className="btn btn-primary" onClick={() => setShowRatingModal(true)}>
                            Rate Supplier
                        </button>
                        <button className="btn btn-secondary" onClick={() => navigate(`/admin/suppliers/${id}/edit`)}>
                            Edit
                        </button>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="tabs">
                <button
                    className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    Overview
                </button>
                <button
                    className={`tab ${activeTab === 'performance' ? 'active' : ''}`}
                    onClick={() => setActiveTab('performance')}
                >
                    Performance
                </button>
                <button
                    className={`tab ${activeTab === 'documents' ? 'active' : ''}`}
                    onClick={() => setActiveTab('documents')}
                >
                    Documents
                </button>
                <button
                    className={`tab ${activeTab === 'orders' ? 'active' : ''}`}
                    onClick={() => setActiveTab('orders')}
                >
                    Purchase Orders
                </button>
            </div>

            {/* Tab Content */}
            <div className="tab-content">
                {activeTab === 'overview' && (
                    <div className="overview-tab">
                        <div className="details-grid">
                            {/* Contact Information */}
                            <div className="detail-card">
                                <h3>Contact Information</h3>
                                <div className="info-group">
                                    <label>Email:</label>
                                    <span>{supplier.email}</span>
                                </div>
                                <div className="info-group">
                                    <label>Phone:</label>
                                    <span>{supplier.phone}</span>
                                </div>
                                <div className="info-group">
                                    <label>Website:</label>
                                    <span>{supplier.website || 'N/A'}</span>
                                </div>
                                <div className="info-group">
                                    <label>Tax ID:</label>
                                    <span>{supplier.taxId}</span>
                                </div>
                            </div>

                            {/* Address */}
                            <div className="detail-card">
                                <h3>Address</h3>
                                <div className="address-block">
                                    <p>{supplier.address.street}</p>
                                    <p>{supplier.address.city}, {supplier.address.state}</p>
                                    <p>{supplier.address.country} {supplier.address.postalCode}</p>
                                </div>
                            </div>

                            {/* Contact Person */}
                            <div className="detail-card">
                                <h3>Contact Person</h3>
                                <div className="info-group">
                                    <label>Name:</label>
                                    <span>{supplier.contactPerson.name}</span>
                                </div>
                                <div className="info-group">
                                    <label>Position:</label>
                                    <span>{supplier.contactPerson.position}</span>
                                </div>
                                <div className="info-group">
                                    <label>Email:</label>
                                    <span>{supplier.contactPerson.email}</span>
                                </div>
                                <div className="info-group">
                                    <label>Phone:</label>
                                    <span>{supplier.contactPerson.phone}</span>
                                </div>
                            </div>

                            {/* Bank Details */}
                            <div className="detail-card">
                                <h3>Bank Details</h3>
                                <div className="info-group">
                                    <label>Bank Name:</label>
                                    <span>{supplier.bankDetails.bankName}</span>
                                </div>
                                <div className="info-group">
                                    <label>Account Name:</label>
                                    <span>{supplier.bankDetails.accountName}</span>
                                </div>
                                <div className="info-group">
                                    <label>Account Number:</label>
                                    <span>{supplier.bankDetails.accountNumber}</span>
                                </div>
                                <div className="info-group">
                                    <label>SWIFT Code:</label>
                                    <span>{supplier.bankDetails.swiftCode || 'N/A'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Notes */}
                        {supplier.notes && (
                            <div className="detail-card full-width">
                                <h3>Notes</h3>
                                <p>{supplier.notes}</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'performance' && (
                    <div className="performance-tab">
                        <div className="performance-grid">
                            <div className="metric-card">
                                <div className="metric-icon">⭐</div>
                                <div className="metric-content">
                                    <h4>Overall Rating</h4>
                                    <div className="metric-value">{supplier.rating.toFixed(1)}</div>
                                    <div className="metric-stars">{getRatingStars(supplier.rating)}</div>
                                </div>
                            </div>

                            <div className="metric-card">
                                <div className="metric-icon">📦</div>
                                <div className="metric-content">
                                    <h4>Total Orders</h4>
                                    <div className="metric-value">{supplier.performanceMetrics?.totalOrders || 0}</div>
                                </div>
                            </div>

                            <div className="metric-card">
                                <div className="metric-icon">✅</div>
                                <div className="metric-content">
                                    <h4>On-Time Delivery</h4>
                                    <div className="metric-value">
                                        {supplier.performanceMetrics?.onTimeDeliveryRate?.toFixed(1) || 0}%
                                    </div>
                                </div>
                            </div>

                            <div className="metric-card">
                                <div className="metric-icon">💰</div>
                                <div className="metric-content">
                                    <h4>Total Spent</h4>
                                    <div className="metric-value">
                                        ${supplier.performanceMetrics?.totalSpent?.toLocaleString() || 0}
                                    </div>
                                </div>
                            </div>

                            <div className="metric-card">
                                <div className="metric-icon">🎯</div>
                                <div className="metric-content">
                                    <h4>Quality Score</h4>
                                    <div className="metric-value">
                                        {supplier.performanceMetrics?.qualityScore?.toFixed(1) || 0}/10
                                    </div>
                                </div>
                            </div>

                            <div className="metric-card">
                                <div className="metric-icon">⏱️</div>
                                <div className="metric-content">
                                    <h4>Avg. Lead Time</h4>
                                    <div className="metric-value">
                                        {supplier.performanceMetrics?.averageLeadTime || 0} days
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Ratings */}
                        {supplier.ratings && supplier.ratings.length > 0 && (
                            <div className="detail-card">
                                <h3>Recent Ratings</h3>
                                <div className="ratings-list">
                                    {supplier.ratings.slice(0, 5).map((r, idx) => (
                                        <div key={idx} className="rating-item">
                                            <div className="rating-header">
                                                <span className="rating-stars">{getRatingStars(r.score)}</span>
                                                <span className="rating-date">
                                                    {new Date(r.date).toLocaleDateString()}
                                                </span>
                                            </div>
                                            {r.comment && <p className="rating-comment">{r.comment}</p>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'documents' && (
                    <div className="documents-tab">
                        <div className="detail-card">
                            <h3>Certifications</h3>
                            {supplier.certifications && supplier.certifications.length > 0 ? (
                                <div className="documents-list">
                                    {supplier.certifications.map((cert, idx) => (
                                        <div key={idx} className="document-item">
                                            <div className="document-icon">📄</div>
                                            <div className="document-info">
                                                <strong>{cert.name}</strong>
                                                <p>Issued: {new Date(cert.issueDate).toLocaleDateString()}</p>
                                                <p>Expires: {new Date(cert.expiryDate).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="empty-message">No certifications on file</p>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'orders' && (
                    <div className="orders-tab">
                        <div className="detail-card">
                            <h3>Purchase Orders</h3>
                            <p className="empty-message">Purchase order history will be displayed here</p>
                            <button
                                className="btn btn-primary"
                                onClick={() => navigate('/admin/purchase-orders', { state: { supplierId: id } })}
                            >
                                View All Orders
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Rating Modal */}
            {showRatingModal && (
                <div className="modal-overlay" onClick={() => setShowRatingModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Rate Supplier</h2>
                            <button className="close-btn" onClick={() => setShowRatingModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleRateSupplier}>
                            <div className="form-group">
                                <label>Rating (1-5 stars)</label>
                                <select
                                    value={rating.score}
                                    onChange={(e) => setRating({ ...rating, score: parseInt(e.target.value) })}
                                    required
                                >
                                    <option value="5">⭐⭐⭐⭐⭐ Excellent</option>
                                    <option value="4">⭐⭐⭐⭐ Good</option>
                                    <option value="3">⭐⭐⭐ Average</option>
                                    <option value="2">⭐⭐ Poor</option>
                                    <option value="1">⭐ Very Poor</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Comment</label>
                                <textarea
                                    value={rating.comment}
                                    onChange={(e) => setRating({ ...rating, comment: e.target.value })}
                                    rows="4"
                                    placeholder="Share your experience with this supplier..."
                                />
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowRatingModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Submit Rating
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SupplierDetails;
