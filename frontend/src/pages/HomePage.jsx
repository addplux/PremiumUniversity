import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './HomePage.css';

const HomePage = () => {
    useEffect(() => {
        // Intersection Observer for stats animation
        const statNumbers = document.querySelectorAll('.stat-number');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const target = parseInt(entry.target.getAttribute('data-target'));
                    animateCounter(entry.target, target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        statNumbers.forEach(stat => observer.observe(stat));

        return () => observer.disconnect();
    }, []);

    const animateCounter = (element, target) => {
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = target + (element.textContent.includes('%') ? '%' : '+');
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current);
            }
        }, 16);
    };

    return (
        <div className="home-page">
            <Navbar />

            {/* Hero Section */}
            <section className="hero">
                <div className="hero-overlay"></div>
                <div className="hero-content">
                    <div className="container">
                        <div className="hero-text">
                            <span className="hero-badge">January 2026 Intake Open</span>
                            <h1 className="hero-title">Pursuing Professional Excellence in Health Sciences</h1>
                            <p className="hero-subtitle">
                                Join Zambia's premier institution for Registered Nursing, Clinical Medicine, and Environmental Health programs
                            </p>
                            <div className="hero-buttons">
                                <Link to="/admissions" className="btn-primary">Apply Now</Link>
                                <Link to="/programs" className="btn-secondary">Explore Programs</Link>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="hero-scroll-indicator">
                    <span>Scroll to explore</span>
                    <div className="scroll-line"></div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="stats-section">
                <div className="container">
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon">🎓</div>
                            <h3 className="stat-number" data-target="500">0</h3>
                            <p className="stat-label">Graduates</p>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">👨‍⚕️</div>
                            <h3 className="stat-number" data-target="95">0</h3>
                            <p className="stat-label">Employment Rate %</p>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">🏥</div>
                            <h3 className="stat-number" data-target="4">0</h3>
                            <p className="stat-label">Programs</p>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">⭐</div>
                            <h3 className="stat-number" data-target="100">0</h3>
                            <p className="stat-label">Accredited %</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* About Preview */}
            <section className="about-preview">
                <div className="container">
                    <div className="about-grid">
                        <div className="about-content">
                            <span className="section-badge">About PSOHS</span>
                            <h2 className="section-title">Leading Healthcare Education in Zambia</h2>
                            <p>
                                Premium School of Health Sciences (PSOHS) is a premier institution dedicated to
                                producing exceptional healthcare professionals. Our commitment to excellence,
                                modern facilities, and experienced faculty ensure that our graduates are well-prepared
                                for successful careers in the healthcare sector.
                            </p>
                            <p>
                                With state-of-the-art training facilities and a curriculum aligned with international
                                standards, we provide students with both theoretical knowledge and practical skills
                                essential for professional excellence.
                            </p>
                            <Link to="/about" className="btn-primary">Learn More About Us</Link>
                        </div>
                        <div className="about-image">
                            <img
                                src="C:/Users/flyst/.gemini/antigravity/brain/70241dd5-b90c-44e6-af60-d66cfb9fe4bc/uploaded_image_1_1767895364487.jpg"
                                alt="PSOHS Students"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Programs Section */}
            <section className="programs-section">
                <div className="container">
                    <div className="section-header">
                        <span className="section-badge">Our Programs</span>
                        <h2 className="section-title">Choose Your Path to Excellence</h2>
                        <p className="section-subtitle">
                            We offer accredited diploma programs designed to prepare you for a successful career in healthcare
                        </p>
                    </div>

                    <div className="programs-grid">
                        <div className="program-card">
                            <div className="program-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M20 6L9 17l-5-5" />
                                </svg>
                            </div>
                            <h3>Registered Nursing</h3>
                            <p className="program-duration">Diploma Program</p>
                            <p className="program-description">
                                Comprehensive nursing education preparing you for professional practice with hands-on clinical training.
                            </p>
                            <ul className="program-highlights">
                                <li>Clinical Practice</li>
                                <li>Patient Care</li>
                                <li>Professional Ethics</li>
                            </ul>
                            <Link to="/programs#nursing" className="program-link">Learn More →</Link>
                        </div>

                        <div className="program-card featured">
                            <div className="featured-badge">Most Popular</div>
                            <div className="program-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                                    <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
                                </svg>
                            </div>
                            <h3>Clinical Medicine</h3>
                            <p className="program-duration">Diploma Program</p>
                            <p className="program-description">
                                Advanced medical training for clinical officers providing diagnostic and treatment skills.
                            </p>
                            <ul className="program-highlights">
                                <li>Medical Diagnostics</li>
                                <li>Treatment Protocols</li>
                                <li>Emergency Care</li>
                            </ul>
                            <Link to="/programs#clinical" className="program-link">Learn More →</Link>
                        </div>

                        <div className="program-card">
                            <div className="program-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                                </svg>
                            </div>
                            <h3>Environmental Health Technologist</h3>
                            <p className="program-duration">Diploma Program</p>
                            <p className="program-description">
                                Expert training in public health, sanitation, and environmental safety management.
                            </p>
                            <ul className="program-highlights">
                                <li>Public Health</li>
                                <li>Disease Prevention</li>
                                <li>Safety Inspection</li>
                            </ul>
                            <Link to="/programs#environmental" className="program-link">Learn More →</Link>
                        </div>

                        <div className="program-card">
                            <div className="program-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                                </svg>
                            </div>
                            <h3>EN to RN Abridged</h3>
                            <p className="program-duration">Bridging Program</p>
                            <p className="program-description">
                                Fast-track program for Enrolled Nurses to advance to Registered Nurse qualification.
                            </p>
                            <ul className="program-highlights">
                                <li>Career Advancement</li>
                                <li>Accelerated Learning</li>
                                <li>Professional Growth</li>
                            </ul>
                            <Link to="/programs#abridged" className="program-link">Learn More →</Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Facilities Preview */}
            <section className="facilities-section">
                <div className="container">
                    <div className="section-header">
                        <span className="section-badge">Our Facilities</span>
                        <h2 className="section-title">State-of-the-Art Learning Environment</h2>
                    </div>

                    <div className="facilities-grid">
                        <div className="facility-card">
                            <img
                                src="C:/Users/flyst/.gemini/antigravity/brain/70241dd5-b90c-44e6-af60-d66cfb9fe4bc/uploaded_image_0_1767895364487.jpg"
                                alt="Medical Equipment"
                            />
                            <h4>Modern Medical Equipment</h4>
                        </div>
                        <div className="facility-card">
                            <img
                                src="C:/Users/flyst/.gemini/antigravity/brain/70241dd5-b90c-44e6-af60-d66cfb9fe4bc/uploaded_image_2_1767895364487.jpg"
                                alt="Clinical Training"
                            />
                            <h4>Clinical Training Facilities</h4>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="container">
                    <div className="cta-content">
                        <h2>Ready to Start Your Healthcare Career?</h2>
                        <p>Join us for the January 2026 intake and begin your journey to professional excellence</p>
                        <div className="cta-buttons">
                            <Link to="/admissions" className="btn-primary">Apply Now</Link>
                            <Link to="/contact" className="btn-secondary">Contact Admissions</Link>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default HomePage;
