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

// Auth API calls
export const authAPI = {
  signup: (userData) => api.post('/auth/signup', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: (token) =>
    api.get('/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    }),
};

export default api;