import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';
import './Layouts.css';

const EnterpriseLayout = () => {
    const { user, logout } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);

    const navLinks = [
        {
            label: "Dashboard",
            items: [
                { name: "Overview", path: "/admin", icon: "📊" },
            ]
        },
        {
            label: "Admissions Center",
            items: [
                { name: "Applications", path: "/admin/applications", icon: "📝" },
                { name: "Interviews", path: "/admin/interviews", icon: "📅" },
                { name: "Inquiries", path: "/admin/contact", icon: "📬" },
            ]
        },
        {
            label: "People",
            items: [
                { name: "Students", path: "/admin/students", icon: "👨‍🎓" },
                { name: "Teachers", path: "/admin/teachers", icon: "👨‍🏫" },
                { name: "Faculty", path: "/admin/faculty", icon: "👨‍🏫" },
                { name: "Staff", path: "/admin/staff", icon: "👔" }
            ]
        },
        {
            label: "Academics",
            items: [
                { name: "Courses", path: "/admin/courses", icon: "📚" },
                { name: "Lectures", path: "/admin/lectures", icon: "🎯" },
                { name: "Lesson Planning", path: "/admin/lesson-planning", icon: "📝" },
                { name: "Syllabus", path: "/admin/syllabus", icon: "📖" },
                { name: "Materials", path: "/admin/materials", icon: "📁" },
                { name: "Homework", path: "/admin/homework", icon: "✍️" },
                { name: "Classwork", path: "/admin/classwork", icon: "✏️" },
                { name: "Assignments", path: "/admin/assignments", icon: "📋" },
                { name: "Examinations", path: "/admin/examinations", icon: "📝" },
                { name: "Circulars", path: "/admin/circulars", icon: "📢" },
                { name: "Notifications", path: "/admin/notifications", icon: "🔔" },
                { name: "Academic Records", path: "/admin/academic-records", icon: "🎓" },
                { name: "Classes", path: "/admin/classes", icon: "🏫" },
            ]
        },
        {
            label: "Bursar",
            items: [
                { name: "Student Fees", path: "/admin/fees", icon: "💳" },
                { name: "Fees & Payments", path: "/admin/finance", icon: "💰" },
            ]
        }
    ];

    return (
        <div className="layout-container">
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
