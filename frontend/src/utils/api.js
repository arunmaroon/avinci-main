import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    // Propagate user id for admin-gated endpoints
    try {
        const auth = localStorage.getItem('auth-store');
        if (auth) {
            const parsed = JSON.parse(auth);
            const userId = parsed?.state?.user?.id;
            if (userId) {
                config.headers['x-user-id'] = userId;
            }
        }
    } catch (e) {
        // ignore parse errors
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
