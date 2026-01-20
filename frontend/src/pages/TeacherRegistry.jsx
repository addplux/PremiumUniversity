import { useState, useEffect } from 'react';
import axios from 'axios';
import './ApplicationsManager.css';

const TeacherRegistry = () => {
    const [teachers, setTeachers] = useState([]);
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchTeachers();
    }, []);

    const fetchTeachers = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/teachers');
            if (response.data.success) {
                setTeachers(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch teachers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (teacherId) => {
        if (!window.confirm('Are you sure you want to delete this teacher?')) return;
        try {
            await axios.delete(`/teachers/${teacherId}`);
            setTeachers(prev => prev.filter(t => t._id !== teacherId));
            if (selectedTeacher?._id === teacherId) setSelectedTeacher(null);
            alert('Teacher deleted successfully');
        } catch (error) {
            console.error('Failed to delete teacher:', error);
            alert('Failed to delete teacher');
        }
    };

    const filteredTeachers = teachers.filter(t =>
        t.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.employeeId.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="apps-manager">
            <div className="manager-header">
                <h1>Teacher Registry</h1>
                <div className="filters" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <input
                        type="text"
                        placeholder="Search teachers..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            padding: '0.6rem',
                            border: '1px solid #cbd5e1',
                            borderRadius: '6px',
                            minWidth: '250px'
                        }}
                    />
                    <button
                        onClick={() => setShowAddForm(true)}
                        style={{
                            background: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            padding: '0.6rem 1.2rem',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '600'
                        }}
                    >
                        + Add Teacher
                    </button>
                </div>
            </div>

            {showAddForm && (
                <AddTeacherForm
                    onClose={() => setShowAddForm(false)}
                    onSuccess={() => {
                        setShowAddForm(false);
                        fetchTeachers();
                    }}
                />
            )}

            <div className="manager-content">
                <div className="apps-list-sidebar">
                    {loading ? <p>Loading...</p> : filteredTeachers.map(teacher => (
                        <div
                            key={teacher._id}
                            className={`app-item ${selectedTeacher?._id === teacher._id ? 'active' : ''}`}
                            onClick={() => setSelectedTeacher(teacher)}
                        >
                            <div className="app-item-header">
                                <span className="app-name">{teacher.firstName} {teacher.lastName}</span>
                                <span className={`status-dot status-${teacher.status}`}></span>
                            </div>
                            <p className="app-program">{teacher.department}</p>
                            <p className="app-date">ID: {teacher.employeeId}</p>
                        </div>
                    ))}
                </div>

                <div className="app-detail-view">
                    {selectedTeacher ? (
                        <TeacherDetail teacher={selectedTeacher} onDelete={handleDelete} />
                    ) : (
                        <div className="no-selection">
                            <p>Select a teacher to view details</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const TeacherDetail = ({ teacher, onDelete }) => (
    <div className="app-detail-container">
        <div className="detail-header">
            <div>
                <h2>{teacher.firstName} {teacher.lastName}</h2>
                <p className="detail-program">Employee ID: <strong>{teacher.employeeId}</strong></p>
            </div>
            <button
                onClick={() => onDelete(teacher._id)}
                style={{
                    background: '#fee2e2',
                    color: '#b91c1c',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '600'
                }}
            >
                Delete
            </button>
        </div>

        <div className="detail-grid">
            <section className="detail-section">
                <h3>Contact Information</h3>
                <div className="info-grid">
                    <InfoItem label="Email" value={teacher.email} />
                    <InfoItem label="Phone" value={teacher.phone} />
                    <InfoItem label="City" value={teacher.city} />
                    <InfoItem label="Address" value={teacher.address} />
                </div>
            </section>

            <section className="detail-section">
                <h3>Professional Details</h3>
                <div className="info-grid">
                    <InfoItem label="Department" value={teacher.department} />
                    <InfoItem label="Qualification" value={teacher.qualification} />
                    <InfoItem label="Specialization" value={teacher.specialization} />
                    <InfoItem label="Date of Joining" value={teacher.dateOfJoining ? new Date(teacher.dateOfJoining).toLocaleDateString() : '-'} />
                    <InfoItem label="Salary" value={teacher.salary ? `$${teacher.salary.toLocaleString()}` : '-'} />
                    <InfoItem label="Status" value={teacher.status} />
                </div>
            </section>
        </div>
    </div>
);

const InfoItem = ({ label, value }) => (
    <div className="info-item">
        <label>{label}</label>
        <p>{value || '-'}</p>
    </div>
);

const AddTeacherForm = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        employeeId: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        department: '',
        qualification: '',
        specialization: '',
        dateOfJoining: '',
        address: '',
        city: '',
        salary: '',
        status: 'active'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await axios.post('/teachers', formData);
            if (res.data.success) {
                alert('Teacher added successfully!');
                onSuccess();
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to add teacher');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
        }}>
            <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '2rem',
                maxWidth: '800px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <h2 style={{ margin: 0 }}>Add New Teacher</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
                </div>

                {error && <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        {['employeeId', 'firstName', 'lastName', 'email', 'phone', 'department', 'qualification', 'specialization', 'dateOfJoining', 'address', 'city', 'salary'].map(field => (
                            <div key={field} style={field === 'address' ? { gridColumn: '1 / -1' } : {}}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                                    {field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} {['employeeId', 'firstName', 'lastName', 'email', 'phone', 'department'].includes(field) && '*'}
                                </label>
                                <input
                                    type={field === 'email' ? 'email' : field === 'dateOfJoining' ? 'date' : field === 'salary' ? 'number' : 'text'}
                                    value={formData[field]}
                                    onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                                    required={['employeeId', 'firstName', 'lastName', 'email', 'phone', 'department'].includes(field)}
                                    style={{
                                        width: '100%',
                                        padding: '0.6rem',
                                        border: '1px solid #cbd5e1',
                                        borderRadius: '6px'
                                    }}
                                />
                            </div>
                        ))}
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="on_leave">On Leave</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                        <button type="button" onClick={onClose} style={{ padding: '0.7rem 1.5rem', border: '1px solid #cbd5e1', background: 'white', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Cancel</button>
                        <button type="submit" disabled={loading} style={{ padding: '0.7rem 1.5rem', border: 'none', background: loading ? '#94a3b8' : '#3b82f6', color: 'white', borderRadius: '6px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: '600' }}>
                            {loading ? 'Adding...' : 'Add Teacher'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TeacherRegistry;
