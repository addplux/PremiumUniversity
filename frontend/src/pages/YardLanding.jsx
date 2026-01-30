import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './YardLanding.css';

const YardLanding = () => {
    return (
        <div className="yard-landing">
            <Navbar />

            {/* Hero Section */}
            <section className="yard-hero">
                <div className="yard-container">
                    <div className="hero-grid">
                        <div className="hero-text">
                            <span className="yard-badge">Master Your Institution</span>
                            <h1>Launch Your University in the Cloud with <span className="text-highlight">Yard</span></h1>
                            <p className="hero-sub">
                                The ultimate hosting platform for modern universities. Deploy a fully-branded, secure, and scalable ERP system in minutes.
                            </p>
                            <div className="yard-hero-btns">
                                <Link to="/contact" className="yard-btn-primary">Get Started</Link>
                                <a href="#features" className="yard-btn-secondary">Learn More</a>
                            </div>
                        </div>
                        <div className="hero-visual">
                            <div className="platform-preview">
                                <div className="preview-header">
                                    <div className="dots"><span></span><span></span><span></span></div>
                                    <div className="bar">yard.cloud/portal</div>
                                </div>
                                <div className="preview-content">
                                    <div className="mock-sidebar"></div>
                                    <div className="mock-main">
                                        <div className="mock-card"></div>
                                        <div className="mock-grid">
                                            <span></span><span></span><span></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="yard-features">
                <div className="yard-container">
                    <div className="section-intro">
                        <h2>Infrastructure Built for Education</h2>
                        <p>Everything you need to manage students, staff, and academics at scale.</p>
                    </div>

                    <div className="features-grid">
                        <div className="yard-feat-card">
                            <div className="icon">🎨</div>
                            <h3>White-Labeling</h3>
                            <p>Full control over your branding. Custom domains, logos, and CSS for a native institution feel.</p>
                        </div>
                        <div className="yard-feat-card">
                            <div className="icon">🛡️</div>
                            <h3>Data Isolation</h3>
                            <p>Military-grade tenant isolation. Your university's data is private, secure, and strictly isolated.</p>
                        </div>
                        <div className="yard-feat-card">
                            <div className="icon">⚡</div>
                            <h3>Instant Deployment</h3>
                            <p>Launch your portal instantly. No servers to manage, no maintenance headaches.</p>
                        </div>
                        <div className="yard-feat-card">
                            <div className="icon">📊</div>
                            <h3>Advanced Analytics</h3>
                            <p>Gain insights into student performance and financial health with built-in BI tools.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="yard-cta">
                <div className="yard-container">
                    <div className="cta-box">
                        <h2>Join the Future of Higher Ed Hosting</h2>
                        <p>Empower your staff and students with a state-of-the-art digital campus.</p>
                        <Link to="/contact" className="yard-btn-primary">Connect with Yard</Link>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default YardLanding;
