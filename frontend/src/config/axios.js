import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (!error.response) {
            window.dispatchEvent(new CustomEvent('showToast', { 
                detail: { message: 'Ошибка сети или сервер недоступен', type: 'error' } 
            }));
            return Promise.reject(error);
        }

        if (error.response.status === 429) {
            const retryAfter = error.response.data?.retry_after_seconds || 60;
            window.dispatchEvent(new CustomEvent('showToast', { 
                detail: { message: `Слишком много запросов. Попробуйте через ${retryAfter} сек.`, type: 'warning' } 
            }));
            return Promise.reject(error);
        }

        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                await axios.post(
                    `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/auth/token/refresh`,
                    {},
                    { withCredentials: true }
                );
                return api(originalRequest);
            } catch (refreshError) {
                window.dispatchEvent(new CustomEvent('authExpired'));
                return Promise.reject(refreshError);
            }
        }

        if (error.response.data?.detail) {
            let errorMessage = 'Произошла ошибка';
            
            if (Array.isArray(error.response.data.detail)) {
                errorMessage = error.response.data.detail.map(err => err.msg).join('; ');
            } else if (typeof error.response.data.detail === 'string') {
                errorMessage = error.response.data.detail;
            } else if (error.response.data.detail.msg) {
                errorMessage = error.response.data.detail.msg;
            }

            window.dispatchEvent(new CustomEvent('showToast', { 
                detail: { message: errorMessage, type: 'error' } 
            }));
        }

        return Promise.reject(error);
    }
);

export default api;