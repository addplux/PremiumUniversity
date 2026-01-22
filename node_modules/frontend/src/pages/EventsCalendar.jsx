import { useState, useEffect } from 'react';
import axios from 'axios';
import '../pages/ApplicationsManager.css';

const EventsCalendar = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const res = await axios.get('/events');
            if (res.data.success) {
                setEvents(res.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch events:', error);
        } finally {
            setLoading(false);
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'Academic': return '#1a56db';
            case 'Workshop': return '#10b981';
            case 'Social': return '#f59e0b';
            case 'Holiday': return '#ef4444';
            default: return '#64748b';
        }
    };

    return (
        <div className="apps-manager">
            <div className="manager-header">
                <h1>Campus Events</h1>
            </div>

            <div style={{ padding: '1.5rem' }}>
                {loading ? (
                    <p>Loading events...</p>
                ) : events.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '12px' }}>
                        <p>No upcoming events at the moment.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                        {events.map(event => (
                            <div key={event._id} style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                                <div style={{ height: '8px', background: getTypeColor(event.type) }}></div>
                                <div style={{ padding: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: getTypeColor(event.type), textTransform: 'uppercase' }}>
                                            {event.type}
                                        </span>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontWeight: 'bold' }}>{new Date(event.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{new Date(event.date).getFullYear()}</div>
                                        </div>
                                    </div>
                                    <h3 style={{ marginBottom: '0.5rem' }}>{event.title}</h3>
                                    <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1rem' }}>{event.description}</p>
                                    <div style={{ fontSize: '0.875rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        📍 {event.location}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default EventsCalendar;
