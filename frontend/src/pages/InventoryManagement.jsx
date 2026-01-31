import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './InventoryManagement.css';

const InventoryManagement = () => {
    const navigate = useNavigate();
    const [inventory, setInventory] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [showAdjustModal, setShowAdjustModal] = useState(false);
    const [lowStockAlerts, setLowStockAlerts] = useState({ lowStock: [], outOfStock: [] });
    const [filters, setFilters] = useState({
        warehouseId: '',
        lowStock: false
    });

    const [transferData, setTransferData] = useState({
        productId: '',
        fromWarehouseId: '',
        toWarehouseId: '',
        quantity: 1,
        notes: ''
    });

    const [adjustData, setAdjustData] = useState({
        inventoryId: '',
        quantity: 0,
        reason: '',
        notes: ''
    });

    useEffect(() => {
        fetchInventory();
        fetchWarehouses();
        fetchLowStockAlerts();
    }, [filters]);

    const fetchInventory = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                ...filters,
                lowStock: filters.lowStock ? 'true' : ''
            });
            const res = await axios.get(`/api/inventory?${params}`);
            if (res.data.success) {
                setInventory(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching inventory:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchWarehouses = async () => {
        try {
            const res = await axios.get('/api/warehouses');
            if (res.data.success) {
                setWarehouses(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching warehouses:', error);
        }
    };

    const fetchLowStockAlerts = async () => {
        try {
            const res = await axios.get('/api/inventory/low-stock');
            if (res.data.success) {
                setLowStockAlerts(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching low stock alerts:', error);
        }
    };

    const handleTransfer = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/inventory/transfer', transferData);
            alert('Stock transferred successfully');
            setShowTransferModal(false);
            resetTransferForm();
            fetchInventory();
        } catch (error) {
            console.error('Error transferring stock:', error);
            alert(error.response?.data?.message || 'Failed to transfer stock');
        }
    };

    const handleAdjust = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/inventory/adjust', adjustData);
            alert('Stock adjusted successfully');
            setShowAdjustModal(false);
            resetAdjustForm();
            fetchInventory();
        } catch (error) {
            console.error('Error adjusting stock:', error);
            alert(error.response?.data?.message || 'Failed to adjust stock');
        }
    };

    const resetTransferForm = () => {
        setTransferData({
            productId: '',
            fromWarehouseId: '',
            toWarehouseId: '',
            quantity: 1,
            notes: ''
        });
    };

    const resetAdjustForm = () => {
        setAdjustData({
            inventoryId: '',
            quantity: 0,
            reason: '',
            notes: ''
        });
    };

    const getStockStatusBadge = (item) => {
        if (item.quantity === 0) {
            return <span className="badge badge-danger">Out of Stock</span>;
        } else if (item.quantity <= item.reorderLevel) {
            return <span className="badge badge-warning">Low Stock</span>;
        } else if (item.maxStockLevel && item.quantity >= item.maxStockLevel) {
            return <span className="badge badge-info">Overstock</span>;
        }
        return <span className="badge badge-success">In Stock</span>;
    };

    const getConditionBadge = (condition) => {
        const colors = {
            'New': 'badge-success',
            'Good': 'badge-info',
            'Fair': 'badge-warning',
            'Damaged': 'badge-danger',
            'Expired': 'badge-danger'
        };
        return <span className={`badge ${colors[condition]}`}>{condition}</span>;
    };

    return (
        <div className="inventory-management">
            <div className="page-header">
                <div>
                    <h1>Inventory Management</h1>
                    <p>Track and manage stock levels</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-secondary" onClick={() => setShowTransferModal(true)}>
                        Transfer Stock
                    </button>
                    <button className="btn btn-primary" onClick={() => setShowAdjustModal(true)}>
                        Adjust Stock
                    </button>
                </div>
            </div>

            {/* Alerts Section */}
            {(lowStockAlerts.lowStock.length > 0 || lowStockAlerts.outOfStock.length > 0) && (
                <div className="alerts-section">
                    {lowStockAlerts.outOfStock.length > 0 && (
                        <div className="alert alert-danger">
                            <strong>⚠️ Out of Stock:</strong> {lowStockAlerts.outOfStock.length} item(s) are out of stock
                        </div>
                    )}
                    {lowStockAlerts.lowStock.length > 0 && (
                        <div className="alert alert-warning">
                            <strong>⚠️ Low Stock:</strong> {lowStockAlerts.lowStock.length} item(s) need reordering
                        </div>
                    )}
                </div>
            )}

            {/* Filters */}
            <div className="filters-section">
                <select
                    value={filters.warehouseId}
                    onChange={(e) => setFilters({ ...filters, warehouseId: e.target.value })}
                    className="filter-select"
                >
                    <option value="">All Warehouses</option>
                    {warehouses.map(wh => (
                        <option key={wh._id} value={wh._id}>{wh.name}</option>
                    ))}
                </select>
                <label className="checkbox-label">
                    <input
                        type="checkbox"
                        checked={filters.lowStock}
                        onChange={(e) => setFilters({ ...filters, lowStock: e.target.checked })}
                    />
                    Show Low Stock Only
                </label>
            </div>

            {/* Inventory Table */}
            {loading ? (
                <div className="loading-state">Loading inventory...</div>
            ) : (
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Warehouse</th>
                                <th>Location</th>
                                <th>Quantity</th>
                                <th>Available</th>
                                <th>Reorder Level</th>
                                <th>Unit Cost</th>
                                <th>Total Value</th>
                                <th>Condition</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {inventory.length === 0 ? (
                                <tr>
                                    <td colSpan="11" className="text-center">No inventory items found</td>
                                </tr>
                            ) : (
                                inventory.map((item) => (
                                    <tr key={item._id}>
                                        <td>
                                            <div className="product-info">
                                                <strong>{item.productId?.name || 'N/A'}</strong>
                                                <small>{item.productId?.sku || ''}</small>
                                            </div>
                                        </td>
                                        <td>{item.warehouseId?.name || 'N/A'}</td>
                                        <td>{item.locationCode || '-'}</td>
                                        <td>
                                            <span className="quantity">{item.quantity}</span>
                                            <small> {item.productId?.unit || ''}</small>
                                        </td>
                                        <td>{item.availableQuantity}</td>
                                        <td>{item.reorderLevel}</td>
                                        <td>${item.unitCost.toFixed(2)}</td>
                                        <td className="value">${item.totalValue.toLocaleString()}</td>
                                        <td>{getConditionBadge(item.condition)}</td>
                                        <td>{getStockStatusBadge(item)}</td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    className="btn-icon"
                                                    onClick={() => navigate(`/admin/inventory/${item._id}`)}
                                                    title="View Details"
                                                >
                                                    👁️
                                                </button>
                                                <button
                                                    className="btn-icon"
                                                    onClick={() => {
                                                        setAdjustData({ ...adjustData, inventoryId: item._id });
                                                        setShowAdjustModal(true);
                                                    }}
                                                    title="Adjust Stock"
                                                >
                                                    ⚙️
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Transfer Modal */}
            {showTransferModal && (
                <div className="modal-overlay" onClick={() => { setShowTransferModal(false); resetTransferForm(); }}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Transfer Stock</h2>
                            <button className="close-btn" onClick={() => { setShowTransferModal(false); resetTransferForm(); }}>×</button>
                        </div>
                        <form onSubmit={handleTransfer}>
                            <div className="form-group">
                                <label>Product ID *</label>
                                <input
                                    type="text"
                                    required
                                    value={transferData.productId}
                                    onChange={(e) => setTransferData({ ...transferData, productId: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>From Warehouse *</label>
                                <select
                                    required
                                    value={transferData.fromWarehouseId}
                                    onChange={(e) => setTransferData({ ...transferData, fromWarehouseId: e.target.value })}
                                >
                                    <option value="">Select warehouse</option>
                                    {warehouses.map(wh => (
                                        <option key={wh._id} value={wh._id}>{wh.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>To Warehouse *</label>
                                <select
                                    required
                                    value={transferData.toWarehouseId}
                                    onChange={(e) => setTransferData({ ...transferData, toWarehouseId: e.target.value })}
                                >
                                    <option value="">Select warehouse</option>
                                    {warehouses.map(wh => (
                                        <option key={wh._id} value={wh._id}>{wh.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Quantity *</label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    value={transferData.quantity}
                                    onChange={(e) => setTransferData({ ...transferData, quantity: parseInt(e.target.value) })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Notes</label>
                                <textarea
                                    value={transferData.notes}
                                    onChange={(e) => setTransferData({ ...transferData, notes: e.target.value })}
                                    rows="3"
                                />
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => { setShowTransferModal(false); resetTransferForm(); }}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Transfer Stock
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Adjust Modal */}
            {showAdjustModal && (
                <div className="modal-overlay" onClick={() => { setShowAdjustModal(false); resetAdjustForm(); }}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Adjust Stock</h2>
                            <button className="close-btn" onClick={() => { setShowAdjustModal(false); resetAdjustForm(); }}>×</button>
                        </div>
                        <form onSubmit={handleAdjust}>
                            <div className="form-group">
                                <label>Inventory ID *</label>
                                <input
                                    type="text"
                                    required
                                    value={adjustData.inventoryId}
                                    onChange={(e) => setAdjustData({ ...adjustData, inventoryId: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Adjustment Quantity * (use negative for decrease)</label>
                                <input
                                    type="number"
                                    required
                                    value={adjustData.quantity}
                                    onChange={(e) => setAdjustData({ ...adjustData, quantity: parseInt(e.target.value) })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Reason *</label>
                                <input
                                    type="text"
                                    required
                                    value={adjustData.reason}
                                    onChange={(e) => setAdjustData({ ...adjustData, reason: e.target.value })}
                                    placeholder="e.g., Damaged items, Stock count correction"
                                />
                            </div>
                            <div className="form-group">
                                <label>Notes</label>
                                <textarea
                                    value={adjustData.notes}
                                    onChange={(e) => setAdjustData({ ...adjustData, notes: e.target.value })}
                                    rows="3"
                                />
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => { setShowAdjustModal(false); resetAdjustForm(); }}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Adjust Stock
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InventoryManagement;
