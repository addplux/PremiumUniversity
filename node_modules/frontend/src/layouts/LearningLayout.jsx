import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';
import './Layouts.css';

const LearningLayout = () => {
    const { user, logout } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);

    const navLinks = [
        {
            label: "Academic",
            items: [
                { name: "My Dashboard", path: "/dashboard", icon: "🏠" },
                { name: "Course Catalog", path: "/dashboard/courses", icon: "📚" },
                { name: "Assignments", path: "/dashboard/assignments", icon: "✍️" },
                { name: "Financials", path: "/dashboard/finance", icon: "💰" },
                { name: "Grades", path: "/dashboard/grades", icon: "🎓" },
                { name: "Timetable", path: "/dashboard/timetable", icon: "🕒" },
                { name: "Events", path: "/dashboard/events", icon: "📅" },
            ]
        },
        {
            label: "Campus Life",
            items: [
                { name: "Events", path: "/dashboard/events", icon: "🗓️" },
                { name: "Library", path: "/dashboard/library", icon: "📖" },
            ]
        }
    ];

    return (
        <div className="layout-container">
            <Sidebar
                title="PSOHS Learning"
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

export default LearningLayout;
