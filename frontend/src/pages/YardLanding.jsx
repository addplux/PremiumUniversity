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
                            <span className="yard-badge">Higher Education Infrastructure</span>
                            <h1>The Digital Backbone for <span className="text-highlight">Modern Universities</span></h1>
                            <p className="hero-sub">
                                Yard is the all-in-one cloud operating system for higher education institutions.
                                Manage students, finance, academics, and compliance on a single, secure platform.
                            </p>
                            <div className="yard-hero-btns">
                                <Link to="/contact" className="yard-btn-primary">Schedule a Demo</Link>
                                <a href="#features" className="yard-btn-secondary">Explore Platform</a>
                            </div>
                        </div>
                        <div className="hero-visual">
                            <div className="platform-preview">
                                <div className="preview-header">
                                    <div className="dots"><span></span><span></span><span></span></div>
                                    <div className="bar">yard.cloud/manage</div>
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
                        <h2>Enterprise-Grade Campus Management</h2>
                        <p>Built for scale, security, and administrative efficiency.</p>
                    </div>

                    <div className="features-grid">
                        <div className="yard-feat-card">
                            <div className="icon">🚀</div>
                            <h3>Instant Deployment</h3>
                            <p>Launch your institution's digital campus in minutes, not months. Fully hosted and managed.</p>
                        </div>
                        <div className="yard-feat-card">
                            <div className="icon">🎨</div>
                            <h3>White-Label Branding</h3>
                            <p>Your domain, your colors, your identity. We stay in the background while your brand shines.</p>
                        </div>
                        <div className="yard-feat-card">
                            <div className="icon">🔒</div>
                            <h3>Sovereign Data</h3>
                            <p>Complete tenant isolation ensures your institutional data remains private, secure, and compliant.</p>
                        </div>
                        <div className="yard-feat-card">
                            <div className="icon">📈</div>
                            <h3>Financial Intelligence</h3>
                            <p>Integrated payment processing and financial reporting designed specifically for tuition & fees.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="yard-cta">
                <div className="yard-container">
                    <div className="cta-box">
                        <h2>Ready to modernize your institution?</h2>
                        <p>Join the network of forward-thinking universities running on Yard.</p>
                        <Link to="/contact" className="yard-btn-primary">Partner with Yard</Link>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default YardLanding;
