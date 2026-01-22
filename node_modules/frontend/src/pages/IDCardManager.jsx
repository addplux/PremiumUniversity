import { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';

const IDCardManager = () => {
    const [programmes, setProgrammes] = useState([]);
    const [students, setStudents] = useState([]);
    const [faculty, setFaculty] = useState([]);
    const [filteredData, setFilteredData] = useState([]);

    // Filter states
    const [filters, setFilters] = useState({
        cardTypeFormat: 'default',
        idCardOf: 'student',
        idCardType: ''
    });

    // Predefined options
    const idCardTypes = ['Standard', 'Premium', 'Temporary', 'Replacement'];

    useEffect(() => {
        fetchProgrammes();
        fetchStudents();
        fetchFaculty();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [filters, students, faculty]);

    const fetchProgrammes = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/programs`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProgrammes(response.data);
        } catch (error) {
            console.error('Error fetching programmes:', error);
        }
    };

    const fetchStudents = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/users?role=student`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStudents(response.data);
        } catch (error) {
            console.error('Error fetching students:', error);
        }
    };

    const fetchFaculty = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/users?role=teacher`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFaculty(response.data);
        } catch (error) {
            console.error('Error fetching faculty:', error);
        }
    };

    const applyFilters = () => {
        let data = filters.idCardOf === 'student' ? students : faculty;

        if (filters.idCardType) {
            // Filter by card type if needed
            data = data.filter(item => item.cardType === filters.idCardType);
        }

        setFilteredData(data);
    };

    const handleSearch = () => {
        applyFilters();
    };

    const handleReset = () => {
        setFilters({
            cardTypeFormat: 'default',
            idCardOf: 'student',
            idCardType: ''
        });
    };

    const handleGenerateIDCard = async (userId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/id-cards/generate`,
                {
                    userId,
                    cardType: filters.idCardType || 'Standard',
                    format: filters.cardTypeFormat
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                    responseType: 'blob'
                }
            );

            // Create download link for the generated ID card
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `id_card_${userId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error generating ID card:', error);
            alert('Failed to generate ID card');
        }
    };

    const handleBulkGenerate = async () => {
        if (!confirm(`Generate ID cards for all ${filteredData.length} ${filters.idCardOf}s?`)) return;

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/id-cards/bulk-generate`,
                {
                    userIds: filteredData.map(item => item._id),
                    cardType: filters.idCardType || 'Standard',
                    format: filters.cardTypeFormat
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                    responseType: 'blob'
                }
            );

            // Create download link for the bulk generated ID cards
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `id_cards_bulk_${new Date().toISOString().split('T')[0]}.zip`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error generating bulk ID cards:', error);
            alert('Failed to generate bulk ID cards');
        }
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>🪪 ID Card Management</h1>
                <button className="btn-primary" onClick={handleBulkGenerate}>
                    📄 Generate All ID Cards
                </button>
            </div>

            {/* Filter Section */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>ID Card Configuration</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                    <div className="form-group">
                        <label>Card Type Format *</label>
                        <select
                            value={filters.cardTypeFormat}
                            onChange={(e) => setFilters({ ...filters, cardTypeFormat: e.target.value })}
                        >
                            <option value="default">Default</option>
                            <option value="custom">Custom</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>ID Card Of *</label>
                        <select
                            value={filters.idCardOf}
                            onChange={(e) => setFilters({ ...filters, idCardOf: e.target.value })}
                        >
                            <option value="student">Student</option>
                            <option value="faculty">Faculty</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>ID Card Type</label>
                        <select
                            value={filters.idCardType}
                            onChange={(e) => setFilters({ ...filters, idCardType: e.target.value })}
                        >
                            <option value="">All Types</option>
                            {idCardTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn-primary" onClick={handleSearch}>
                        🔍 Search
                    </button>
                    <button className="btn-secondary" onClick={handleReset}>
                        🔄 Reset
                    </button>
                </div>
            </div>

            {/* ID Card List */}
            <div className="card">
                <h2>{filters.idCardOf === 'student' ? 'Student' : 'Faculty'} List ({filteredData.length})</h2>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Email</th>
                                {filters.idCardOf === 'student' && <th>Programme</th>}
                                {filters.idCardOf === 'student' && <th>Batch</th>}
                                {filters.idCardOf === 'faculty' && <th>Department</th>}
                                <th>Operation</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan={filters.idCardOf === 'student' ? '6' : '5'} style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                                        No {filters.idCardOf}s found
                                    </td>
                                </tr>
                            ) : (
                                filteredData.map((item) => (
                                    <tr key={item._id}>
                                        <td><strong>{item.studentId || item.employeeId || 'N/A'}</strong></td>
                                        <td>{item.name}</td>
                                        <td>{item.email}</td>
                                        {filters.idCardOf === 'student' && (
                                            <>
                                                <td>{item.program?.name || 'N/A'}</td>
                                                <td>{item.batch || 'N/A'}</td>
                                            </>
                                        )}
                                        {filters.idCardOf === 'faculty' && (
                                            <td>{item.department || 'N/A'}</td>
                                        )}
                                        <td>
                                            <button
                                                onClick={() => handleGenerateIDCard(item._id)}
                                                className="btn-sm btn-primary"
                                            >
                                                🪪 Generate ID Card
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default IDCardManager;
