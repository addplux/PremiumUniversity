import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './BidSubmission.css';

const BidSubmission = () => {
    const { tenderId } = useParams();
    const navigate = useNavigate();
    const [tender, setTender] = useState(null);
    const [loading, setLoading] = useState(true);
    const [bid, setBid] = useState({
        totalAmount: 0,
        validityPeriod: 90,
        technicalProposalUrl: '', // In real app, this comes from file upload
        financialProposalUrl: '',
        notes: ''
    });

    useEffect(() => {
        const fetchTender = async () => {
            try {
                // Fetch basic public details even if logged in
                const res = await axios.get(`/api/public/tenders/${tenderId}`);
                if (res.data.success) {
                    setTender(res.data.data);
                }
            } catch (error) {
                alert('Tender not found or closed');
                navigate('/public');
            } finally {
                setLoading(false);
            }
        };
        if (tenderId) fetchTender();
    }, [tenderId, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/bids', {
                ...bid,
                tenderId
            });
            alert('Bid submitted successfully! You can view status in your dashboard.');
            navigate('/public'); // Redirect to portal or supplier dashboard
        } catch (error) {
            alert('Error submitting bid: ' + (error.response?.data?.message || error.message));
        }
    };

    if (loading) return <div>Loading tender details...</div>;

    return (
        <div className="bid-page">
            <div className="bid-container card">
                <h1>Submit Proposal</h1>
                <div className="tender-summary">
                    <h3>{tender?.title}</h3>
                    <p>Reference: {tender?.tenderNumber}</p>
                    <p>Closes: {new Date(tender?.closingDate).toLocaleDateString()}</p>
                </div>

                <form onSubmit={handleSubmit} className="bid-form">
                    <div className="form-group">
                        <label>Total Bid Amount (USD)</label>
                        <input
                            type="number"
                            className="form-control"
                            required
                            min="0"
                            value={bid.totalAmount}
                            onChange={e => setBid({ ...bid, totalAmount: parseFloat(e.target.value) })}
                        />
                    </div>

                    <div className="form-group">
                        <label>Bid Validity (Days)</label>
                        <input
                            type="number"
                            className="form-control"
                            required
                            min="30"
                            value={bid.validityPeriod}
                            onChange={e => setBid({ ...bid, validityPeriod: parseInt(e.target.value) })}
                        />
                    </div>

                    <div className="file-upload-section">
                        <h4>Proposal Documents</h4>
                        <div className="form-group">
                            <label>Technical Proposal (PDF)</label>
                            {/* Mock File Upload */}
                            <input type="file" className="form-control" />
                            <small className="hint">Mock: File upload simulated. URL generated automatically.</small>
                        </div>
                        <div className="form-group">
                            <label>Financial Proposal (PDF)</label>
                            <input type="file" className="form-control" />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Additional Notes</label>
                        <textarea
                            className="form-control"
                            rows="4"
                            value={bid.notes}
                            onChange={e => setBid({ ...bid, notes: e.target.value })}
                        ></textarea>
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="btn btn-primary btn-lg">Submit Secure Bid</button>
                        <button type="button" className="btn btn-secondary" onClick={() => navigate('/public')}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BidSubmission;
