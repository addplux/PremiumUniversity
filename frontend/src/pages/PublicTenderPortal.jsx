import { useState, useEffect } from 'react';
import axios from 'axios';
import './PublicTenderPortal.css';

const PublicTenderPortal = () => {
    const [tenders, setTenders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchPublicTenders();
    }, []);

    const fetchPublicTenders = async () => {
        try {
            const res = await axios.get('/api/tenders/public');
            if (res.data.success) {
                setTenders(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching public tenders:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredTenders = tenders.filter(t =>
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="public-portal yard-theme">
            <header className="portal-header glass-header">
                <div className="container">
                    <div className="brand-badge">Yard Procurement</div>
                    <h1>Global Opportunities</h1>
                    <p>Secure, transparent, and efficient tendering for modern suppliers.</p>
                </div>
            </header>

            <main className="container portal-content">
                <div className="search-bar premium-search">
                    <input
                        type="text"
                        placeholder="Search for tenders (e.g. Construction, IT Services)..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                    <button className="btn btn-primary">Search</button>
                </div>

                <div className="tender-cards">
                    {loading ? <p>Loading opportunities...</p> : filteredTenders.length === 0 ? (
                        <p className="no-data">No open tenders found matching your criteria.</p>
                    ) : (
                        filteredTenders.map(tender => (
                            <div key={tender._id} className="tender-card">
                                <div className="card-header">
                                    <span className="tender-type">{tender.type}</span>
                                    <span className="tender-status">Open</span>
                                </div>
                                <h3>{tender.title}</h3>
                                <p className="tender-desc">{tender.description.substring(0, 150)}...</p>
                                <div className="tender-meta">
                                    <span>📅 Closing: {new Date(tender.closingDate).toLocaleDateString()}</span>
                                    <span>📂 Category: {tender.category}</span>
                                </div>
                                <div className="card-actions">
                                    <button className="btn btn-outline">View Details</button>
                                    <button className="btn btn-primary">Submit Bid</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>

            <footer className="portal-footer">
                <div className="container">
                    <p>&copy; 2026 PremiumUniversity E-Procurement System</p>
                </div>
            </footer>
        </div>
    );
};

export default PublicTenderPortal;
