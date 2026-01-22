import { useState, useEffect } from 'react';
import axios from 'axios';
import './ApplicationsManager.css';

const ApplicationsManager = () => {
    const [applications, setApplications] = useState([]);
    const [selectedApp, setSelectedApp] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            const response = await axios.get('/applications');
            if (response.data.success) {
                setApplications(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch applications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (appId) => {
        if (!window.confirm('Are you sure you want to delete this application?')) return;
        try {
            await axios.delete(`/applications/${appId}`);
            setApplications(apps => apps.filter(app => app._id !== appId));
            if (selectedApp && selectedApp._id === appId) {
                setSelectedApp(null);
            }
        } catch (error) {
            console.error('Failed to delete application:', error);
            alert('Failed to delete application');
        }
    };

    const handleStatusUpdate = async (appId, newStatus, comment) => {
        try {
            await axios.put(`/applications/${appId}/status`, {
                status: newStatus,
                comment: comment || `Status updated to ${newStatus}`
            });

            // Update local state
            setApplications(apps => apps.map(app =>
                app._id === appId ? { ...app, status: newStatus } : app
            ));

            if (selectedApp && selectedApp._id === appId) {
                setSelectedApp(prev => ({ ...prev, status: newStatus }));
            }
        } catch (error) {
            console.error('Failed to update status:', error);
            alert('Failed to update status');
        }
    };

    const filteredApps = filter === 'all'
        ? applications
        : applications.filter(app => app.status === filter);

    return (
        <div className="apps-manager">
            <div className="manager-header">
                <h1>Admissions Center</h1>
                <div className="filters">
                    <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                        <option value="all">All Applications</option>
                        <option value="pending">Pending</option>
                        <option value="under_review">Under Review</option>
                        <option value="accepted">Accepted</option>
                        <option value="rejected">Rejected</option>
                        <option value="waitlisted">Waitlisted</option>
                    </select>
                </div>
            </div>

            <div className="manager-content">
                <div className="apps-list-sidebar">
                    {loading ? <p>Loading...</p> : filteredApps.map(app => (
                        <div
                            key={app._id}
                            className={`app-item ${selectedApp?._id === app._id ? 'active' : ''}`}
                            onClick={() => setSelectedApp(app)}
                        >
                            <div className="app-item-header">
                                <span className="app-name">{app.personalInfo.firstName} {app.personalInfo.lastName}</span>
                                <span className={`status-dot status-${app.status}`}></span>
                            </div>
                            <p className="app-program">{app.program}</p>
                            <p className="app-date">{new Date(app.submittedAt).toLocaleDateString()}</p>
                        </div>
                    ))}
                </div>

                <div className="app-detail-view">
                    {selectedApp ? (
                        <ApplicationDetail
                            app={selectedApp}
                            onStatusUpdate={handleStatusUpdate}
                            onDelete={handleDelete}
                        />
                    ) : (
                        <div className="no-selection">
                            <p>Select an application to review</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const ApplicationDetail = ({ app, onStatusUpdate, onDelete }) => {
    const [note, setNote] = useState('');

    return (
        <div className="app-detail-container">
            <div className="detail-header">
                <div>
                    <h2>{app.personalInfo.firstName} {app.personalInfo.lastName}</h2>
                    <p className="detail-program">Program: <strong>{app.program}</strong></p>
                </div>
                <div className="actions">
                    <select
                        value={app.status}
                        onChange={(e) => onStatusUpdate(app._id, e.target.value)}
                        className={`status-select-large status-${app.status}`}
                        style={{ marginRight: '1rem' }}
                    >
                        <option value="pending">Pending</option>
                        <option value="under_review">Under Review</option>
                        <option value="accepted">Accepted</option>
                        <option value="rejected">Rejected</option>
                        <option value="waitlisted">Waitlisted</option>
                    </select>
                    <button
                        onClick={() => onDelete(app._id)}
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

            <div className="detail-grid">
                <section className="detail-section">
                    <h3>Personal Information</h3>
                    <div className="info-grid">
                        <InfoItem label="Email" value={app.personalInfo.email} />
                        <InfoItem label="Phone" value={app.personalInfo.phone} />
                        <InfoItem label="DOB" value={new Date(app.personalInfo.dateOfBirth).toLocaleDateString()} />
                        <InfoItem label="Gender" value={app.personalInfo.gender} />
                        <InfoItem label="NRC" value={app.personalInfo.nrc} />
                        <InfoItem label="Nationality" value={app.personalInfo.nationality} />
                        <InfoItem label="Address" value={app.personalInfo.address} />
                        <InfoItem label="City" value={app.personalInfo.city} />
                    </div>
                </section>

                <section className="detail-section">
                    <h3>Academic Information</h3>
                    <div className="info-grid">
                        <InfoItem label="School" value={app.academicInfo.grade12School} />
                        <InfoItem label="Year" value={app.academicInfo.grade12Year} />
                    </div>

                    <h4>Subjects & Grades</h4>
                    <table className="grades-table">
                        <thead>
                            <tr>
                                <th>Subject</th>
                                <th>Grade</th>
                            </tr>
                        </thead>
                        <tbody>
                            {app.academicInfo.subjects.map((sub, idx) => (
                                <tr key={idx}>
                                    <td data-label="Subject">{sub.name}</td>
                                    <td data-label="Grade">{sub.grade}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>

                <section className="detail-section">
                    <h3>Guardian Information</h3>
                    <div className="info-grid">
                        <InfoItem label="Name" value={app.guardianInfo?.name} />
                        <InfoItem label="Relationship" value={app.guardianInfo?.relationship} />
                        <InfoItem label="Phone" value={app.guardianInfo?.phone} />
                    </div>
                </section>
            </div>
        </div>
    );
};

const InfoItem = ({ label, value }) => (
    <div className="info-item">
        <label>{label}</label>
        <p>{value || '-'}</p>
    </div>
);

export default ApplicationsManager;
