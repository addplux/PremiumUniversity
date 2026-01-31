import { useState, useEffect } from 'react';
import axios from 'axios';
import './BidEvaluation.css';

const BidEvaluation = () => {
    const [tenders, setTenders] = useState([]);
    const [selectedTender, setSelectedTender] = useState(null);
    const [bids, setBids] = useState([]);
    const [viewMode, setViewMode] = useState('list'); // 'list', 'score'
    const [currentBid, setCurrentBid] = useState(null);

    // Evaluation Form State
    const [scores, setScores] = useState({
        technical: 0,
        financial: 0,
        comments: ''
    });

    useEffect(() => {
        // Fetch tenders under evaluation
        // Mock data fetch for list
        const fetchTenders = async () => {
            // In real app: /api/tenders?status=Under Evaluation
            // We'll simulate fetching all and filtering in frontend for MVP demo
            try {
                const res = await axios.get('/api/public/tenders');
                setTenders(res.data.data || []);
            } catch (err) { console.error(err); }
        };
        fetchTenders();
    }, []);

    const handleSelectTender = async (tenderId) => {
        try {
            const res = await axios.get(`/api/bids/tender/${tenderId}`);
            if (res.data.success) {
                setBids(res.data.data);
                setSelectedTender(tenderId);
            }
        } catch (error) {
            alert('Error fetching bids: ' + error.message);
        }
    };

    const handleScoreBid = (bid) => {
        setCurrentBid(bid);
        setViewMode('score');
    };

    const submitEvaluation = async () => {
        try {
            // Transform simplified state to API structure
            const payload = {
                tenderId: selectedTender,
                bidId: currentBid._id,
                scores: [
                    { criteriaName: 'Technical', score: parseInt(scores.technical), comments: scores.comments },
                    { criteriaName: 'Financial', score: parseInt(scores.financial) }
                ]
            };

            await axios.post('/api/evaluation/score', payload);
            alert('Score submitted successfully');
            setViewMode('list');
            setScores({ technical: 0, financial: 0, comments: '' });
        } catch (error) {
            alert('Error submitting score');
        }
    };

    return (
        <div className="evaluation-page">
            <h1 className="page-title">Bid Evaluation Committee</h1>

            {!selectedTender ? (
                <div className="tender-selection card">
                    <h3>Select Tender for Evaluation</h3>
                    <div className="list-group">
                        {tenders.map(t => (
                            <button key={t._id} className="list-item" onClick={() => handleSelectTender(t._id)}>
                                {t.title} <span className="status-pill">{t.status}</span>
                            </button>
                        ))}
                    </div>
                </div>
            ) : viewMode === 'list' ? (
                <div className="bids-list-view">
                    <button className="btn btn-secondary mb-4" onClick={() => setSelectedTender(null)}>← Back to Tenders</button>
                    <h2>Received Bids</h2>
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Supplier</th>
                                <th>Bid Amount</th>
                                <th>Submission Date</th>
                                <th>Score</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bids.map(bid => (
                                <tr key={bid._id}>
                                    <td>{bid.supplierId.name}</td>
                                    <td>${bid.totalAmount.toLocaleString()}</td>
                                    <td>{new Date(bid.submissionDate).toLocaleDateString()}</td>
                                    <td>{bid.score?.total || '-'}</td>
                                    <td>
                                        <button className="btn btn-sm btn-primary" onClick={() => handleScoreBid(bid)}>Evaluate</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="scoring-interface">
                    <div className="split-view">
                        <div className="doc-viewer card">
                            <h3>Proposal Documents: {currentBid.supplierId.name}</h3>
                            <div className="pdf-placeholder">
                                <p>📄 Technical Proposal.pdf</p>
                                <button className="btn btn-sm btn-outline">View</button>
                            </div>
                            <div className="pdf-placeholder">
                                <p>💰 Financial Proposal.pdf</p>
                                <button className="btn btn-sm btn-outline">View</button>
                            </div>
                        </div>

                        <div className="score-sheet card">
                            <h3>Score Sheet</h3>
                            <div className="form-group">
                                <label>Technical Score (Max 70)</label>
                                <input
                                    type="number" className="form-control" max="70"
                                    value={scores.technical}
                                    onChange={e => setScores({ ...scores, technical: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Financial Score (Max 30)</label>
                                <input
                                    type="number" className="form-control" max="30"
                                    value={scores.financial}
                                    onChange={e => setScores({ ...scores, financial: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Evaluator Comments</label>
                                <textarea
                                    className="form-control" rows="3"
                                    value={scores.comments}
                                    onChange={e => setScores({ ...scores, comments: e.target.value })}
                                ></textarea>
                            </div>
                            <div className="form-actions">
                                <button className="btn btn-success" onClick={submitEvaluation}>Submit Score</button>
                                <button className="btn btn-secondary" onClick={() => setViewMode('list')}>Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BidEvaluation;
