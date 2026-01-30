import { Link, useLocation } from 'react-router-dom';
import { useOrganization } from '../context/OrganizationContext';
import './Layouts.css';

const Sidebar = ({ title, brandLink = '/', links = [], user, onLogout, mobileOpen, setMobileOpen }) => {
    const location = useLocation();
    const { logo, name } = useOrganization();

    const isActive = (path) => {
        return location.pathname === path || location.pathname.startsWith(`${path}/`);
    };

    return (
        <>
            <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <Link to={brandLink} className="sidebar-brand">
                            <img src={logo || "/assets/logo.jpg"} alt={name} style={{ height: '30px', width: '30px', borderRadius: '50%' }} />
                            {title}
                        </Link>
                        {mobileOpen && (
                            <button className="close-sidebar" onClick={() => setMobileOpen(false)} style={{ color: 'white', fontSize: '1.5rem' }}>
                                ✕
                            </button>
                        )}
                    </div>
                </div>

                <div className="sidebar-nav">
                    {links.map((section, index) => (
                        <div key={index} className="nav-section">
                            {section.label && <div className="nav-section-label">{section.label}</div>}
                            {section.items.map((link, linkIndex) => (
                                <Link
                                    key={linkIndex}
                                    to={link.path}
                                    className={`nav-link ${isActive(link.path) ? 'active' : ''}`}
                                    onClick={() => setMobileOpen(false)}
                                >
                                    <span className="nav-icon">{link.icon}</span>
                                    {link.name}
                                </Link>
                            ))}
                        </div>
                    ))}
                </div>

                <div className="sidebar-footer">
                    <div className="user-mini-profile">
                        <div className="user-avatar">
                            {user?.firstName?.charAt(0) || 'U'}
                        </div>
                        <div className="user-info">
                            <div className="user-name">{user?.firstName} {user?.lastName}</div>
                            <div className="user-role">{user?.role}</div>
                        </div>
                    </div>
                </div>
            </aside>

            {mobileOpen && (
                <div
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 90 }}
                    onClick={() => setMobileOpen(false)}
                />
            )}
        </>
    );
};

export default Sidebar;
