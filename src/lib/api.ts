import axios from 'axios';

// Use environment variable for API URL, fallback to localhost for development
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const errorMessage = error.response?.data?.message || '';
      const isSessionExpired = errorMessage.includes('Session expired') || 
                               errorMessage.includes('logged in from another device');
      
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      if (isSessionExpired) {
        // Store a flag to show session expired message on login page
        sessionStorage.setItem('sessionExpired', 'true');
      }
      
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
