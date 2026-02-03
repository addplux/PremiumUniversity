import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useOrganization } from '../context/OrganizationContext';
import './Navbar.css';

const Navbar = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();
    const { isAuthenticated, isAdmin, isAnyAdmin, user, logout } = useAuth();
    const { organization, logo, name, isMasterTenant } = useOrganization();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const isActive = (path) => location.pathname === path;

    const handleLogout = () => {
        logout();
        setMobileMenuOpen(false);
    };

    return (
        <nav className={`navbar ${scrolled ? 'scrolled' : ''} ${isMasterTenant ? 'yard-navbar' : ''}`}>
            <div className="container">
                <div className="nav-content">
                    <Link to="/" className="logo-container">
                        <img
                            src={logo || (name === 'Premium School of Health Sciences' ? "/assets/logo.jpg" : null)}
                            alt={`${name} Logo`}
                            className="logo"
                            style={!logo && name !== 'Premium School of Health Sciences' ? { display: 'none' } : {}}
                        />

                        <div className="logo-text">
                            <h2>{name === 'Premium School of Health Sciences' ? 'PSOHS' : (name.length > 15 ? name.substring(0, 12) + '...' : name)}</h2>
                            <p>{name}</p>
                        </div>

                    </Link>

                    <button
                        className={`mobile-menu-btn ${mobileMenuOpen ? 'active' : ''}`}
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>

                    <ul className={`nav-links ${mobileMenuOpen ? 'active' : ''}`}>
                        <li><Link to="/" className={isActive('/') ? 'active' : ''} onClick={() => setMobileMenuOpen(false)}>Home</Link></li>

                        {isMasterTenant ? (
                            // Yard (SaaS) Links
                            <>
                                <li><a href="#features" onClick={() => setMobileMenuOpen(false)}>Features</a></li>
                                <li><Link to="/about" className={isActive('/about') ? 'active' : ''} onClick={() => setMobileMenuOpen(false)}>About</Link></li>
                            </>
                        ) : (
                            // University Links
                            <>
                                <li><Link to="/about" className={isActive('/about') ? 'active' : ''} onClick={() => setMobileMenuOpen(false)}>About</Link></li>
                                <li><Link to="/programs" className={isActive('/programs') ? 'active' : ''} onClick={() => setMobileMenuOpen(false)}>Programs</Link></li>
                                <li><Link to="/admissions" className={isActive('/admissions') ? 'active' : ''} onClick={() => setMobileMenuOpen(false)}>Admissions</Link></li>
                                <li><Link to="/gallery" className={isActive('/gallery') ? 'active' : ''} onClick={() => setMobileMenuOpen(false)}>Student Life</Link></li>
                                <li><Link to="/contact" className={isActive('/contact') ? 'active' : ''} onClick={() => setMobileMenuOpen(false)}>Contact</Link></li>
                            </>
                        )}

                        {isAuthenticated ? (
                            <>
                                <li>
                                    <Link
                                        to="/portal"
                                        className={isActive('/portal') ? 'active' : ''}
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        {isAnyAdmin ? 'Admin Console' : 'My Dashboard'}
                                    </Link>
                                </li>

                                <li>
                                    <button onClick={handleLogout} className="btn-logout">
                                        Logout ({user?.firstName})
                                    </button>
                                </li>
                            </>
                        ) : (
                            <>
                                <li><Link to="/login" className={isActive('/login') ? 'active' : ''} onClick={() => setMobileMenuOpen(false)}>Login</Link></li>
                                {isMasterTenant ? (
                                    <li><Link to="/contact" className="btn-primary-nav" onClick={() => setMobileMenuOpen(false)}>Get Started</Link></li>
                                ) : (
                                    <li><Link to="/admissions" className="btn-primary-nav" onClick={() => setMobileMenuOpen(false)}>Apply Now</Link></li>
                                )}
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
