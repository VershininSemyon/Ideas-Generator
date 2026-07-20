
import { createContext, useState, useEffect } from 'react';
import { getMe } from '../services/userService.js';
import { logout as logoutService } from '../services/authService.js';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const userData = await getMe();
                setUser(userData);
            } catch (e) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        checkAuth();

        const handleAuthExpired = () => {
            setUser(null);
            window.location.href = '/login';
        };
        window.addEventListener('authExpired', handleAuthExpired);

        return () => window.removeEventListener('authExpired', handleAuthExpired);
    }, []);

    const login = (userData) => {
        setUser(userData);
    };

    const logout = async () => {
        try {
            await logoutService();
        } finally {
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};