
import { createContext, useState, useEffect, useCallback } from 'react';
import { getMe } from '../services/userService.js';
import { logout as logoutService } from '../services/authService.js';
import { useLocalStorage } from '../hooks/useLocalStorage.js';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [storedUser, setStoredUser, removeStoredUser] = useLocalStorage('user', null);

    useEffect(() => {
        let isMounted = true;

        const checkAuth = async () => {
            try {
                const userData = await getMe();
                if (isMounted) {
                    setUser(userData);
                    setStoredUser(userData);
                }
            } catch (e) {
                if (isMounted) {
                    if (storedUser) {
                        setUser(storedUser);
                    } else {
                        setUser(null);
                        removeStoredUser();
                    }
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        checkAuth();

        const handleAuthExpired = () => {
            if (isMounted) {
                setUser(null);
                setLoading(false);
                removeStoredUser();
            }
        };

        window.addEventListener('authExpired', handleAuthExpired);

        return () => {
            isMounted = false;
            window.removeEventListener('authExpired', handleAuthExpired);
        };
    }, []);

    const login = useCallback(async () => {
        setLoading(true);
        try {
            const userData = await getMe();
            setUser(userData);
            setStoredUser(userData);
        } catch (e) {
            setUser(null);
            removeStoredUser();
        } finally {
            setLoading(false);
        }
    }, [setStoredUser, removeStoredUser]);

    const logout = useCallback(async () => {
        try {
            await logoutService();
        } finally {
            setUser(null);
            removeStoredUser();
        }
    }, [removeStoredUser]);

    const updateUser = useCallback((userData) => {
        setUser(userData);
        setStoredUser(userData);
    }, [setStoredUser]);

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};
