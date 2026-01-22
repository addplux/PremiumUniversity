import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Protected Route Component with Role-Based Access Control
 * @param {React.ReactNode} children - Child components to render
 * @param {Array<string>} allowedRoles - Array of roles allowed to access this route
 */
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { isAuthenticated, userRole, loading } = useAuth();

    if (loading) {
        return (
            <div className="loading-screen" style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                fontSize: '1.2rem'
            }}>
                Loading...
            </div>
        );
    }

    // Not authenticated - redirect to login
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Check if user's role is in allowed roles
    if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
        // Redirect to appropriate dashboard based on role
        const redirectMap = {
            'student': '/dashboard',
            'system_admin': '/admin/system',
            'finance_admin': '/admin/finance',
            'academic_admin': '/admin/academic',
            'admin': '/admin' // Legacy admin
        };

        return <Navigate to={redirectMap[userRole] || '/dashboard'} replace />;
    }

    return children;
};

export default ProtectedRoute;
