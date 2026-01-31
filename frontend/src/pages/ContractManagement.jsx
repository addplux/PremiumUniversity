import { useState, useEffect } from 'react';
import axios from 'axios';
import ContractStatusBadge from '../components/ContractStatusBadge';
import './ContractManagement.css';

const ContractManagement = () => {
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expiringCount, setExpiringCount] = useState(0);

    const [showModal, setShowModal] = useState(false);
    const [newContract, setNewContract] = useState({
        title: '',
        supplierId: '', // Should be dropdown
        type: 'Fixed Price',
        startDate: '',
        endDate: '',
        value: 0,
        terms: '',
        status: 'Draft'
    });

    useEffect(() => {
        fetchContracts();
        fetchExpiring();
    }, []);

    const fetchContracts = async () => {
        try {
            setLoading(true);
            const res = await axios.get('/api/contracts');
            if (res.data.success) {
                setContracts(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching contracts:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchExpiring = async () => {
        try {
            const res = await axios.get('/api/contracts/expiring');
            if (res.data.success) {
                setExpiringCount(res.data.count);
            }
        } catch (error) {
            console.error('Error fetching expiring contracts:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/contracts', newContract);
            alert('Contract created successfully');
            setShowModal(false);
            fetchContracts();
        } catch (error) {
            alert('Error creating contract: ' + error.message);
        }
    };

    return (
        <div className="contract-page">
            <div className="page-header">
                <div>
                    <h1>Contract Management</h1>
                    <p>Manage supplier agreements, renewals, and compliance.</p>
                </div>
                {expiringCount > 0 && (
                    <div className="alert-banner">
                        ⚠️ You have {expiringCount} contract(s) expiring in the next 30 days.
                    </div>
                )}
            </div>

            <div className="toolbar">
                <input type="text" placeholder="Search contracts..." className="search-input" />
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    + New Contract
                </button>
            </div>

            <div className="contracts-container">
                {loading ? <p>Loading...</p> : (
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Contract #</th>
                                <th>Title</th>
                                <th>Supplier</th>
                                <th>Dates</th>
                                <th>Value</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contracts.map(contract => (
                                <tr key={contract._id}>
                                    <td>{contract.contractNumber}</td>
                                    <td>{contract.title}</td>
                                    <td>{contract.supplierId?.name || 'Unknown'}</td>
                                    <td>
                                        {new Date(contract.startDate).toLocaleDateString()} - {new Date(contract.endDate).toLocaleDateString()}
                                    </td>
                                    <td>${contract.value.toLocaleString()}</td>
                                    <td>
                                        <ContractStatusBadge
                                            status={contract.status}
                                            endDate={contract.endDate}
                                        />
                                    </td>
                                    <td>
                                        <button className="btn btn-sm btn-secondary">View</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal for New Contract */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Create New Contract</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Title</label>
                                <input
                                    className="form-control"
                                    value={newContract.title}
                                    onChange={e => setNewContract({ ...newContract, title: e.target.value })}
                                    required
                                />
                            </div>
                            {/* ... Add other fields for MVP demo ... */}
                            <div className="modal-actions">
                                <button type="submit" className="btn btn-primary">Create</button>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContractManagement;
