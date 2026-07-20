import api from '../config/axios.js';

export const getMe = async () => {
    const response = await api.get('/users/me');
    return response.data;
};

export const updateMe = async (data) => {
    const response = await api.put('/users/me', data);
    return response.data;
};

export const deleteMe = async () => {
    return await api.delete('/users/me');
};