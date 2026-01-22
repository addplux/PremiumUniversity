import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';
import * as Icons from '../components/Icons';
import './Layouts.css';

const EnterpriseLayout = () => {
    const { user, logout } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);

    const navLinks = [
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
                { name: "Lesson Planning", path: "/admin/lesson-planning", icon: <Icons.IconEdit /> },
                { name: "Syllabus", path: "/admin/syllabus", icon: <Icons.IconBook /> },
                { name: "Materials", path: "/admin/materials", icon: <Icons.IconFile /> },
                { name: "Homework", path: "/admin/homework", icon: <Icons.IconEdit /> },
                { name: "Classwork", path: "/admin/classwork", icon: <Icons.IconEdit /> },
                { name: "Assignments", path: "/admin/assignments", icon: <Icons.IconFile /> },
                { name: "Examinations", path: "/admin/examinations", icon: <Icons.IconFile /> },
                { name: "Circulars", path: "/admin/circulars", icon: <Icons.IconBell /> },
                { name: "Notifications", path: "/admin/notifications", icon: <Icons.IconBell /> },
                { name: "ID Cards", path: "/admin/id-cards", icon: <Icons.IconUsers /> },
                { name: "Academic Records", path: "/admin/academic-records", icon: <Icons.IconAcademic /> },
                { name: "Classes", path: "/admin/classes", icon: <Icons.IconHome /> },
            ]
        },
        {
            label: "Bursar",
            items: [
                { name: "Student Fees", path: "/admin/fees", icon: <Icons.IconFinance /> },
                { name: "Fees & Payments", path: "/admin/finance", icon: <Icons.IconFinance /> },
            ]
        }
    ];

    return (
        <div className="layout-container">
            <header className="mobile-header">
                <button className="mobile-toggle" onClick={() => setMobileOpen(true)}>
                    ☰
                </button>
                <div className="sidebar-brand" style={{ color: 'var(--primary-blue)' }}>
                    PSOHS
                </div>
                <div style={{ width: '40px' }}></div> {/* Spacer */}
            </header>
            <Sidebar
                title="PSOHS Enterprise"
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
