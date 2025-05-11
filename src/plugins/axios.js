// plugins/axios.js
import { useAuthStore } from '@/stores/AuthStore';
import axios from 'axios';

// Create axios instance
const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://16.16.202.193:8283/api/v1',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor
axiosInstance.interceptors.request.use(
    async (config) => {
        const authStore = useAuthStore();

        // Logging token in request interceptor
        console.log('Token in request interceptor:', authStore.token);

        // Check if token is about to expire
        if (authStore.isAuthenticated && authStore.isTokenExpiring) {
            try {
                await authStore.refreshSession();
            } catch (error) {
                console.error('Failed to refresh token:', error);
            }
        }

        // Add token to headers if available
        if (authStore.token) {
            config.headers.Authorization = `Bearer ${authStore.token}`;
        }

        // Log the request for debugging
        console.group('🚀 Outgoing Request');
        console.log('URL:', `${config.baseURL}${config.url}`);
        console.log('Method:', config.method.toUpperCase());
        console.log('Headers:', JSON.stringify(config.headers, null, 2));

        if (config.data) {
            console.log('Request Body:', typeof config.data === 'string' ? config.data : JSON.stringify(config.data, null, 2));
        }

        if (config.params) {
            console.log('URL Params:', config.params);
        }

        console.log('Authorization:', config.headers.Authorization ? 'Bearer Token Present' : 'No Auth Token');
        console.groupEnd();

        return config;
    },
    (error) => {
        console.error('⚠️ Request Error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor
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

axiosInstance.interceptors.response.use(
    (response) => {
        console.group('✅ Response Received');
        console.log('Status:', response.status);
        console.log('Status Text:', response.statusText);
        console.log('Response Headers:', response.headers);
        console.log('Response Data:', response.data);
        console.groupEnd();
        return response;
    },
    async (error) => {
        console.group('❌ Response Error');
        console.log('Error:', error.message);
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Status Text:', error.response.statusText);
            console.log('Response Headers:', error.response.headers);
            console.log('Response Data:', error.response.data);
        } else if (error.request) {
            console.log('No response received');
            console.log('Request:', error.request);
        }
        console.groupEnd();

        const originalRequest = error.config;
        const authStore = useAuthStore();

        // If error is 401 and we haven't tried refreshing yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                // If already refreshing, queue the request
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return axiosInstance(originalRequest);
                    })
                    .catch((err) => {
                        return Promise.reject(err);
                    });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const success = await authStore.refreshSession();
                if (success) {
                    const token = authStore.token;
                    processQueue(null, token);
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return axiosInstance(originalRequest);
                } else {
                    processQueue(error, null);
                    authStore.clearAuth();
                    // Redirect to login
                    window.location.href = '/auth/login';
                    return Promise.reject(error);
                }
            } catch (refreshError) {
                processQueue(refreshError, null);
                authStore.clearAuth();
                window.location.href = '/auth/login';
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        // Handle other error codes
        if (error.response?.status === 403) {
            // Handle forbidden access
            console.error('Access forbidden:', error.response.data);
        }

        if (error.response?.status === 404) {
            // Handle not found
            console.error('Resource not found:', error.response.data);
        }

        if (error.response?.status >= 500) {
            // Handle server errors
            console.error('Server error:', error.response.data);
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
