import { useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './ContactPage.css';

const ContactPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        type: 'general'
    });
    const [status, setStatus] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: '', message: '' });

        try {
            const response = await axios.post('/contact', formData);
            if (response.data.success) {
                setStatus({ type: 'success', message: response.data.message });
                setFormData({ name: '', email: '', phone: '', subject: '', message: '', type: 'general' });
            }
        } catch (error) {
            setStatus({
                type: 'error',
                message: error.response?.data?.message || 'Failed to send message'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="contact-page">
            <Navbar />

            <section className="page-hero">
                <div className="container">
                    <h1>Contact Us</h1>
                    <p>Get in touch with our admissions team</p>
                </div>
            </section>

            <section className="programs-content">
                <div className="container">
                    <div className="contact-grid">
                        <div className="contact-info">
                            <h2>Get In Touch</h2>
                            <p>Have questions? We're here to help. Reach out to us through any of the channels below.</p>

                            <div className="contact-cards">
                                <div className="contact-card">
                                    <div className="contact-icon">📧</div>
                                    <h4>Email</h4>
                                    <p>info@psohs.ac.zm</p>
                                    <p>admissions@psohs.ac.zm</p>
                                </div>

                                <div className="contact-card">
                                    <div className="contact-icon">📞</div>
                                    <h4>Phone</h4>
                                    <p>+260 XXX XXX XXX</p>
                                    <p>+260 XXX XXX XXX</p>
                                </div>

                                <div className="contact-card">
                                    <div className="contact-icon">📍</div>
                                    <h4>Location</h4>
                                    <p>Lusaka, Zambia</p>
                                    <p>Campus Address Here</p>
                                </div>

                                <div className="contact-card">
                                    <div className="contact-icon">🕐</div>
                                    <h4>Office Hours</h4>
                                    <p>Monday - Friday</p>
                                    <p>8:00 AM - 5:00 PM</p>
                                </div>
                            </div>
                        </div>

                        <div className="contact-form-container">
                            <h2>Send Us a Message</h2>
                            {status.message && (
                                <div className={`alert alert-${status.type}`}>
                                    {status.message}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="contact-form">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Full Name *</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Email *</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Phone</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Inquiry Type *</label>
                                        <select name="type" value={formData.type} onChange={handleChange} required>
                                            <option value="general">General Inquiry</option>
                                            <option value="admission">Admissions</option>
                                            <option value="program_inquiry">Programs</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Subject *</label>
                                    <input
                                        type="text"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Message *</label>
                                    <textarea
                                        name="message"
                                        rows="6"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                    ></textarea>
                                </div>

                                <button type="submit" className="btn-primary" disabled={loading}>
                                    {loading ? 'Sending...' : 'Send Message'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default ContactPage;
