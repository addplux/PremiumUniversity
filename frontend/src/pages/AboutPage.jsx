import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const AboutPage = () => {
    return (
        <div>
            <Navbar />

            <section className="page-hero">
                <div className="container">
                    <h1>About PSOHS</h1>
                    <p>Leading Healthcare Education in Zambia</p>
                </div>
            </section>

            <section className="programs-content">
                <div className="container">
                    <div className="program-detail-card">
                        <h2>Our Mission</h2>
                        <p>
                            Premium School of Health Sciences (PSOHS) is dedicated to producing exceptional healthcare
                            professionals who will serve communities across Zambia and beyond. Our mission is to provide
                            quality education that combines theoretical knowledge with practical skills, preparing students
                            for successful careers in the healthcare sector.
                        </p>
                    </div>

                    <div className="program-detail-card">
                        <h2>Our Vision</h2>
                        <p>
                            To be the leading institution for health sciences education in Zambia, recognized for
                            excellence in teaching, innovation in healthcare training, and producing graduates who
                            make a significant impact on public health.
                        </p>
                    </div>

                    <div className="program-detail-card">
                        <h2>Why Choose PSOHS?</h2>
                        <div className="program-details-grid">
                            <div className="detail-section">
                                <h4>👨‍🏫 Experienced Faculty</h4>
                                <p>Learn from qualified professionals with extensive healthcare experience</p>
                            </div>
                            <div className="detail-section">
                                <h4>🏥 Modern Facilities</h4>
                                <p>State-of-the-art training equipment and clinical practice areas</p>
                            </div>
                            <div className="detail-section">
                                <h4>✅ Accredited Programs</h4>
                                <p>All programs are fully accredited by relevant professional councils</p>
                            </div>
                            <div className="detail-section">
                                <h4>💼 Career Support</h4>
                                <p>High employment rate with strong industry connections</p>
                            </div>
                        </div>
                    </div>

                    <div className="program-detail-card">
                        <h2>Our Values</h2>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            <li style={{ padding: '0.75rem 0', paddingLeft: '2rem', position: 'relative' }}>
                                <span style={{ position: 'absolute', left: 0, color: 'var(--medical-green)', fontWeight: 'bold' }}>✓</span>
                                <strong>Excellence:</strong> We strive for the highest standards in education and training
                            </li>
                            <li style={{ padding: '0.75rem 0', paddingLeft: '2rem', position: 'relative' }}>
                                <span style={{ position: 'absolute', left: 0, color: 'var(--medical-green)', fontWeight: 'bold' }}>✓</span>
                                <strong>Integrity:</strong> We uphold honesty and ethical practices in all our operations
                            </li>
                            <li style={{ padding: '0.75rem 0', paddingLeft: '2rem', position: 'relative' }}>
                                <span style={{ position: 'absolute', left: 0, color: 'var(--medical-green)', fontWeight: 'bold' }}>✓</span>
                                <strong>Innovation:</strong> We embrace modern teaching methods and healthcare practices
                            </li>
                            <li style={{ padding: '0.75rem 0', paddingLeft: '2rem', position: 'relative' }}>
                                <span style={{ position: 'absolute', left: 0, color: 'var(--medical-green)', fontWeight: 'bold' }}>✓</span>
                                <strong>Community Service:</strong> We are committed to improving healthcare in our communities
                            </li>
                        </ul>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default AboutPage;
