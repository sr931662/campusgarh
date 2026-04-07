import axios from 'axios';
import { API_BASE_URL, STORAGE_KEYS } from '../utils/constants';
import { isTokenExpired, removeToken } from '../utils/tokenUtils';
import useAuthStore from '../store/authStore';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // for cookies if needed
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (token && !isTokenExpired(token)) {
      config.headers.Authorization = `Bearer ${token}`;
    } else if (token && isTokenExpired(token)) {
      // Token expired, remove and logout
      removeToken();
      useAuthStore.getState().logout();
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401
api.interceptors.response.use(
  (response) => response,
    (error) => {
    if (error.response?.status === 401) {
      const wasAuthenticated = useAuthStore.getState().isAuthenticated;
      removeToken();
      useAuthStore.getState().logout();
      if (wasAuthenticated) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }

);

export default api;