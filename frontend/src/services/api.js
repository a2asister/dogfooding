import axios from 'axios';
import useAuthStore from '../stores/authStore';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const { token } = useAuthStore.getState();
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
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getCurrentUser: () => api.get('/auth/me'),
};

export const siteApi = {
  getAll: () => api.get('/sites'),
  getById: (siteId) => api.get(`/sites/${siteId}`),
  create: (siteData) => api.post('/sites', siteData),
  update: (siteId, siteData) => api.put(`/sites/${siteId}`, siteData),
  delete: (siteId) => api.delete(`/sites/${siteId}`),
};

export const modelApi = {
  getAll: (siteId) => api.get(`/models/${siteId}`),
  getById: (siteId, modelId) => api.get(`/models/${siteId}/${modelId}`),
  create: (siteId, modelData) => api.post(`/models/${siteId}`, modelData),
  update: (siteId, modelId, modelData) => api.put(`/models/${siteId}/${modelId}`, modelData),
  delete: (siteId, modelId) => api.delete(`/models/${siteId}/${modelId}`),
};

export const contentApi = {
  getAll: (siteId, params) => api.get(`/content/${siteId}`, { params }),
  getById: (siteId, contentId) => api.get(`/content/${siteId}/${contentId}`),
  create: (siteId, contentData) => api.post(`/content/${siteId}`, contentData),
  update: (siteId, contentId, contentData) => api.put(`/content/${siteId}/${contentId}`, contentData),
  delete: (siteId, contentId) => api.delete(`/content/${siteId}/${contentId}`),
  publish: (siteId, contentId) => api.post(`/content/${siteId}/${contentId}/publish`),
};

export const routeApi = {
  getAll: (siteId) => api.get(`/routes/${siteId}`),
  getById: (siteId, routeId) => api.get(`/routes/${siteId}/${routeId}`),
  create: (siteId, routeData) => api.post(`/routes/${siteId}`, routeData),
  update: (siteId, routeId, routeData) => api.put(`/routes/${siteId}/${routeId}`, routeData),
  delete: (siteId, routeId) => api.delete(`/routes/${siteId}/${routeId}`),
};

export const publishApi = {
  getLogs: (siteId, params) => api.get(`/publish/${siteId}/logs`, { params }),
  publish: (siteId, publishData) => api.post(`/publish/${siteId}/publish`, publishData),
  getSchedule: (siteId) => api.get(`/publish/${siteId}/schedule`),
  setSchedule: (siteId, scheduleData) => api.post(`/publish/${siteId}/schedule`, scheduleData),
};

export const cdnApi = {
  getConfig: (siteId) => api.get(`/cdn/${siteId}/config`),
  updateConfig: (siteId, configData) => api.put(`/cdn/${siteId}/config`, configData),
  getAssets: (siteId, params) => api.get(`/cdn/${siteId}/assets`, { params }),
  syncAssets: (siteId, assetIds) => api.post(`/cdn/${siteId}/assets/sync`, { assetIds }),
  getProviders: (siteId) => api.get(`/cdn/${siteId}/providers`),
};

export default api;
