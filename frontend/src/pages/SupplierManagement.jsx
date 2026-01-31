import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './SupplierManagement.css';

const SupplierManagement = () => {
    const navigate = useNavigate();
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState(null);
    const [filters, setFilters] = useState({
        status: '',
        category: '',
        search: ''
    });
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        pages: 0
    });

    const [formData, setFormData] = useState({
        name: '',
        registrationNumber: '',
        taxId: '',
        email: '',
        phone: '',
        category: 'Goods',
        status: 'Active',
        address: {
            street: '',
            city: '',
            state: '',
            country: '',
            postalCode: ''
        },
        contactPerson: {
            name: '',
            email: '',
            phone: '',
            position: ''
        },
        bankDetails: {
            bankName: '',
            accountNumber: '',
            accountName: '',
            swiftCode: '',
            branchCode: ''
        },
        notes: ''
    });

    useEffect(() => {
        fetchSuppliers();
    }, [filters, pagination.page]);

    const fetchSuppliers = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: pagination.page,
                limit: pagination.limit,
                ...filters
            });

            const res = await axios.get(`/api/suppliers?${params}`);
            if (res.data.success) {
                setSuppliers(res.data.data);
                setPagination(prev => ({
                    ...prev,
                    total: res.data.pagination.total,
                    pages: res.data.pagination.pages
                }));
            }
        } catch (error) {
            console.error('Error fetching suppliers:', error);
            alert('Failed to fetch suppliers');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingSupplier) {
                await axios.put(`/api/suppliers/${editingSupplier._id}`, formData);
                alert('Supplier updated successfully');
            } else {
                await axios.post('/api/suppliers', formData);
                alert('Supplier created successfully');
            }
            setShowModal(false);
            resetForm();
            fetchSuppliers();
        } catch (error) {
            console.error('Error saving supplier:', error);
            alert(error.response?.data?.message || 'Failed to save supplier');
        }
    };

    const handleEdit = (supplier) => {
        setEditingSupplier(supplier);
        setFormData(supplier);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to deactivate this supplier?')) return;

        try {
            await axios.delete(`/api/suppliers/${id}`);
            alert('Supplier deactivated successfully');
            fetchSuppliers();
        } catch (error) {
            console.error('Error deleting supplier:', error);
            alert('Failed to deactivate supplier');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            registrationNumber: '',
            taxId: '',
            email: '',
            phone: '',
            category: 'Goods',
            status: 'Active',
            address: { street: '', city: '', state: '', country: '', postalCode: '' },
            contactPerson: { name: '', email: '', phone: '', position: '' },
            bankDetails: { bankName: '', accountNumber: '', accountName: '', swiftCode: '', branchCode: '' },
            notes: ''
        });
        setEditingSupplier(null);
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

    return (
        <div className="supplier-management">
            <div className="page-header">
                <div>
                    <h1>Supplier Management</h1>
                    <p>Manage your vendors and suppliers</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    + Add Supplier
                </button>
            </div>

            {/* Filters */}
            <div className="filters-section">
                <input
                    type="text"
                    placeholder="Search by name, email, or registration number..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="search-input"
                />
                <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="filter-select"
                >
                    <option value="">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Blacklisted">Blacklisted</option>
                </select>
                <select
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                    className="filter-select"
                >
                    <option value="">All Categories</option>
                    <option value="Goods">Goods</option>
                    <option value="Services">Services</option>
                    <option value="Works">Works</option>
                    <option value="Consultancy">Consultancy</option>
                    <option value="Other">Other</option>
                </select>
            </div>

            {/* Suppliers Table */}
            {loading ? (
                <div className="loading-state">Loading suppliers...</div>
            ) : (
                <>
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Supplier Name</th>
                                    <th>Registration No.</th>
                                    <th>Category</th>
                                    <th>Contact</th>
                                    <th>Rating</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {suppliers.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="text-center">No suppliers found</td>
                                    </tr>
                                ) : (
                                    suppliers.map((supplier) => (
                                        <tr key={supplier._id}>
                                            <td>
                                                <div className="supplier-name">
                                                    <strong>{supplier.name}</strong>
                                                    <small>{supplier.taxId}</small>
                                                </div>
                                            </td>
                                            <td>{supplier.registrationNumber}</td>
                                            <td><span className="category-badge">{supplier.category}</span></td>
                                            <td>
                                                <div className="contact-info">
                                                    <div>{supplier.email}</div>
                                                    <small>{supplier.phone}</small>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="rating">
                                                    {getRatingStars(supplier.rating)}
                                                    <small>({supplier.rating.toFixed(1)})</small>
                                                </div>
                                            </td>
                                            <td>{getStatusBadge(supplier.status)}</td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button
                                                        className="btn-icon btn-view"
                                                        onClick={() => navigate(`/admin/suppliers/${supplier._id}`)}
                                                        title="View Details"
                                                    >
                                                        👁️
                                                    </button>
                                                    <button
                                                        className="btn-icon btn-edit"
                                                        onClick={() => handleEdit(supplier)}
                                                        title="Edit"
                                                    >
                                                        ✏️
                                                    </button>
                                                    <button
                                                        className="btn-icon btn-delete"
                                                        onClick={() => handleDelete(supplier._id)}
                                                        title="Deactivate"
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="pagination">
                        <button
                            disabled={pagination.page === 1}
                            onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                        >
                            Previous
                        </button>
                        <span>Page {pagination.page} of {pagination.pages}</span>
                        <button
                            disabled={pagination.page === pagination.pages}
                            onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                        >
                            Next
                        </button>
                    </div>
                </>
            )}

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => { setShowModal(false); resetForm(); }}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}</h2>
                            <button className="close-btn" onClick={() => { setShowModal(false); resetForm(); }}>×</button>
                        </div>
                        <form onSubmit={handleSubmit} className="supplier-form">
                            <div className="form-section">
                                <h3>Basic Information</h3>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Supplier Name *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Registration Number *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.registrationNumber}
                                            onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Tax ID *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.taxId}
                                            onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Email *</label>
                                        <input
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Phone *</label>
                                        <input
                                            type="tel"
                                            required
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Category *</label>
                                        <select
                                            required
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        >
                                            <option value="Goods">Goods</option>
                                            <option value="Services">Services</option>
                                            <option value="Works">Works</option>
                                            <option value="Consultancy">Consultancy</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="form-section">
                                <h3>Address</h3>
                                <div className="form-grid">
                                    <div className="form-group full-width">
                                        <label>Street Address</label>
                                        <input
                                            type="text"
                                            value={formData.address.street}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                address: { ...formData.address, street: e.target.value }
                                            })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>City</label>
                                        <input
                                            type="text"
                                            value={formData.address.city}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                address: { ...formData.address, city: e.target.value }
                                            })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>State/Province</label>
                                        <input
                                            type="text"
                                            value={formData.address.state}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                address: { ...formData.address, state: e.target.value }
                                            })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Country</label>
                                        <input
                                            type="text"
                                            value={formData.address.country}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                address: { ...formData.address, country: e.target.value }
                                            })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Postal Code</label>
                                        <input
                                            type="text"
                                            value={formData.address.postalCode}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                address: { ...formData.address, postalCode: e.target.value }
                                            })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="form-section">
                                <h3>Contact Person</h3>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Name</label>
                                        <input
                                            type="text"
                                            value={formData.contactPerson.name}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                contactPerson: { ...formData.contactPerson, name: e.target.value }
                                            })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Email</label>
                                        <input
                                            type="email"
                                            value={formData.contactPerson.email}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                contactPerson: { ...formData.contactPerson, email: e.target.value }
                                            })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Phone</label>
                                        <input
                                            type="tel"
                                            value={formData.contactPerson.phone}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                contactPerson: { ...formData.contactPerson, phone: e.target.value }
                                            })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Position</label>
                                        <input
                                            type="text"
                                            value={formData.contactPerson.position}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                contactPerson: { ...formData.contactPerson, position: e.target.value }
                                            })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="form-section">
                                <h3>Notes</h3>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    rows="3"
                                    placeholder="Additional notes about this supplier..."
                                />
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => { setShowModal(false); resetForm(); }}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingSupplier ? 'Update Supplier' : 'Create Supplier'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SupplierManagement;
