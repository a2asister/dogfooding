import axios from 'axios';
import useAuthStore from '../store/authStore';

const API_BASE_URL = 'http://localhost:7100/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (username, password) => 
    api.post('/auth/login', { username, password }),
  
  logout: () => 
    api.post('/auth/logout'),
  
  getCurrentUser: () => 
    api.get('/auth/me'),
  
  validateToken: () => 
    api.post('/auth/validate'),
};

export const userAPI = {
  getUsers: () => 
    api.get('/users'),
  
  getUser: (id) => 
    api.get(`/users/${id}`),
  
  createUser: (userData) => 
    api.post('/users', userData),
  
  updateUser: (id, userData) => 
    api.put(`/users/${id}`, userData),
  
  deleteUser: (id) => 
    api.delete(`/users/${id}`),
};

export const subsystemAPI = {
  getSubsystems: () => 
    api.get('/subsystems'),
  
  getAllSubsystems: () => 
    api.get('/subsystems/all'),
  
  getSubsystem: (id) => 
    api.get(`/subsystems/${id}`),
};

export default api;
