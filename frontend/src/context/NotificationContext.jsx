import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const { user, organizationId } = useAuth();
    const [socket, setSocket] = useState(null);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        if (user && organizationId) {
            const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
                query: {
                    userId: user._id,
                    organizationId: organizationId
                }
            });

            newSocket.on('notification', (notification) => {
                console.log('🔔 New Notification:', notification);
                setNotifications((prev) => [notification, ...prev]);

                // Show toast
                const toastType = notification.type === 'error' ? 'error' : (notification.type === 'success' ? 'success' : 'info');
                toast[toastType](notification.message, {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
            });

            setSocket(newSocket);

            return () => newSocket.close();
        }
    }, [user, organizationId]);

    return (
        <NotificationContext.Provider value={{ notifications, socket }}>
            {children}
            <ToastContainer />
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => useContext(NotificationContext);
