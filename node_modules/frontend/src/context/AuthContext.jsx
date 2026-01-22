import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem('token'));

    // Configure axios defaults
    // Use environment variable, OR fallback to the known Production URL if in production mode, OR localhost for dev
    // Configure axios defaults
    // Use environment variable, ensuring it ends with /api
    const getBaseUrl = () => {
        let envUrl = import.meta.env.VITE_API_URL;
        if (envUrl) {
            // Remove trailing slash
            envUrl = envUrl.replace(/\/$/, '');
            // Check if it already ends with /api
            if (envUrl.endsWith('/api')) {
                return envUrl;
            }
            return `${envUrl}/api`;
        }
        // Fallback for development
        return import.meta.env.PROD ? '/api' : 'http://localhost:5000/api';
    };

    axios.defaults.baseURL = getBaseUrl();

    console.log('Using API URL:', axios.defaults.baseURL); // Debug log

    if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    useEffect(() => {
        if (token) {
            fetchUser();
        } else {
            setLoading(false);
        }
    }, [token]);

    const fetchUser = async () => {
        try {
            // Ensure header is set before request
            if (token) {
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            }

            const response = await axios.get('/auth/me');
            if (response.data.success) {
                setUser(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch user:', error);
            // Only logout if token is invalid (401), not on network errors
            if (error.response && error.response.status === 401) {
                logout();
            }
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            const response = await axios.post('/auth/login', { email, password });
            if (response.data.success) {
                const { token, ...userData } = response.data.data;
                setToken(token);
                setUser(userData);
                localStorage.setItem('token', token);
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                return { success: true };
            }
        } catch (error) {
            let message = 'Login failed';

            if (error.response) {
                // Prefer the verbose 'error' field if available (set in server.js), otherwise 'message'
                message = error.response.data?.error || error.response.data?.message || message;
            } else if (error.request) {
                // Return the actual network error with URL for debugging
                message = `Request failed to ${error.config?.url || 'server'}: ${error.message}`;
            } else {
                message = error.message;
            }

            return {
                success: false,
                message: message
            };
        }
    };

    const register = async (userData) => {
        try {
            const response = await axios.post('/auth/register', userData);
            if (response.data.success) {
                const { token, ...user } = response.data.data;
                setToken(token);
                setUser(user);
                localStorage.setItem('token', token);
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                return { success: true };
            }
        } catch (error) {
            let message = 'Registration failed';

            if (error.response) {
                // Server responded with an error code (4xx, 5xx)
                message = error.response.data?.error || error.response.data?.message || message;
            } else if (error.request) {
                // Request was made but no response (Network Error/CORS/Localhost issue)
                console.error('Network Error:', error);
                message = `Request failed to ${error.config?.url || 'server'}: ${error.message}`;

                // Helper for developers/users to see what's wrong
                if (axios.defaults.baseURL && axios.defaults.baseURL.includes('localhost')) {
                    message += ' (Frontend might be trying to connect to localhost)';
                }
            } else {
                message = error.message;
            }

            return {
                success: false,
                message: message
            };
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        // New role checks
        isSystemAdmin: user?.role === 'system_admin',
        isFinanceAdmin: user?.role === 'finance_admin',
        isAcademicAdmin: user?.role === 'academic_admin',
        isStudent: user?.role === 'student',
        // Helper to check if user has any admin role
        isAnyAdmin: ['admin', 'system_admin', 'finance_admin', 'academic_admin'].includes(user?.role),
        // Get user role
        userRole: user?.role
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
