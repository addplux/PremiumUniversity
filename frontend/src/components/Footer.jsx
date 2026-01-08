import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-grid">
                    <div className="footer-col">
                        <img
                            src="/assets/logo.jpg"
                            alt="PSOHS Logo"
                            className="footer-logo"
                        />
                        <p className="footer-tagline">Pursuing Professional Excellence</p>
                        <p className="footer-description">
                            Premium School of Health Sciences is committed to providing quality healthcare education.
                        </p>
                    </div>

                    <div className="footer-col">
                        <h4>Quick Links</h4>
                        <ul>
                            <li><Link to="/about">About Us</Link></li>
                            <li><Link to="/programs">Programs</Link></li>
                            <li><Link to="/admissions">Admissions</Link></li>
                            <li><Link to="/gallery">Student Life</Link></li>
                            <li><Link to="/contact">Contact</Link></li>
                        </ul>
                    </div>

                    <div className="footer-col">
                        <h4>Programs</h4>
                        <ul>
                            <li><Link to="/programs#nursing">Registered Nursing</Link></li>
                            <li><Link to="/programs#clinical">Clinical Medicine</Link></li>
                            <li><Link to="/programs#environmental">Environmental Health</Link></li>
                            <li><Link to="/programs#abridged">EN to RN Abridged</Link></li>
                        </ul>
                    </div>

                    <div className="footer-col">
                        <h4>Contact</h4>
                        <ul>
                            <li>📧 info@psohs.ac.zm</li>
                            <li>📞 +260 XXX XXX XXX</li>
                            <li>📍 Lusaka, Zambia</li>
                        </ul>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; {new Date().getFullYear()} Premium School of Health Sciences. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
