import api from '../config/axios.js';
import { jwtDecode } from 'jwt-decode';

export const login = async (credentials) => {
    const response = await api.post('/auth/token', credentials);
    const decoded = jwtDecode(response.data.access);
    return { tokens: response.data, decoded };
};

export const register = async (userData) => {
    return await api.post('/users/', userData);
};

export const logout = async () => {
    return await api.post('/auth/logout');
};