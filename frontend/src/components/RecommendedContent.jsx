import { useState, useEffect } from 'react';
import axios from 'axios';
import '../pages/ApplicationsManager.css';

const RecommendedContent = () => {
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRecommendations();
    }, []);

    const fetchRecommendations = async () => {
        try {
            const res = await axios.get('/ai/content/recommendations');
            if (res.data.success) {
                setRecommendations(res.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch recommendations:', error);
        } finally {
            setLoading(false);
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'video': return '🎥';
            case 'document': return '📄';
            case 'quiz': return '❓';
            default: return '📚';
        }
    };

    return (
        <div className="recommendations-widget" style={{
            background: 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <span style={{ fontSize: '1.2rem' }}>✨</span>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b' }}>Recommended for You</h3>
            </div>

            {loading ? (
                <div style={{ color: '#94a3b8', fontSize: '0.9rem', textAlign: 'center', padding: '1rem' }}>
                    Finding personalized content...
                </div>
            ) : recommendations.length === 0 ? (
                <div style={{ color: '#94a3b8', fontSize: '0.9rem', textAlign: 'center', padding: '1rem' }}>
                    No recommendations yet. Start exploring courses!
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {recommendations.map(item => (
                        <div key={item.id} style={{
                            display: 'flex',
                            gap: '1rem',
                            padding: '1rem',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0',
                            transition: 'all 0.2s',
                            cursor: 'pointer'
                        }}>
                            <div style={{
                                width: '40px', height: '40px',
                                background: '#f1f5f9',
                                borderRadius: '8px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '1.2rem'
                            }}>
                                {getTypeIcon(item.type)}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>{item.title}</div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    {item.tags.map(tag => (
                                        <span key={tag} style={{
                                            fontSize: '0.7rem',
                                            background: '#f1f5f9',
                                            color: '#475569',
                                            padding: '2px 6px',
                                            borderRadius: '4px'
                                        }}>
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div style={{
                                display: 'flex', alignItems: 'center',
                                fontSize: '0.8rem', color: '#16a34a', fontWeight: '500'
                            }}>
                                {Math.round(item.relevance * 100)}% Match
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RecommendedContent;
