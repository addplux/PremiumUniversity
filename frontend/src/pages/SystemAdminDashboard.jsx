import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import './Dashboard.css';

const SystemAdminDashboard = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false); // Mock loading for now as we redesign

    // Management Categories for Yard Dashboard
    const managementCategories = [
        {
            title: 'Yard Operations',
            icon: '🏗️',
            color: '#8b5cf6', // Yard Purple
            items: [
                { name: 'Tender Management', path: '/admin/tenders' },
                { name: 'Bid Evaluation', path: '/admin/bids/evaluation' },
                { name: 'Supply Chain', path: '/admin/suppliers' }, // Entry point to SC modules
                { name: 'Yard Catalogue', path: '/admin/ecatalogue' },
                { name: 'Logistics', path: '/admin/logistics' }
            ]
        },
        {
            title: 'Institution Management',
            icon: '🏛️',
            color: '#3b82f6', // Institutional Blue
            items: [
                { name: 'All Institutions', path: '/admin/system/institutions' }, // New Page
                { name: 'Add New Institution', path: '/admin/system/institutions/create' }, // Direct Action
                { name: 'Global Settings', path: '/admin/system/settings' }
            ]
        },
        {
            title: 'System & Security',
            icon: '🛡️',
            color: '#10b981', // Security Green
            items: [
                { name: 'User Management', path: '/admin/system/users' },
                { name: 'Audit Logs', path: '/admin/system/logs' },
                { name: 'Security Overview', path: '/admin/system/security' },
                { name: 'System Health', path: '/system/health' }
            ]
        }
    ];

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Yard Control Center</h1>
                <p>Welcome back, {user?.firstName}. Manage global operations and institutions.</p>
            </div>

            {/* Quick Stats Row (Placeholder data for design) */}
            <div className="dashboard-grid" style={{ marginBottom: '2rem' }}>
                <div className="dashboard-card" style={{ borderLeft: '4px solid #8b5cf6' }}>
                    <h4>🏢 Institutions</h4>
                    <div className="stat-big">1</div>
                    <p className="text-small">Active Universites</p>
                </div>
                <div className="dashboard-card" style={{ borderLeft: '4px solid #3b82f6' }}>
                    <h4>📋 Active Tenders</h4>
                    <div className="stat-big">0</div>
                    <p className="text-small">Global opportunities</p>
                </div>
                <div className="dashboard-card" style={{ borderLeft: '4px solid #10b981' }}>
                    <h4>💰 Platform Revenue</h4>
                    <div className="stat-big">$0.00</div>
                    <p className="text-small">Monthly Recurring</p>
                </div>
                <div className="dashboard-card" style={{ borderLeft: '4px solid #f59e0b' }}>
                    <h4>👥 Total Users</h4>
                    <div className="stat-big">3</div>
                    <p className="text-small">Across all tenants</p>
                </div>
            </div>

            {/* 3 Pillars Layout */}
            <div style={{ marginTop: '2rem' }}>
                <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: '600' }}>Management Pillars</h2>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', // Wider cards
                    gap: '1.5rem'
                }}>
                    {managementCategories.map((category, index) => (
                        <div
                            key={index}
                            style={{
                                background: 'white',
                                borderRadius: '12px',
                                padding: '2rem',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                                border: '1px solid #e5e7eb',
                                transition: 'all 0.3s ease',
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-4px)';
                                e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.05)';
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem', borderBottom: `2px solid ${category.color}`, paddingBottom: '1rem' }}>
                                <span style={{ fontSize: '2.5rem', marginRight: '1rem' }}>{category.icon}</span>
                                <div>
                                    <h3 style={{
                                        margin: 0,
                                        fontSize: '1.25rem',
                                        fontWeight: '700',
                                        color: '#1f2937'
                                    }}>
                                        {category.title}
                                    </h3>
                                    <span style={{ fontSize: '0.875rem', color: category.color, fontWeight: '500' }}>
                                        {category.items.length} Modules Active
                                    </span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {category.items.map((item, idx) => (
                                    <Link
                                        key={idx}
                                        to={item.path}
                                        style={{
                                            textDecoration: 'none',
                                            padding: '1rem',
                                            background: '#f3f4f6',
                                            borderRadius: '8px',
                                            color: '#374151',
                                            fontWeight: '500',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            transition: 'background 0.2s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = category.color;
                                            e.currentTarget.style.color = 'white';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = '#f3f4f6';
                                            e.currentTarget.style.color = '#374151';
                                        }}
                                    >
                                        {item.name}
                                        <span>→</span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SystemAdminDashboard;
