/**
 * Axios Instance Configuration
 * Centralized API client with interceptors for authentication
 */

import axios from 'axios';
import toast from 'react-hot-toast';

// Create axios instance
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api', // Use env var for production, fallback to proxy for dev
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - attach token to all requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - handle errors globally
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Handle specific error cases
        if (error.response) {
            const { status, data } = error.response;

            switch (status) {
                case 401:
                    // Unauthorized - clear auth and redirect to login
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');

                    // Only show toast if not already on login page AND not on public form pages
                    const isPublicRoute = ['/login', '/docket-form', '/job-form', '/'].some(path => window.location.pathname === path || window.location.pathname.startsWith(path));

                    if (!isPublicRoute) {
                        toast.error(data?.message || 'Session expired. Please login again.');
                        window.location.href = '/login';
                    }
                    break;

                case 403:
                    // Forbidden
                    toast.error(data?.message || 'You do not have permission to perform this action.');
                    break;

                case 404:
                    // Not found
                    toast.error(data?.message || 'Resource not found.');
                    break;

                case 429:
                    // Too many requests
                    toast.error(data?.message || 'Too many requests. Please try again later.');
                    break;

                case 500:
                case 502:
                case 503:
                    // Server errors
                    toast.error('Server error. Please try again later.');
                    break;

                default:
                    // Generic error
                    toast.error(data?.message || 'An error occurred. Please try again.');
            }
        } else if (error.request) {
            // Network error
            toast.error('Network error. Please check your connection.');
        } else {
            // Other errors
            toast.error('An unexpected error occurred.');
        }

        return Promise.reject(error);
    }
);

// API endpoints
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    getMe: () => api.get('/auth/me'),
    updateProfile: (data) => api.put('/auth/profile', data),
    changePassword: (data) => api.put('/auth/password', data),
};

export const customerAPI = {
    getAll: (params) => api.get('/customers', { params }),
    getById: (id) => api.get(`/customers/${id}`),
    create: (data) => api.post('/customers', data),
    update: (id, data) => api.put(`/customers/${id}`, data),
    delete: (id) => api.delete(`/customers/${id}`),
};

export const submissionAPI = {
    getAll: (params) => api.get('/submissions', { params }),
    getById: (id) => api.get(`/submissions/${id}`),
    create: (data) => api.post('/submissions', data),
    update: (id, data) => api.put(`/submissions/${id}`, data),
    delete: (id) => api.delete(`/submissions/${id}`),
};

export const itemAPI = {
    getAll: (params) => api.get('/items', { params }),
    create: (data) => api.post('/items', data),
    update: (id, data) => api.put(`/items/${id}`, data),
    delete: (id) => api.delete(`/items/${id}`),
};

export const docketAPI = {
    getAll: (params) => api.get('/dockets', { params }),
    getById: (id) => api.get(`/dockets/${id}`),
    create: (data) => api.post('/dockets', data),
    generate: (data) => api.post('/dockets/generate', data),
    preview: (data) => api.post('/dockets/preview', data),
    update: (id, data) => api.put(`/dockets/${id}`, data),
    delete: (id) => api.delete(`/dockets/${id}`),
    getStats: () => api.get('/dockets/stats'),
};

export const jobFormAPI = {
    getAll: (params) => api.get('/job-forms', { params }),
    getById: (id) => api.get(`/job-forms/${id}`),
    create: (data) => api.post('/job-forms', data),
    update: (id, data) => api.put(`/job-forms/${id}`, data),
    delete: (id) => api.delete(`/job-forms/${id}`),
};

export const formTemplateAPI = {
    getAll: (params) => api.get('/form-templates', { params }),
    getById: (id) => api.get(`/form-templates/${id}`),
    create: (data) => api.post('/form-templates', data),
    update: (id, data) => api.put(`/form-templates/${id}`, data),
    delete: (id) => api.delete(`/form-templates/${id}`),
    clone: (id) => api.post(`/form-templates/${id}/clone`),
};

export const dynamicSubmissionAPI = {
    getAll: (params) => api.get('/dynamic-submissions', { params }),
    getById: (id) => api.get(`/dynamic-submissions/${id}`),
    getByTemplate: (templateId) => api.get(`/dynamic-submissions/template/${templateId}`),
    create: (data) => api.post('/dynamic-submissions', data),
    update: (id, data) => api.put(`/dynamic-submissions/${id}`, data),
    delete: (id) => api.delete(`/dynamic-submissions/${id}`),
};

export const userAPI = {
    getAll: (params) => api.get('/users', { params }),
    create: (data) => api.post('/users', data),
    update: (id, data) => api.put(`/users/${id}`, data),
    delete: (id) => api.delete(`/users/${id}`),
    updateStatus: (id, status) => api.patch(`/users/${id}/status`, { status }),
};

export const timesheetAPI = {
    getAll: (params) => api.get('/timesheets', { params }),
    getById: (id) => api.get(`/timesheets/${id}`),
    create: (data) => api.post('/timesheets', data),
    update: (id, data) => api.put(`/timesheets/${id}`, data),
    approve: (id, data) => api.patch(`/timesheets/${id}/approve`, data),
    delete: (id) => api.delete(`/timesheets/${id}`),
    getStats: () => api.get('/timesheets/stats'),
};

export const settingsAPI = {
    getAll: () => api.get('/settings'),
    update: (data) => api.put('/settings', data),
};

export default api;
