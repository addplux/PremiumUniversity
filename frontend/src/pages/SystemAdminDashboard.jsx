import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import './Dashboard.css';

const SystemAdminDashboard = () => {
    const { user } = useAuth();

    // Operation Pillars for Yard
    const pillars = [
        {
            title: 'Institution Hosting',
            icon: '🏛️',
            desc: 'Onboard and manage universities, branding, and connectivity.',
            color: '#8B5CF6',
            links: [
                { name: 'Managed Institutions', path: '/admin/system/institutions' },
                { name: 'Custom Branding', path: '/admin/system/branding' },
                { name: 'System Logs', path: '/admin/system/audit' }
            ]
        },
        {
            title: 'Procurement Center',
            icon: '📜',
            desc: 'Manage global tenders, bid evaluations, and the Yard e-Catalogue.',
            color: '#3B82F6',
            links: [
                { name: 'Active Tenders', path: '/admin/tenders' },
                { name: 'Bid Evaluations', path: '/admin/bids/evaluation' },
                { name: 'Global Catalogue', path: '/admin/ecatalogue' }
            ]
        },
        {
            title: 'Purchasing & Supply',
            icon: '💳',
            desc: 'Oversee purchasing flow, requisitions, and vendor relationships.',
            color: '#10B981',
            links: [
                { name: 'Vendor Directory', path: '/admin/suppliers' },
                { name: 'Purchase Orders', path: '/admin/purchase-orders' },
                { name: 'Requisitions', path: '/admin/requisitions' }
            ]
        }
    ];

    return (
        <div className="yard-dashboard-refined">
            <style>{`
                .yard-dashboard-refined {
                    padding: 2rem;
                    color: #f8fafc;
                }
                .yard-header {
                    margin-bottom: 3rem;
                }
                .yard-header h1 {
                    font-size: 2.5rem;
                    font-weight: 800;
                    margin-bottom: 0.5rem;
                    background: linear-gradient(135deg, #fff 0%, #a78bfa 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .yard-header p {
                    color: #94a3b8;
                    font-size: 1.1rem;
                }
                .stats-bar {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 1.5rem;
                    margin-bottom: 3.5rem;
                }
                .stat-box {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(139, 92, 246, 0.2);
                    padding: 1.5rem;
                    border-radius: 16px;
                    backdrop-filter: blur(10px);
                }
                .stat-box h4 {
                    font-size: 0.8rem;
                    text-transform: uppercase;
                    color: #94a3b8;
                    margin-bottom: 0.5rem;
                    letter-spacing: 0.05em;
                }
                .stat-box .val {
                    font-size: 2rem;
                    font-weight: 700;
                    color: #fff;
                }
                .pillars-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
                    gap: 2rem;
                }
                .pillar-card {
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 20px;
                    padding: 2rem;
                    transition: all 0.3s ease;
                    position: relative;
                    overflow: hidden;
                }
                .pillar-card:hover {
                    border-color: rgba(139, 92, 246, 0.5);
                    background: rgba(139, 92, 246, 0.05);
                    transform: translateY(-5px);
                }
                .pillar-icon {
                    font-size: 2.5rem;
                    margin-bottom: 1rem;
                }
                .pillar-card h2 {
                    font-size: 1.5rem;
                    margin-bottom: 0.75rem;
                }
                .pillar-card p {
                    color: #94a3b8;
                    font-size: 0.95rem;
                    margin-bottom: 2rem;
                    line-height: 1.6;
                }
                .pillar-links {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }
                .pillar-link {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1rem;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 12px;
                    color: #e2e8f0;
                    text-decoration: none;
                    font-weight: 500;
                    transition: all 0.2s ease;
                }
                .pillar-link:hover {
                    background: rgba(139, 92, 246, 0.2);
                    border-color: rgba(139, 92, 246, 0.4);
                    padding-left: 1.25rem;
                }
            `}</style>

            <header className="yard-header">
                <h1>Yard Control Center</h1>
                <p>Operational overview for Platform Administrator: {user?.firstName}</p>
            </header>

            <div className="stats-bar">
                <div className="stat-box">
                    <h4>Universities</h4>
                    <div className="val">1</div>
                </div>
                <div className="stat-box">
                    <h4>Global Tenders</h4>
                    <div className="val">0</div>
                </div>
                <div className="stat-box">
                    <h4>Active Vendors</h4>
                    <div className="val">0</div>
                </div>
                <div className="stat-box">
                    <h4>Reqs Pending</h4>
                    <div className="val">0</div>
                </div>
            </div>

            <div className="pillars-grid">
                {pillars.map((pillar, i) => (
                    <div key={i} className="pillar-card">
                        <div className="pillar-icon">{pillar.icon}</div>
                        <h2>{pillar.title}</h2>
                        <p>{pillar.desc}</p>
                        <div className="pillar-links">
                            {pillar.links.map((link, j) => (
                                <Link key={j} to={link.path} className="pillar-link">
                                    {link.name} <span>→</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SystemAdminDashboard;
