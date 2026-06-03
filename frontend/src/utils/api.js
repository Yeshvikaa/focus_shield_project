import axios from 'axios';

// Create instance pointing to backend server
const api = axios.create({
  baseURL: 'https://focus-shield-project.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle session expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      const publicRoutes = ['/', '/login', '/signup'];

      if (!publicRoutes.includes(window.location.pathname)) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
