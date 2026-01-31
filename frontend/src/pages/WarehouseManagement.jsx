import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './WarehouseManagement.css';

const WarehouseManagement = () => {
    const navigate = useNavigate();
    const [warehouses, setWarehouses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingWarehouse, setEditingWarehouse] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        code: '',
        type: 'Main',
        address: {
            street: '',
            city: '',
            state: '',
            country: '',
            postalCode: ''
        },
        capacity: {
            total: 1000,
            unit: 'sqm'
        },
        managerId: '',
        status: 'Active',
        facilities: {
            coldStorage: false,
            securitySystem: false,
            fireProtection: false,
            loadingDock: false,
            forklifts: 0
        },
        notes: ''
    });

    useEffect(() => {
        fetchWarehouses();
    }, []);

    const fetchWarehouses = async () => {
        try {
            setLoading(true);
            const res = await axios.get('/api/warehouses');
            if (res.data.success) {
                setWarehouses(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching warehouses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingWarehouse) {
                await axios.put(`/api/warehouses/${editingWarehouse._id}`, formData);
                alert('Warehouse updated successfully');
            } else {
                await axios.post('/api/warehouses', formData);
                alert('Warehouse created successfully');
            }
            setShowModal(false);
            resetForm();
            fetchWarehouses();
        } catch (error) {
            console.error('Error saving warehouse:', error);
            alert(error.response?.data?.message || 'Failed to save warehouse');
        }
    };

    const handleEdit = (warehouse) => {
        setEditingWarehouse(warehouse);
        setFormData(warehouse);
        setShowModal(true);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            code: '',
            type: 'Main',
            address: { street: '', city: '', state: '', country: '', postalCode: '' },
            capacity: { total: 1000, unit: 'sqm' },
            managerId: '',
            status: 'Active',
            facilities: {
                coldStorage: false,
                securitySystem: false,
                fireProtection: false,
                loadingDock: false,
                forklifts: 0
            },
            notes: ''
        });
        setEditingWarehouse(null);
    };

    const getStatusBadge = (status) => {
        const colors = {
            Active: 'badge-success',
            Inactive: 'badge-secondary',
            Maintenance: 'badge-warning',
            Full: 'badge-danger'
        };
        return <span className={`badge ${colors[status]}`}>{status}</span>;
    };

    const getCapacityBar = (warehouse) => {
        const utilization = warehouse.capacityUtilization || 0;
        let color = '#10b981'; // green
        if (utilization > 80) color = '#ef4444'; // red
        else if (utilization > 60) color = '#f59e0b'; // orange

        return (
            <div className="capacity-bar">
                <div className="capacity-fill" style={{ width: `${utilization}%`, background: color }}></div>
                <span className="capacity-text">{utilization.toFixed(1)}%</span>
            </div>
        );
    };

    return (
        <div className="warehouse-management">
            <div className="page-header">
                <div>
                    <h1>Warehouse Management</h1>
                    <p>Manage storage facilities and locations</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    + Add Warehouse
                </button>
            </div>

            {/* Warehouses Grid */}
            {loading ? (
                <div className="loading-state">Loading warehouses...</div>
            ) : (
                <div className="warehouses-grid">
                    {warehouses.length === 0 ? (
                        <div className="empty-state">
                            <p>No warehouses found</p>
                            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                                Create Your First Warehouse
                            </button>
                        </div>
                    ) : (
                        warehouses.map((warehouse) => (
                            <div key={warehouse._id} className="warehouse-card">
                                <div className="card-header">
                                    <div>
                                        <h3>{warehouse.name}</h3>
                                        <p className="warehouse-code">{warehouse.code}</p>
                                    </div>
                                    {getStatusBadge(warehouse.status)}
                                </div>

                                <div className="card-body">
                                    <div className="info-row">
                                        <span className="label">Type:</span>
                                        <span>{warehouse.type}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Location:</span>
                                        <span>{warehouse.address?.city || 'N/A'}, {warehouse.address?.country || ''}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Manager:</span>
                                        <span>{warehouse.managerId?.name || 'Not assigned'}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Capacity:</span>
                                        <span>{warehouse.capacity.total} {warehouse.capacity.unit}</span>
                                    </div>

                                    <div className="capacity-section">
                                        <label>Utilization:</label>
                                        {getCapacityBar(warehouse)}
                                    </div>

                                    <div className="facilities">
                                        <h4>Facilities:</h4>
                                        <div className="facility-tags">
                                            {warehouse.facilities?.coldStorage && <span className="tag">❄️ Cold Storage</span>}
                                            {warehouse.facilities?.securitySystem && <span className="tag">🔒 Security</span>}
                                            {warehouse.facilities?.fireProtection && <span className="tag">🔥 Fire Protection</span>}
                                            {warehouse.facilities?.loadingDock && <span className="tag">🚚 Loading Dock</span>}
                                            {warehouse.facilities?.forklifts > 0 && (
                                                <span className="tag">🏗️ {warehouse.facilities.forklifts} Forklifts</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="card-footer">
                                    <button
                                        className="btn btn-sm btn-primary"
                                        onClick={() => navigate(`/admin/warehouses/${warehouse._id}/inventory`)}
                                    >
                                        View Inventory
                                    </button>
                                    <button
                                        className="btn btn-sm btn-secondary"
                                        onClick={() => handleEdit(warehouse)}
                                    >
                                        Edit
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => { setShowModal(false); resetForm(); }}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingWarehouse ? 'Edit Warehouse' : 'Add New Warehouse'}</h2>
                            <button className="close-btn" onClick={() => { setShowModal(false); resetForm(); }}>×</button>
                        </div>
                        <form onSubmit={handleSubmit} className="warehouse-form">
                            <div className="form-section">
                                <h3>Basic Information</h3>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Warehouse Name *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Code *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.code}
                                            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Type *</label>
                                        <select
                                            required
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        >
                                            <option value="Main">Main</option>
                                            <option value="Branch">Branch</option>
                                            <option value="Transit">Transit</option>
                                            <option value="Cold Storage">Cold Storage</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Manager ID *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.managerId}
                                            onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="form-section">
                                <h3>Address</h3>
                                <div className="form-grid">
                                    <div className="form-group full-width">
                                        <label>Street</label>
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
                                        <label>State</label>
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
                                <h3>Capacity</h3>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Total Capacity *</label>
                                        <input
                                            type="number"
                                            required
                                            min="1"
                                            value={formData.capacity.total}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                capacity: { ...formData.capacity, total: parseInt(e.target.value) }
                                            })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Unit *</label>
                                        <select
                                            required
                                            value={formData.capacity.unit}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                capacity: { ...formData.capacity, unit: e.target.value }
                                            })}
                                        >
                                            <option value="sqm">Square Meters (sqm)</option>
                                            <option value="cbm">Cubic Meters (cbm)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="form-section">
                                <h3>Facilities</h3>
                                <div className="checkbox-grid">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={formData.facilities.coldStorage}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                facilities: { ...formData.facilities, coldStorage: e.target.checked }
                                            })}
                                        />
                                        Cold Storage
                                    </label>
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={formData.facilities.securitySystem}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                facilities: { ...formData.facilities, securitySystem: e.target.checked }
                                            })}
                                        />
                                        Security System
                                    </label>
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={formData.facilities.fireProtection}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                facilities: { ...formData.facilities, fireProtection: e.target.checked }
                                            })}
                                        />
                                        Fire Protection
                                    </label>
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={formData.facilities.loadingDock}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                facilities: { ...formData.facilities, loadingDock: e.target.checked }
                                            })}
                                        />
                                        Loading Dock
                                    </label>
                                </div>
                                <div className="form-group">
                                    <label>Number of Forklifts</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.facilities.forklifts}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            facilities: { ...formData.facilities, forklifts: parseInt(e.target.value) || 0 }
                                        })}
                                    />
                                </div>
                            </div>

                            <div className="form-section">
                                <h3>Notes</h3>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    rows="3"
                                    placeholder="Additional notes..."
                                />
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => { setShowModal(false); resetForm(); }}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingWarehouse ? 'Update Warehouse' : 'Create Warehouse'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WarehouseManagement;
