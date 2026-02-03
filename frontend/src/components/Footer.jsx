import { Link } from 'react-router-dom';
import { useOrganization } from '../context/OrganizationContext';
import './Footer.css';

const Footer = () => {
    const { organization, logo, name, isMasterTenant } = useOrganization();
    const contact = organization?.contact || {};

    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-grid">
                    <div className="footer-col">
                        <img
                            src={logo || (name === 'Premium School of Health Sciences' ? "/assets/logo.jpg" : null)}
                            alt={`${name} Logo`}
                            className="footer-logo"
                            style={!logo && name !== 'Premium School of Health Sciences' ? { display: 'none' } : {}}
                        />

                        <p className="footer-tagline">
                            {isMasterTenant ? 'Modern Infrastructure for Higher Ed' : 'Pursuing Professional Excellence'}
                        </p>
                        <p className="footer-description">
                            {isMasterTenant
                                ? 'Yard is committed to empowering institutions with cloud-native management tools and sovereign data infrastructure.'
                                : `${name} is committed to providing quality healthcare education.`}
                        </p>
                    </div>

                    <div className="footer-col">
                        <h4>{isMasterTenant ? 'Platform' : 'Quick Links'}</h4>
                        <ul>
                            <li><Link to="/about">About Us</Link></li>
                            {isMasterTenant ? (
                                <>
                                    <li><a href="#features">Features</a></li>
                                    <li><Link to="/contact">Partners</Link></li>
                                </>
                            ) : (
                                <>
                                    <li><Link to="/programs">Programs</Link></li>
                                    <li><Link to="/admissions">Admissions</Link></li>
                                    <li><Link to="/gallery">Student Life</Link></li>
                                    <li><Link to="/contact">Contact</Link></li>
                                </>
                            )}
                        </ul>
                    </div>

                    <div className="footer-col">
                        <h4>{isMasterTenant ? 'Solutions' : 'Programs'}</h4>
                        <ul>
                            {isMasterTenant ? (
                                <>
                                    <li><Link to="/contact">Campus ERP</Link></li>
                                    <li><Link to="/contact">Finance & Billing</Link></li>
                                    <li><Link to="/contact">Procurement & Tenders</Link></li>
                                    <li><Link to="/contact">Student Portals</Link></li>
                                    <li><Link to="/contact">Data Residency</Link></li>
                                </>
                            ) : (
                                <>
                                    <li><Link to="/programs#nursing">Registered Nursing</Link></li>
                                    <li><Link to="/programs#clinical">Clinical Medicine</Link></li>
                                    <li><Link to="/programs#environmental">Environmental Health</Link></li>
                                    <li><Link to="/programs#abridged">EN to RN Abridged</Link></li>
                                </>
                            )}
                        </ul>
                    </div>

                    <div className="footer-col">
                        <h4>Contact</h4>
                        <ul>
                            <li>📧 {isMasterTenant ? 'hello@yard.cloud' : (contact.supportEmail || contact.adminEmail || 'info@psohs.ac.zm')}</li>
                            <li>📞 {isMasterTenant ? '+1 (XXX) YARD-ED' : (contact.adminPhone || '+260 XXX XXX XXX')}</li>
                            <li>📍 {isMasterTenant ? 'Cloud Infrastructure' : (contact.address || 'Lusaka')}, {isMasterTenant ? 'Global' : (contact.country || 'Zambia')}</li>
                        </ul>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; {new Date().getFullYear()} {name}. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
