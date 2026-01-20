import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const RecordPayment = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [searchLoading, setSearchLoading] = useState(false);

    const [formData, setFormData] = useState({
        amount: '',
        paymentMethod: 'Bank Transfer',
        reference: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
    });

    const [message, setMessage] = useState({ type: '', text: '' });

    // Search for students
    useEffect(() => {
        const searchStudents = async () => {
            if (searchTerm.length < 2) {
                setStudents([]);
                return;
            }

            setSearchLoading(true);
            try {
                // Using the users endpoint with search query if available, or just filtering client side if needed
                // Assuming backend supports query param or we filter generic list
                // For now, let's try a search endpoint or just list students
                const res = await axios.get(`/users?role=student&search=${searchTerm}`);
                if (res.data.success) {
                    setStudents(res.data.data);
                }
            } catch (error) {
                console.error('Search failed:', error);
            } finally {
                setSearchLoading(false);
            }
        };

        const timeoutId = setTimeout(searchStudents, 500);
        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    const handleStudentSelect = (student) => {
        setSelectedStudent(student);
        setSearchTerm('');
        setStudents([]);
        setMessage({ type: '', text: '' });
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedStudent) {
            setMessage({ type: 'error', text: 'Please select a student first' });
            return;
        }

        if (!formData.amount || !formData.reference) {
            setMessage({ type: 'error', text: 'Amount and Reference are required' });
            return;
        }

        setLoading(true);
        try {
            const payload = {
                studentId: selectedStudent._id,
                ...formData
            };

            const res = await axios.post('/finance', payload);

            if (res.data.success) {
                setMessage({ type: 'success', text: 'Payment recorded successfully!' });
                // Reset form but keep student selected for faster multiple entries if needed? 
                // Or redirect? Let's ask via simple UI action or just reset.
                setFormData({
                    amount: '',
                    paymentMethod: 'Bank Transfer',
                    reference: '',
                    description: '',
                    date: new Date().toISOString().split('T')[0]
                });
                setTimeout(() => navigate('/admin/finance'), 2000);
            }
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to record payment'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <button onClick={() => navigate('/admin/finance')} className="btn-text">
                    ← Back to Dashboard
                </button>
                <h1>➕ Record Payment</h1>
                <p>Log a new fee payment for a student.</p>
            </div>

            <div className="dashboard-section" style={{ maxWidth: '800px', margin: '0 auto' }}>
                {message.text && (
                    <div className={`alert ${message.type === 'error' ? 'alert-danger' : 'alert-success'}`}>
                        {message.text}
                    </div>
                )}

                {/* 1. Student Selection Section */}
                {!selectedStudent ? (
                    <div className="form-group">
                        <label>Find Student</label>
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="form-control"
                            autoFocus
                        />
                        {searchLoading && <p className="text-small">Searching...</p>}

                        {students.length > 0 && (
                            <div className="search-results" style={{
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                marginTop: '0.5rem',
                                maxHeight: '200px',
                                overflowY: 'auto'
                            }}>
                                {students.map(student => (
                                    <div
                                        key={student._id}
                                        onClick={() => handleStudentSelect(student)}
                                        style={{
                                            padding: '0.75rem',
                                            cursor: 'pointer',
                                            borderBottom: '1px solid #f1f5f9',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}
                                        className="hover:bg-gray-50"
                                    >
                                        <div>
                                            <strong>{student.firstName} {student.lastName}</strong>
                                            <div className="text-small">{student.email}</div>
                                        </div>
                                        <div className="text-small text-gray-500">
                                            ID: {student.studentId || 'N/A'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {searchTerm.length > 2 && students.length === 0 && !searchLoading && (
                            <p className="text-small text-red-500" style={{ marginTop: '0.5rem' }}>No students found.</p>
                        )}
                    </div>
                ) : (
                    <div className="selected-student-card" style={{
                        background: '#f0f9ff',
                        border: '1px solid #bae6fd',
                        padding: '1rem',
                        borderRadius: '8px',
                        marginBottom: '2rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div>
                            <span className="text-small text-blue-600 uppercase font-bold">Selected Student</span>
                            <h3 style={{ margin: '0.25rem 0' }}>{selectedStudent.firstName} {selectedStudent.lastName}</h3>
                            <p className="text-small">{selectedStudent.email}</p>
                        </div>
                        <button
                            onClick={() => setSelectedStudent(null)}
                            className="btn-text"
                            style={{ color: '#0369a1' }}
                        >
                            Change
                        </button>
                    </div>
                )}

                {/* 2. Payment Form */}
                <form onSubmit={handleSubmit} style={{ opacity: selectedStudent ? 1 : 0.5, pointerEvents: selectedStudent ? 'auto' : 'none' }}>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Amount (K)</label>
                            <input
                                type="number"
                                name="amount"
                                value={formData.amount}
                                onChange={handleInputChange}
                                placeholder="0.00"
                                required
                                className="form-control"
                            />
                        </div>

                        <div className="form-group">
                            <label>Payment Method</label>
                            <select
                                name="paymentMethod"
                                value={formData.paymentMethod}
                                onChange={handleInputChange}
                                className="form-control"
                            >
                                <option value="Bank Transfer">Bank Transfer</option>
                                <option value="Mobile Money">Mobile Money</option>
                                <option value="Cash">Cash</option>
                                <option value="Online">Online Payment</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Transaction Reference / Receipt No.</label>
                            <input
                                type="text"
                                name="reference"
                                value={formData.reference}
                                onChange={handleInputChange}
                                placeholder="e.g. TXN-12345678"
                                required
                                className="form-control"
                            />
                        </div>

                        <div className="form-group">
                            <label>Payment Date</label>
                            <input
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleInputChange}
                                required
                                className="form-control"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Description (Optional)</label>
                        <input
                            type="text"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="e.g. Tuition Fees Term 1"
                            className="form-control"
                        />
                    </div>

                    <div className="form-actions" style={{ marginTop: '2rem' }}>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Recording...' : 'Record Payment'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RecordPayment;
