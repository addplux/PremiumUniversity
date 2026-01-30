import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import './AuthPages.css';

const LoginPage = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, isAuthenticated, isAdmin } = useAuth();
    const { name, isMasterTenant } = useOrganization();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(formData.email, formData.password);

        if (result.success) {
            // Redirect based on role
            if (isAdmin) {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
        } else {
            setError(result.message);
        }

        setLoading(false);
    };

    if (isAuthenticated) {
        navigate(isAdmin ? '/admin' : '/dashboard');
        return null;
    }

    return (
        <div className="auth-page">
            <Navbar />

            <div className="auth-container">
                <div className="auth-box">
                    <div className="auth-header">
                        <h1>{isMasterTenant ? 'Yard Cloud' : name}</h1>
                        <p>Login to {isMasterTenant ? 'manage your cloud' : 'access your portal'}</p>
                    </div>

                    {error && <div className="alert alert-error">{error}</div>}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label>Email / Registration Number</label>
                            <input
                                type="text"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                placeholder="admin@example.com or 2024001"
                            />
                            <small style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                                Students: Use your roll number | Admins: Use your email
                            </small>
                        </div>

                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                placeholder="Enter your password"
                            />
                            <small style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                                Default password for new students: 1234
                            </small>
                        </div>

                        <button type="submit" className="btn-primary btn-full" disabled={loading}>
                            {loading ? 'Logging in...' : 'Login'}
                        </button>
                        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                            <button
                                type="button"
                                className="btn-secondary"
                                style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
                                onClick={async () => {
                                    try {
                                        setLoading(true);
                                        const axios = (await import('axios')).default;
                                        // Use the configured base URL from AuthContext/main
                                        const response = await axios.get('/health');
                                        alert(`✅ Connection Success!\nStatus: ${response.data.status}\nDB: ${response.data.database}`);
                                    } catch (err) {
                                        alert(`❌ Connection Failed to ${axios.defaults.baseURL}\n${err.message}`);
                                        console.error(err);
                                    } finally {
                                        setLoading(false);
                                    }
                                }}
                            >
                                📡 Test Server Connection
                            </button>
                            <p style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.5rem' }}>
                                (Check console logs for current API URL)
                            </p>
                            <p style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                                (If this says '/api', your VITE_API_URL is missing!)
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
