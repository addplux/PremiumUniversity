import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';
import * as Icons from '../components/Icons';
import './Layouts.css';

const LearningLayout = () => {
    const { user, logout } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);

    const navLinks = [
        {
            label: "Academic",
            items: [
                { name: "My Dashboard", path: "/dashboard", icon: <Icons.IconHome /> },
                { name: "Course Catalog", path: "/dashboard/courses", icon: <Icons.IconBook /> },
                { name: "Assignments", path: "/dashboard/assignments", icon: <Icons.IconEdit /> },
                { name: "Financials", path: "/dashboard/finance", icon: <Icons.IconFinance /> },
                { name: "Grades", path: "/dashboard/grades", icon: <Icons.IconAcademic /> },
                { name: "Timetable", path: "/dashboard/timetable", icon: <Icons.IconCalendar /> },
                { name: "Events", path: "/dashboard/events", icon: <Icons.IconCalendar /> },
            ]
        },
        {
            label: "Campus Life",
            items: [
                { name: "Events", path: "/dashboard/events", icon: <Icons.IconCalendar /> },
                { name: "Library", path: "/dashboard/library", icon: <Icons.IconLibrary /> },
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
