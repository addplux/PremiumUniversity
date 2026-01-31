import { useState, useEffect } from 'react';
import axios from 'axios';
import './TenderManagement.css';

const TenderManagement = () => {
    const [tenders, setTenders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Draft');
    const [showModal, setShowModal] = useState(false);

    // New Tender Form State
    const [newTender, setNewTender] = useState({
        title: '',
        type: 'Open Tender',
        category: 'Goods',
        closingDate: '',
        openingDate: '',
        description: '',
        budget: 0
    });

    useEffect(() => {
        fetchTenders();
    }, []);

    const fetchTenders = async () => {
        try {
            setLoading(true);
            // In a real app we'd filter via API params
            const res = await axios.get('/api/public/tenders'); // Re-using public list + internal should be separate
            // For admin, we should have a specific admin endpoint, but for MVP we will simulate by fetching all 
            // Mocking the "All Tenders" fetch since the public one filters by status
            // Assuming we added an admin route or using a mock data fallback if API is strict
            if (res.data.success) {
                setTenders(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching tenders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTender = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/tenders', newTender);
            alert('Tender created successfully');
            setShowModal(false);
            fetchTenders();
        } catch (error) {
            alert('Error creating tender: ' + (error.response?.data?.message || error.message));
        }
    };

    const handlePublish = async (id) => {
        if (!window.confirm('Are you sure you want to publish this tender? This will make it visible to the public.')) return;
        try {
            await axios.put(`/api/tenders/${id}/publish`);
            fetchTenders();
        } catch (error) {
            alert('Error publishing tender');
        }
    };

    // Filter tenders by tab (Simulated for MVP demo as we might not have enough data)
    // In real implementation, this filtering happens on the backend or we map statuses
    const filteredTenders = tenders; // .filter(t => t.status === activeTab);

    return (
        <div className="tender-page">
            <div className="page-header">
                <div>
                    <h1>Tender Management</h1>
                    <p>Create, publish, and track procurement opportunities.</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    + Create Tender
                </button>
            </div>

            <div className="tabs">
                {['Draft', 'Published', 'closed', 'Awarded'].map(tab => (
                    <button
                        key={tab}
                        className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="tenders-list">
                {loading ? <p>Loading...</p> : (
                    <table className="table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Title</th>
                                <th>Type</th>
                                <th>Closing Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTenders.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center">No tenders found in this category.</td>
                                </tr>
                            ) : (
                                filteredTenders.map(tender => (
                                    <tr key={tender._id}>
                                        <td>{tender.tenderNumber || 'N/A'}</td>
                                        <td>{tender.title}</td>
                                        <td>{tender.type}</td>
                                        <td>{new Date(tender.closingDate).toLocaleDateString()}</td>
                                        <td>
                                            <span className={`badge badge-${tender.status.toLowerCase()}`}>
                                                {tender.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button className="btn btn-sm btn-secondary">Edit</button>
                                                {tender.status === 'Draft' && (
                                                    <button
                                                        className="btn btn-sm btn-success"
                                                        onClick={() => handlePublish(tender._id)}
                                                    >
                                                        Publish
                                                    </button>
                                                )}
                                                <button className="btn btn-sm btn-info">View Bids</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Create Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Create New Tender</h2>
                        <form onSubmit={handleCreateTender}>
                            <div className="form-group">
                                <label>Title</label>
                                <input
                                    className="form-control"
                                    value={newTender.title}
                                    onChange={e => setNewTender({ ...newTender, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Type</label>
                                    <select
                                        className="form-control"
                                        value={newTender.type}
                                        onChange={e => setNewTender({ ...newTender, type: e.target.value })}
                                    >
                                        <option>Open Tender</option>
                                        <option>Restricted Tender</option>
                                        <option>RFQ</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Category</label>
                                    <select
                                        className="form-control"
                                        value={newTender.category}
                                        onChange={e => setNewTender({ ...newTender, category: e.target.value })}
                                    >
                                        <option>Goods</option>
                                        <option>Works</option>
                                        <option>Services</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Closing Date</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={newTender.closingDate}
                                        onChange={e => setNewTender({ ...newTender, closingDate: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Opening Date</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={newTender.openingDate}
                                        onChange={e => setNewTender({ ...newTender, openingDate: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    className="form-control"
                                    rows="3"
                                    value={newTender.description}
                                    onChange={e => setNewTender({ ...newTender, description: e.target.value })}
                                ></textarea>
                            </div>
                            <div className="modal-actions">
                                <button type="submit" className="btn btn-primary">Create Draft</button>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TenderManagement;
