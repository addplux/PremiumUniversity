import { useState, useEffect } from 'react';
import axios from 'axios';
import '../pages/Dashboard.css'; // Reuse dashboard styles

const InstitutionManager = () => {
    const [institutions, setInstitutions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        domain: '',
        adminEmail: ''
    });

    useEffect(() => {
        fetchInstitutions();
    }, []);

    const fetchInstitutions = async () => {
        try {
            const res = await axios.get('/api/organizations');
            if (res.data.success) {
                setInstitutions(res.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch institutions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('/api/organizations', {
                name: formData.name,
                slug: formData.slug,
                domain: formData.domain,
                contact: { adminEmail: formData.adminEmail }
            });
            if (res.data.success) {
                setInstitutions([res.data.data, ...institutions]);
                setShowModal(false);
                setFormData({ name: '', slug: '', domain: '', adminEmail: '' });
                alert('Institution created successfully!');
            }
        } catch (error) {
            console.error('Failed to create institution:', error);
            alert(error.response?.data?.message || 'Failed to create institution');
        }
    };

    if (loading) return <div className="p-8">Loading institutions...</div>;

    return (
        <div className="dashboard-container">
            <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1>Institution Management</h1>
                    <p>Manage universities and colleges hosted on Yard.</p>
                </div>
                <button
                    className="btn-primary"
                    style={{ background: '#3b82f6', padding: '0.75rem 1.5rem', borderRadius: '8px', color: 'white', border: 'none', cursor: 'pointer', fontWeight: '600' }}
                    onClick={() => setShowModal(true)}
                >
                    + Add New Institution
                </button>
            </div>

            <div className="dashboard-section" style={{ marginTop: '2rem' }}>
                <div className="applications-table">
                    <div className="table-header" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', padding: '1rem', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', fontWeight: '600', color: '#6b7280' }}>
                        <div>Name</div>
                        <div>Slug</div>
                        <div>Domain</div>
                        <div>Status</div>
                        <div>Actions</div>
                    </div>
                    {institutions.map((inst) => (
                        <div key={inst._id} className="table-row" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', padding: '1rem', borderBottom: '1px solid #f3f4f6', alignItems: 'center' }}>
                            <div style={{ fontWeight: '500' }}>{inst.name}</div>
                            <div style={{ fontFamily: 'monospace', color: '#6b7280' }}>{inst.slug}</div>
                            <div>{inst.domain || '-'}</div>
                            <div>
                                <span style={{
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '999px',
                                    fontSize: '0.75rem',
                                    background: inst.isActive ? '#dcfce7' : '#fee2e2',
                                    color: inst.isActive ? '#166534' : '#991b1b',
                                    fontWeight: '600'
                                }}>
                                    {inst.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            <div>
                                <button style={{ color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '500' }}>Manage</button>
                            </div>
                        </div>
                    ))}
                    {institutions.length === 0 && <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>No institutions found. Create one above.</div>}
                </div>
            </div>

            {/* Simple Modal */}
            {showModal && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50
                }}>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '500px' }}>
                        <h2 style={{ marginBottom: '1.5rem' }}>Add New Institution</h2>
                        <form onSubmit={handleCreate}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Institution Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db' }}
                                    placeholder="e.g. Copperbelt University"
                                />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>URL Slug</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.slug}
                                    onChange={e => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s/g, '-') })}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db' }}
                                    placeholder="e.g. cbu"
                                />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Primary Domain (Optional)</label>
                                <input
                                    type="text"
                                    value={formData.domain}
                                    onChange={e => setFormData({ ...formData, domain: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db' }}
                                    placeholder="e.g. cbu.ac.zm"
                                />
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Admin Email</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.adminEmail}
                                    onChange={e => setFormData({ ...formData, adminEmail: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db' }}
                                    placeholder="admin@cbu.ac.zm"
                                />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    style={{ padding: '0.75rem 1.5rem', borderRadius: '6px', border: '1px solid #d1d5db', background: 'white', cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    style={{ padding: '0.75rem 1.5rem', borderRadius: '6px', border: 'none', background: '#3b82f6', color: 'white', cursor: 'pointer', fontWeight: '500' }}
                                >
                                    Create Institution
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InstitutionManager;
