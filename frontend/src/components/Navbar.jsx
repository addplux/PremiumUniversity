import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();
    const { isAuthenticated, isAdmin, user, logout } = useAuth();

    const isActive = (path) => location.pathname === path;

    const handleLogout = () => {
        logout();
        setMobileMenuOpen(false);
    };

    return (
        <nav className="navbar">
            <div className="container">
                <div className="nav-content">
                    <Link to="/" className="logo-container">
                        <img
                            src="/assets/uploaded_image_1767895014903.jpg"
                            alt="PSOHS Logo"
                            className="logo"
                        />
                        <div className="logo-text">
                            <h2>PSOHS</h2>
                            <p>Premium School of Health Sciences</p>
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
                        <li><Link to="/about" className={isActive('/about') ? 'active' : ''} onClick={() => setMobileMenuOpen(false)}>About</Link></li>
                        <li><Link to="/programs" className={isActive('/programs') ? 'active' : ''} onClick={() => setMobileMenuOpen(false)}>Programs</Link></li>
                        <li><Link to="/admissions" className={isActive('/admissions') ? 'active' : ''} onClick={() => setMobileMenuOpen(false)}>Admissions</Link></li>
                        <li><Link to="/gallery" className={isActive('/gallery') ? 'active' : ''} onClick={() => setMobileMenuOpen(false)}>Student Life</Link></li>
                        <li><Link to="/contact" className={isActive('/contact') ? 'active' : ''} onClick={() => setMobileMenuOpen(false)}>Contact</Link></li>

                        {isAuthenticated ? (
                            <>
                                <li>
                                    <Link
                                        to={isAdmin ? '/admin' : '/dashboard'}
                                        className={isActive(isAdmin ? '/admin' : '/dashboard') ? 'active' : ''}
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        {isAdmin ? 'Admin Panel' : 'My Dashboard'}
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
                                <li><Link to="/admissions" className="btn-primary-nav" onClick={() => setMobileMenuOpen(false)}>Apply Now</Link></li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
