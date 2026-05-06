import axios from 'axios';

// Base URL of our backend
const API_BASE_URL = 'http://localhost:5000/api';

// Create an axios instance with the base URL
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically attach the JWT to every request if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses globally — auto-logout if token expires
api.interceptors.response.use((response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  signup: (userData) => api.post('/auth/signup', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
};

// Labs API calls
export const labsAPI = {
  getAll: (params) => api.get('/labs', { params }),
  getById: (id) => api.get(`/labs/${id}`),
  create: (labData) => api.post('/labs', labData),
  update: (id, labData) => api.put(`/labs/${id}`, labData),
  delete: (id) => api.delete(`/labs/${id}`),
};

export default api;