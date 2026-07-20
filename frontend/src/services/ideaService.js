import api from '../config/axios.js';

export const getIdeas = async () => {
    const response = await api.get('/ideas/');
    return response.data;
};

export const getIdea = async (id) => {
    const response = await api.get(`/ideas/${id}`);
    return response.data;
};

export const createIdea = async (data) => {
    const response = await api.post('/ideas/', data);
    return response.data;
};

export const updateIdea = async (id, data) => {
    const response = await api.put(`/ideas/${id}`, data);
    return response.data;
};

export const deleteIdea = async (id) => {
    return await api.delete(`/ideas/${id}`);
};

export const getIdeaStats = async () => {
    const response = await api.get('/ideas/stats');
    return response.data;
};

export const createGeneration = async (ideaId, data) => {
    const response = await api.post(`/ideas/${ideaId}/generations`, data);
    return response.data;
};

export const getGenerations = async (ideaId) => {
    const response = await api.get(`/ideas/${ideaId}/generations`);
    return response.data;
};

export const deleteGeneration = async (ideaId, genId) => {
    return await api.delete(`/ideas/${ideaId}/generations/${genId}`);
};