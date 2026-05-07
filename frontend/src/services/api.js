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

// Bookings API calls
export const bookingsAPI = {
  // Get available slots for a lab on a specific date
  getSlots: (labId, date) =>
    api.get(`/labs/${labId}/slots`, { params: { date } }),

  // Create a booking request
  create: (bookingData) => api.post('/bookings', bookingData),

  // Get current user's bookings
  getMine: () => api.get('/bookings/me'),

  // Get bookings for a specific lab (staff/admin)
  getForLab: (labId, status) =>
    api.get(`/bookings/lab/${labId}`, { params: status ? { status } : {} }),

  // Approve a booking
  approve: (id) => api.patch(`/bookings/${id}/approve`),

  // Reject a booking with optional reason
  reject: (id, reason) => api.patch(`/bookings/${id}/reject`, { reason }),

  // Cancel a booking (own or admin)
  cancel: (id) => api.patch(`/bookings/${id}/cancel`),

  // Admin stats
  getStats: () => api.get('/bookings/stats'),
};

export default api;