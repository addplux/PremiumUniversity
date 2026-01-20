import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../pages/ProgramsPage.css';

const AdmissionsPage = () => {
    return (
        <div className="admissions-page">
            <Navbar />

            <section className="page-hero">
                <div className="container">
                    <h1>Admissions</h1>
                    <p>Join us for the January 2026 intake</p>
                </div>
            </section>

            <section className="programs-content">
                <div className="container">
                    <div className="section-header">
                        <span className="section-badge">Intake Open: January 2026</span>
                        <h2 className="section-title">Ready to Begin Your Journey?</h2>
                        <p className="section-subtitle">
                            Follow these simple steps to apply to Premium School of Health Sciences
                        </p>
                    </div>

                    <div className="admissions-steps">
                        <div className="step-card">
                            <div className="step-number">1</div>
                            <h3>Create an Account</h3>
                            <p>Register on our platform to access the application portal</p>
                            <Link to="/register" className="btn-primary">Register Now</Link>
                        </div>

                        <div className="step-card">
                            <div className="step-number">2</div>
                            <h3>Complete Application</h3>
                            <p>Fill in your personal details, academic history, and program choice</p>
                        </div>

                        <div className="step-card">
                            <div className="step-number">3</div>
                            <h3>Upload Documents</h3>
                            <p>Submit required documents including Grade 12 certificate, NRC, and photo</p>
                        </div>

                        <div className="step-card">
                            <div className="step-number">4</div>
                            <h3>Await Response</h3>
                            <p>Our admissions team will review your application and get back to you</p>
                        </div>
                    </div>

                    <div className="program-detail-card">
                        <h2>Program Requirements</h2>

                        <div className="program-details-grid">
                            <div className="detail-section">
                                <h4>📋 Registered Nursing</h4>
                                <ul>
                                    <li>Full Grade 12 certificate</li>
                                    <li>5 credits or better in English, Mathematics, Biology or Science</li>
                                    <li>Plus any other 2 subjects</li>
                                    <li>As per General Nursing Council of Zambia</li>
                                </ul>
                            </div>

                            <div className="detail-section">
                                <h4>🏥 Clinical Medicine</h4>
                                <ul>
                                    <li>Full Grade 12 certificate</li>
                                    <li>5 credits or better in English, Mathematics, Biology, Science</li>
                                    <li>Plus any other subject</li>
                                    <li>As per Health Professionals Council of Zambia</li>
                                </ul>
                            </div>

                            <div className="detail-section">
                                <h4>🌍 Environmental Health</h4>
                                <ul>
                                    <li>Full Grade 12 results certificate</li>
                                </ul>
                            </div>

                            <div className="detail-section">
                                <h4>⚡ EN to RN Abridged</h4>
                                <ul>
                                    <li>Must be qualified Enrolled Nurse</li>
                                    <li>Valid practicing license</li>
                                    <li>Work experience recommended</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="program-detail-card">
                        <h2>Required Documents</h2>
                        <div className="documents-grid">
                            <div className="document-item">
                                <span className="doc-icon">📄</span>
                                <div>
                                    <h4>Grade 12 Certificate</h4>
                                    <p>Certified copy of your full Grade 12 certificate</p>
                                </div>
                            </div>
                            <div className="document-item">
                                <span className="doc-icon">🆔</span>
                                <div>
                                    <h4>National ID/NRC</h4>
                                    <p>Clear copy of your National Registration Card</p>
                                </div>
                            </div>
                            <div className="document-item">
                                <span className="doc-icon">📸</span>
                                <div>
                                    <h4>Passport Photo</h4>
                                    <p>Recent passport size photograph</p>
                                </div>
                            </div>
                            <div className="document-item">
                                <span className="doc-icon">⚕️</span>
                                <div>
                                    <h4>Medical Certificate</h4>
                                    <p>Certificate of good health from registered physician</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="cta-box">
                        <h3>Ready to Apply?</h3>
                        <p>Create your account and start your application today</p>
                        <div style={{ display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Link to="/register" className="btn-primary">Create Account & Apply</Link>
                            <Link to="/contact" className="btn-secondary">Contact Admissions</Link>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default AdmissionsPage;
