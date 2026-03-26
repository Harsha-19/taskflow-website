import axios from 'axios';
import { toast } from 'react-hot-toast';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
const TOKEN_KEY = 'taskflow_token';

const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong';
    
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    if (error.response?.status === 429) {
      toast.error('Too many requests. Please try again later.');
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Our team is notified.');
    }

    return Promise.reject({
      message,
      status: error.response?.status,
      data: error.response?.data?.data,
    });
  }
);

/**
 * API Service Layer
 */
const api = {
  // Auth
  auth: {
    login: (credentials) => apiClient.post('/auth/login', credentials),
    register: (userData) => apiClient.post('/auth/register', userData),
    me: () => apiClient.get('/auth/me'),
  },

  // Projects
  projects: {
    list: () => apiClient.get('/projects/'),
    create: (data) => apiClient.post('/projects/', data),
    update: (id, data) => apiClient.put(`/projects/${id}`, data),
    delete: (id) => apiClient.delete(`/projects/${id}`),
  },

  // Tasks
  tasks: {
    list: (projectId) => apiClient.get(`/tasks/project/${projectId}`),
    create: (data) => apiClient.post('/tasks/', data),
    update: (id, data) => apiClient.put(`/tasks/${id}`, data),
    delete: (id) => apiClient.delete(`/tasks/${id}`),
  },

  // Stats & Dashboard
  dashboard: {
    getOverview: () => apiClient.get('/dashboard/'),
    getStats: () => apiClient.get('/stats/'),
  },

  // Plans & Subscriptions
  subscriptions: {
    listPlans: () => apiClient.get('/plans/'),
    getCurrent: () => apiClient.get('/subscriptions/me'),
    subscribe: (planId) => apiClient.post('/subscriptions/', { plan_id: planId }),
  },
};

export default api;