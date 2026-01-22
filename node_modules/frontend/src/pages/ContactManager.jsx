import { useState, useEffect } from 'react';
import axios from 'axios';
import './ApplicationsManager.css'; // Reusing the same styles for consistency

const ContactManager = () => {
    const [contacts, setContacts] = useState([]);
    const [selectedContact, setSelectedContact] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchContacts();
    }, []);

    const fetchContacts = async () => {
        try {
            const response = await axios.get('/contact');
            if (response.data.success) {
                setContacts(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch contacts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (contactId) => {
        if (!window.confirm('Are you sure you want to delete this message?')) return;
        try {
            await axios.delete(`/contact/${contactId}`);
            setContacts(items => items.filter(c => c._id !== contactId));
            if (selectedContact && selectedContact._id === contactId) {
                setSelectedContact(null);
            }
        } catch (error) {
            console.error('Failed to delete contact:', error);
            alert('Failed to delete contact');
        }
    };

    const handleStatusUpdate = async (id, newStatus, responseText) => {
        try {
            await axios.put(`/contact/${id}`, {
                status: newStatus,
                response: responseText
            });

            // Update local state
            setContacts(items => items.map(item =>
                item._id === id ? { ...item, status: newStatus, response: responseText } : item
            ));

            if (selectedContact && selectedContact._id === id) {
                setSelectedContact(prev => ({ ...prev, status: newStatus, response: responseText }));
            }
            alert('Response saved successfully');
        } catch (error) {
            console.error('Failed to update contact:', error);
            alert('Failed to save response');
        }
    };

    const filteredContacts = filter === 'all'
        ? contacts
        : contacts.filter(c => c.status === filter);

    return (
        <div className="apps-manager">
            <div className="manager-header">
                <h1>Inquiry Management</h1>
                <div className="filters">
                    <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                        <option value="all">All Inquiries</option>
                        <option value="pending">Pending</option>
                        <option value="responded">Responded</option>
                        <option value="closed">Closed</option>
                    </select>
                </div>
            </div>

            <div className="manager-content">
                <div className="apps-list-sidebar">
                    {loading ? <p>Loading...</p> : filteredContacts.map(contact => (
                        <div
                            key={contact._id}
                            className={`app-item ${selectedContact?._id === contact._id ? 'active' : ''}`}
                            onClick={() => setSelectedContact(contact)}
                        >
                            <div className="app-item-header">
                                <span className="app-name">{contact.name}</span>
                                <span className={`status-dot status-${contact.status || 'pending'}`}></span>
                            </div>
                            <p className="app-program">{contact.subject}</p>
                            <p className="app-date">{new Date(contact.createdAt).toLocaleDateString()}</p>
                        </div>
                    ))}
                </div>

                <div className="app-detail-view">
                    {selectedContact ? (
                        <ContactDetail
                            contact={selectedContact}
                            onUpdate={handleStatusUpdate}
                            onDelete={handleDelete}
                        />
                    ) : (
                        <div className="no-selection">
                            <p>Select an inquiry to view</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const ContactDetail = ({ contact, onUpdate, onDelete }) => {
    const [responseText, setResponseText] = useState(contact.response || '');
    const [status, setStatus] = useState(contact.status || 'pending');

    useEffect(() => {
        setResponseText(contact.response || '');
        setStatus(contact.status || 'pending');
    }, [contact]);

    const handleSave = () => {
        onUpdate(contact._id, status, responseText);
    };

    return (
        <div className="app-detail-container">
            <div className="detail-header">
                <div>
                    <h2>{contact.subject}</h2>
                    <p className="detail-program">From: <strong>{contact.name}</strong> ({contact.email})</p>
                </div>
                <div className="actions">
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className={`status-select-large`}
                        style={{ marginRight: '1rem' }}
                    >
                        <option value="pending">Pending</option>
                        <option value="responded">Responded</option>
                        <option value="closed">Closed</option>
                    </select>
                    <button
                        onClick={() => onDelete(contact._id)}
                        style={{
                            background: '#fee2e2',
                            color: '#b91c1c',
                            border: 'none',
                            padding: '0.6rem 1rem',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '600'
                        }}
                    >
                        Delete
                    </button>
                </div>
            </div>

            <div className="detail-grid" style={{ gridTemplateColumns: '1fr' }}>
                <section className="detail-section">
                    <h3>Message</h3>
                    <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', color: '#334155' }}>
                        {contact.message}
                    </p>
                    <div className="info-grid" style={{ marginTop: '1rem' }}>
                        <div className="info-item">
                            <label>Phone</label>
                            <p>{contact.phone || '-'}</p>
                        </div>
                        <div className="info-item">
                            <label>Type</label>
                            <p>{contact.type}</p>
                        </div>
                    </div>
                </section>

                <section className="detail-section">
                    <h3>Internal Response</h3>
                    <textarea
                        className="response-box"
                        rows="6"
                        value={responseText}
                        onChange={(e) => setResponseText(e.target.value)}
                        placeholder="Type your response notes here (this does not email the user automatically yet)..."
                        style={{
                            width: '100%',
                            padding: '1rem',
                            border: '1px solid #cbd5e1',
                            borderRadius: '6px',
                            marginBottom: '1rem',
                            fontFamily: 'inherit'
                        }}
                    ></textarea>

                    <button
                        onClick={handleSave}
                        style={{
                            background: 'var(--primary-color, #1a56db)',
                            color: 'white',
                            border: 'none',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '600'
                        }}
                    >
                        Save Response Status
                    </button>
                </section>
            </div>
        </div>
    );
};

export default ContactManager;
