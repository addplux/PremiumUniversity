import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useOrganization } from '../context/OrganizationContext';
import Sidebar from './Sidebar';
import * as Icons from '../components/Icons';
import { GlobalOutlined } from '@ant-design/icons';
import './Layouts.css';

const EnterpriseLayout = () => {
    const { user, logout } = useAuth();
    const { name, isMasterTenant } = useOrganization();
    const shortName = name === 'Premium School of Health Sciences' ? 'PSOHS' : name.substring(0, 10);
    const [mobileOpen, setMobileOpen] = useState(false);

    // Default University Navigation
    const universityLinks = [
        {
            label: "Dashboard",
            items: [
                { name: "Overview", path: "/admin", icon: <Icons.IconDashboard /> },
            ]
        },
        {
            label: "Admissions Center",
            items: [
                { name: "Applications", path: "/admin/applications", icon: <Icons.IconFile /> },
                { name: "Interviews", path: "/admin/interviews", icon: <Icons.IconCalendar /> },
                { name: "Inquiries", path: "/admin/contact", icon: <Icons.IconMessage /> },
            ]
        },
        {
            label: "People",
            items: [
                { name: "Students", path: "/admin/students", icon: <Icons.IconUsers /> },
                { name: "Teachers", path: "/admin/teachers", icon: <Icons.IconUsers /> },
                { name: "Faculty", path: "/admin/faculty", icon: <Icons.IconUsers /> },
                { name: "Staff", path: "/admin/staff", icon: <Icons.IconUsers /> }
            ]
        },
        {
            label: "Academics",
            items: [
                { name: "Courses", path: "/admin/courses", icon: <Icons.IconBook /> },
                { name: "Lectures", path: "/admin/lectures", icon: <Icons.IconAcademic /> },
                { name: "Assignments", path: "/admin/assignments", icon: <Icons.IconFile /> },
                { name: "ID Cards", path: "/admin/id-cards", icon: <Icons.IconUsers /> },
                { name: "Academic Records", path: "/admin/academic-records", icon: <Icons.IconAcademic /> },
            ]
        },
        {
            label: "Financials",
            items: [
                { name: "Student Fees", path: "/admin/fees", icon: <Icons.IconFinance /> },
            ]
        }
    ];

    // Yard (Master Tenant) Navigation
    const yardLinks = [
        {
            label: "Operations",
            items: [
                { name: "Yard Overview", path: "/admin/system", icon: <Icons.IconDashboard /> },
            ]
        },
        {
            label: "Institution Management",
            items: [
                { name: "All Institutions", path: "/admin/system/institutions", icon: <Icons.IconHome /> },
                { name: "System Branding", path: "/admin/system/branding", icon: <Icons.IconDashboard /> },
            ]
        },
        {
            label: "Procurement & Tenders",
            items: [
                { name: "Tender Management", path: "/admin/tenders", icon: <Icons.IconFile /> },
                { name: "Bid Evaluation", path: "/admin/bids/evaluation", icon: <Icons.IconEdit /> },
                { name: "Yard Catalogue", path: "/admin/ecatalogue", icon: <Icons.IconBook /> },
            ]
        },
        {
            label: "Purchasing & Supply",
            items: [
                { name: "Vendors & Suppliers", path: "/admin/suppliers", icon: <Icons.IconUsers /> },
                { name: "Purchase Requisitions", path: "/admin/requisitions", icon: <Icons.IconFile /> },
                { name: "Purchase Orders", path: "/admin/purchase-orders", icon: <Icons.IconFile /> },
            ]
        },
        {
            label: "System",
            items: [
                { name: "User Management", path: "/admin/system/users", icon: <Icons.IconUsers /> },
                { name: "Audit Logs", path: "/admin/system/audit", icon: <Icons.IconFile /> }
            ]
        }
    ];

    const navLinks = isMasterTenant ? yardLinks : universityLinks;

    return (
        <div className={`layout-container ${isMasterTenant ? 'yard-theme' : ''}`}>
            <header className="mobile-header">
                <button className="mobile-toggle" onClick={() => setMobileOpen(true)}>
                    ☰
                </button>
                <div className="sidebar-brand" style={{ color: 'var(--primary-color)' }}>
                    {shortName}
                </div>
                <div style={{ width: '40px' }}></div> {/* Spacer */}
            </header>
            <Sidebar
                title={isMasterTenant ? "Yard Console" : `${shortName} Admin`}
                links={navLinks}
                user={user}
                onLogout={logout}
                mobileOpen={mobileOpen}
                setMobileOpen={setMobileOpen}
            />
            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
};


export default EnterpriseLayout;
