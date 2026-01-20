import { useState, useEffect } from 'react';
import axios from 'axios';
import './ApplicationsManager.css';

const StudentFeeManager = () => {
    const [fees, setFees] = useState([]);
    const [selectedFee, setSelectedFee] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showSubmitForm, setShowSubmitForm] = useState(false);
    const [showUpdateForm, setShowUpdateForm] = useState(false);
    const [searchRollNo, setSearchRollNo] = useState('');

    useEffect(() => {
        fetchFees();
    }, []);

    const fetchFees = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/student-fees');
            if (response.data.success) {
                setFees(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch fees:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!searchRollNo.trim()) {
            fetchFees();
            return;
        }

        setLoading(true);
        try {
            const response = await axios.get(`/student-fees/student/${searchRollNo}`);
            if (response.data.success) {
                setFees(response.data.data.fees);
            }
        } catch (error) {
            console.error('Failed to search:', error);
            alert('Student not found or no fee records');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (feeId) => {
        if (!window.confirm('Are you sure you want to delete this fee record?')) return;
        try {
            await axios.delete(`/student-fees/${feeId}`);
            setFees(prev => prev.filter(f => f._id !== feeId));
            if (selectedFee?._id === feeId) setSelectedFee(null);
            alert('Fee record deleted successfully');
        } catch (error) {
            console.error('Failed to delete fee:', error);
            alert('Failed to delete fee record');
        }
    };

    return (
        <div className="apps-manager">
            <div className="manager-header">
                <h1>Student Fee Management</h1>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <input
                        type="text"
                        placeholder="Search by Roll Number"
                        value={searchRollNo}
                        onChange={(e) => setSearchRollNo(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        style={{
                            padding: '0.6rem',
                            border: '1px solid #cbd5e1',
                            borderRadius: '6px',
                            minWidth: '200px'
                        }}
                    />
                    <button
                        onClick={handleSearch}
                        style={{
                            background: '#10b981',
                            color: 'white',
                            border: 'none',
                            padding: '0.6rem 1rem',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '600'
                        }}
                    >
                        🔍 Search
                    </button>
                    <button
                        onClick={() => setShowSubmitForm(true)}
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
                        + Submit Fees
                    </button>
                    {selectedFee && (
                        <button
                            onClick={() => setShowUpdateForm(true)}
                            style={{
                                background: '#f59e0b',
                                color: 'white',
                                border: 'none',
                                padding: '0.6rem 1rem',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: '600'
                            }}
                        >
                            ✏️ Update
                        </button>
                    )}
                    <button
                        onClick={() => { setSearchRollNo(''); fetchFees(); }}
                        style={{
                            background: '#64748b',
                            color: 'white',
                            border: 'none',
                            padding: '0.6rem 1rem',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '600'
                        }}
                    >
                        ← Back
                    </button>
                </div>
            </div>

            {showSubmitForm && (
                <SubmitFeeForm
                    onClose={() => setShowSubmitForm(false)}
                    onSuccess={() => {
                        setShowSubmitForm(false);
                        fetchFees();
                    }}
                />
            )}

            {showUpdateForm && selectedFee && (
                <UpdateFeeForm
                    fee={selectedFee}
                    onClose={() => setShowUpdateForm(false)}
                    onSuccess={() => {
                        setShowUpdateForm(false);
                        fetchFees();
                    }}
                />
            )}

            <div className="manager-content">
                <div className="apps-list-sidebar">
                    {loading ? <p>Loading...</p> : fees.map(fee => (
                        <div
                            key={fee._id}
                            className={`app-item ${selectedFee?._id === fee._id ? 'active' : ''}`}
                            onClick={() => setSelectedFee(fee)}
                        >
                            <div className="app-item-header">
                                <span className="app-name">{fee.studentName}</span>
                                <span className={`status-badge status-${fee.status}`}>{fee.status.toUpperCase()}</span>
                            </div>
                            <p className="app-program">Roll: {fee.rollNo} | Sem {fee.semester}</p>
                            <p className="app-date">Balance: ₹{fee.remainingBalance.toLocaleString()}</p>
                        </div>
                    ))}
                </div>

                <div className="app-detail-view">
                    {selectedFee ? (
                        <FeeDetail fee={selectedFee} onDelete={handleDelete} />
                    ) : (
                        <div className="no-selection">
                            <p>Select a fee record to view details</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const FeeDetail = ({ fee, onDelete }) => (
    <div className="app-detail-container">
        <div className="detail-header">
            <div>
                <h2>{fee.studentName}</h2>
                <p className="detail-program">Roll No: <strong>{fee.rollNo}</strong> | Semester {fee.semester} - {fee.academicYear}</p>
            </div>
            <button
                onClick={() => onDelete(fee._id)}
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
                <h3>Student Information</h3>
                <div className="info-grid">
                    <InfoItem label="Student Name" value={fee.studentName} />
                    <InfoItem label="Parent Name" value={fee.parentName} />
                    <InfoItem label="Course" value={fee.course} />
                    <InfoItem label="Branch" value={fee.branch} />
                </div>
            </section>

            <section className="detail-section">
                <h3>Fee Details</h3>
                <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '8px', marginBottom: '1rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ fontSize: '0.875rem', color: '#64748b' }}>Total Semester Fee</label>
                            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b', margin: '0.25rem 0' }}>
                                ₹{fee.totalSemesterFee.toLocaleString()}
                            </p>
                        </div>
                        <div>
                            <label style={{ fontSize: '0.875rem', color: '#64748b' }}>Previous Semester Due</label>
                            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#dc2626', margin: '0.25rem 0' }}>
                                ₹{fee.previousSemesterDue.toLocaleString()}
                            </p>
                        </div>
                        <div>
                            <label style={{ fontSize: '0.875rem', color: '#64748b' }}>Total Due</label>
                            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#7c3aed', margin: '0.25rem 0' }}>
                                ₹{fee.totalDue.toLocaleString()}
                            </p>
                        </div>
                        <div>
                            <label style={{ fontSize: '0.875rem', color: '#64748b' }}>Amount Paid</label>
                            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981', margin: '0.25rem 0' }}>
                                ₹{fee.amountPaid.toLocaleString()}
                            </p>
                        </div>
                    </div>
                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '2px solid #e2e8f0' }}>
                        <label style={{ fontSize: '0.875rem', color: '#64748b' }}>Remaining Balance</label>
                        <p style={{ fontSize: '2rem', fontWeight: 'bold', color: fee.remainingBalance > 0 ? '#dc2626' : '#10b981', margin: '0.25rem 0' }}>
                            ₹{fee.remainingBalance.toLocaleString()}
                        </p>
                    </div>
                </div>
            </section>

            <section className="detail-section">
                <h3>Payment Information</h3>
                <div className="info-grid">
                    <InfoItem label="Payment Date" value={new Date(fee.paymentDate).toLocaleDateString()} />
                    <InfoItem label="Payment Method" value={fee.paymentMethod.replace('_', ' ').toUpperCase()} />
                    <InfoItem label="Transaction ID" value={fee.transactionId || '-'} />
                    <InfoItem label="Status" value={fee.status.toUpperCase()} />
                    <InfoItem label="Submitted By" value={fee.submittedBy ? `${fee.submittedBy.firstName} ${fee.submittedBy.lastName}` : '-'} />
                    <InfoItem label="Remarks" value={fee.remarks || '-'} />
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

const SubmitFeeForm = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        rollNo: '',
        studentName: '',
        parentName: '',
        course: '',
        branch: '',
        semester: 1,
        academicYear: '',
        totalSemesterFee: '',
        previousSemesterDue: 0,
        amountPaid: '',
        paymentMethod: 'cash',
        transactionId: '',
        remarks: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await axios.post('/student-fees', formData);
            if (res.data.success) {
                alert('Fee payment recorded successfully!');
                onSuccess();
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to record fee payment');
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
                maxWidth: '900px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <h2 style={{ margin: 0 }}>Submit Student Fees</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
                </div>

                {error && <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Roll Number *</label>
                            <input
                                type="text"
                                value={formData.rollNo}
                                onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                                required
                                style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Student Name *</label>
                            <input
                                type="text"
                                value={formData.studentName}
                                onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                                required
                                style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Parent Name *</label>
                            <input
                                type="text"
                                value={formData.parentName}
                                onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                                required
                                style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Course *</label>
                            <input
                                type="text"
                                value={formData.course}
                                onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                                required
                                placeholder="e.g., B.Tech, B.Sc"
                                style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Branch *</label>
                            <input
                                type="text"
                                value={formData.branch}
                                onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                                required
                                placeholder="e.g., Computer Science"
                                style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Semester *</label>
                            <select
                                value={formData.semester}
                                onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) })}
                                style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                            >
                                {[1, 2, 3, 4, 5, 6].map(sem => (
                                    <option key={sem} value={sem}>Semester {sem}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Academic Year *</label>
                            <input
                                type="text"
                                value={formData.academicYear}
                                onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                                required
                                placeholder="e.g., 2024-2025"
                                style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Total Semester Fee *</label>
                            <input
                                type="number"
                                value={formData.totalSemesterFee}
                                onChange={(e) => setFormData({ ...formData, totalSemesterFee: e.target.value })}
                                required
                                min="0"
                                style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Previous Semester Due</label>
                            <input
                                type="number"
                                value={formData.previousSemesterDue}
                                onChange={(e) => setFormData({ ...formData, previousSemesterDue: e.target.value })}
                                min="0"
                                style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Current Amount Paid *</label>
                            <input
                                type="number"
                                value={formData.amountPaid}
                                onChange={(e) => setFormData({ ...formData, amountPaid: e.target.value })}
                                required
                                min="0"
                                style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Payment Method *</label>
                            <select
                                value={formData.paymentMethod}
                                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                                style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                            >
                                <option value="cash">Cash</option>
                                <option value="bank_transfer">Bank Transfer</option>
                                <option value="card">Card</option>
                                <option value="cheque">Cheque</option>
                                <option value="online">Online</option>
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Transaction ID</label>
                            <input
                                type="text"
                                value={formData.transactionId}
                                onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                                style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                            />
                        </div>

                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Remarks</label>
                            <textarea
                                value={formData.remarks}
                                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                                rows={2}
                                style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                        <button type="button" onClick={onClose} style={{ padding: '0.7rem 1.5rem', border: '1px solid #cbd5e1', background: 'white', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Cancel</button>
                        <button type="submit" disabled={loading} style={{ padding: '0.7rem 1.5rem', border: 'none', background: loading ? '#94a3b8' : '#3b82f6', color: 'white', borderRadius: '6px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: '600' }}>
                            {loading ? 'Submitting...' : 'Submit Fees'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const UpdateFeeForm = ({ fee, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        totalSemesterFee: fee.totalSemesterFee,
        previousSemesterDue: fee.previousSemesterDue,
        amountPaid: fee.amountPaid,
        paymentMethod: fee.paymentMethod,
        transactionId: fee.transactionId || '',
        remarks: fee.remarks || ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await axios.put(`/student-fees/${fee._id}`, formData);
            if (res.data.success) {
                alert('Fee record updated successfully!');
                onSuccess();
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to update fee record');
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
                maxWidth: '700px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <h2 style={{ margin: 0 }}>Update Fee Record</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
                </div>

                {error && <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Total Semester Fee</label>
                            <input
                                type="number"
                                value={formData.totalSemesterFee}
                                onChange={(e) => setFormData({ ...formData, totalSemesterFee: e.target.value })}
                                min="0"
                                style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Previous Semester Due</label>
                            <input
                                type="number"
                                value={formData.previousSemesterDue}
                                onChange={(e) => setFormData({ ...formData, previousSemesterDue: e.target.value })}
                                min="0"
                                style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Amount Paid</label>
                            <input
                                type="number"
                                value={formData.amountPaid}
                                onChange={(e) => setFormData({ ...formData, amountPaid: e.target.value })}
                                min="0"
                                style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Payment Method</label>
                            <select
                                value={formData.paymentMethod}
                                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                                style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                            >
                                <option value="cash">Cash</option>
                                <option value="bank_transfer">Bank Transfer</option>
                                <option value="card">Card</option>
                                <option value="cheque">Cheque</option>
                                <option value="online">Online</option>
                            </select>
                        </div>

                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Transaction ID</label>
                            <input
                                type="text"
                                value={formData.transactionId}
                                onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                                style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                            />
                        </div>

                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Remarks</label>
                            <textarea
                                value={formData.remarks}
                                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                                rows={2}
                                style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                        <button type="button" onClick={onClose} style={{ padding: '0.7rem 1.5rem', border: '1px solid #cbd5e1', background: 'white', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Cancel</button>
                        <button type="submit" disabled={loading} style={{ padding: '0.7rem 1.5rem', border: 'none', background: loading ? '#94a3b8' : '#f59e0b', color: 'white', borderRadius: '6px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: '600' }}>
                            {loading ? 'Updating...' : 'Update Fee'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StudentFeeManager;
