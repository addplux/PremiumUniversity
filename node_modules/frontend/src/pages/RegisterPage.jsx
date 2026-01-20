import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import './AuthPages.css';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        dateOfBirth: '',
        address: '',
        city: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        const { confirmPassword, ...userData } = formData;
        const result = await register(userData);

        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.message);
        }

        setLoading(false);
    };

    return (
        <div className="auth-page">
            <Navbar />

            <div className="auth-container">
                <div className="auth-box register-box">
                    <div className="auth-header">
                        <h1>Create Account</h1>
                        <p>Register to apply for admission</p>
                    </div>

                    {error && <div className="alert alert-error">{error}</div>}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label>First Name *</label>
                                <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label>Last Name *</label>
                                <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Email *</label>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label>Phone *</label>
                                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Date of Birth</label>
                                <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>City</label>
                                <input type="text" name="city" value={formData.city} onChange={handleChange} />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Address</label>
                            <input type="text" name="address" value={formData.address} onChange={handleChange} />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Password *</label>
                                <input type="password" name="password" value={formData.password} onChange={handleChange} required minLength="6" />
                            </div>
                            <div className="form-group">
                                <label>Confirm Password *</label>
                                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />
                            </div>
                        </div>

                        <button type="submit" className="btn-primary btn-full" disabled={loading}>
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <p>Already have an account? <Link to="/login">Login here</Link></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
