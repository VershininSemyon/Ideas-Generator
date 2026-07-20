import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 429) {
            const retryAfter = error.response.data?.retry_after_seconds || 60;
            window.dispatchEvent(
                new CustomEvent('showToast', {
                    detail: { message: `Слишком много запросов. Подождите ${retryAfter} сек.`, type: 'warning' },
                })
            );
            return Promise.reject(error);
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(() => api(originalRequest))
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                await axios.post(
                    `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/auth/token/refresh`,
                    {},
                    { withCredentials: true }
                );
                
                processQueue(null);
                
                try {
                    const userResponse = await api.get('/users/me');
                    const userData = userResponse.data;
                    localStorage.setItem('user', JSON.stringify(userData));
                } catch (userError) {
                    console.error('Failed to update user data after refresh:', userError);
                }
                
                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                window.dispatchEvent(new CustomEvent('authExpired'));
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        if (error.response?.data?.detail) {
            let errorMessage = 'Произошла ошибка';
            if (Array.isArray(error.response.data.detail)) {
                errorMessage = error.response.data.detail.map((err) => err.msg).join('; ');
            } else if (typeof error.response.data.detail === 'string') {
                errorMessage = error.response.data.detail;
            } else if (error.response.data.detail.msg) {
                errorMessage = error.response.data.detail.msg;
            }

            if (error.response.status !== 401) {
                window.dispatchEvent(
                    new CustomEvent('showToast', {
                        detail: { message: errorMessage, type: 'error' },
                    })
                );
            }
        }

        return Promise.reject(error);
    }
);

export default api;
