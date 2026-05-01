import axios from 'axios';
import { User, Document, SearchResult, LoginResponse } from '@/types';

const api = axios.create({
  baseURL: '/api',
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
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },

  register: async (username: string, password: string, role?: string): Promise<User> => {
    const response = await api.post('/auth/register', { username, password, role });
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  getAllUsers: async (): Promise<User[]> => {
    const response = await api.get('/auth/users');
    return response.data;
  },
};

export const documentApi = {
  getAll: async (): Promise<Document[]> => {
    const response = await api.get('/documents');
    return response.data;
  },

  getById: async (id: string): Promise<Document> => {
    const response = await api.get(`/documents/${id}`);
    return response.data;
  },

  create: async (data: { title: string; content: string; type?: string }): Promise<Document> => {
    const response = await api.post('/documents', data);
    return response.data;
  },

  upload: async (file: File, title?: string): Promise<Document> => {
    const formData = new FormData();
    formData.append('file', file);
    if (title) {
      formData.append('title', title);
    }
    const response = await api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  search: async (query: string): Promise<SearchResult[]> => {
    const response = await api.get(`/documents/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },

  getRelated: async (id: string): Promise<Document[]> => {
    const response = await api.get(`/documents/${id}/related`);
    return response.data;
  },

  update: async (id: string, data: Partial<Document>): Promise<Document> => {
    const response = await api.put(`/documents/${id}`, data);
    return response.data;
  },

  updateLifecycle: async (id: string, status: Document['lifecycle']['status']): Promise<Document> => {
    const response = await api.put(`/documents/${id}/lifecycle`, { status });
    return response.data;
  },

  updatePermissions: async (
    id: string,
    readPermissions: string[],
    writePermissions: string[]
  ): Promise<Document> => {
    const response = await api.put(`/documents/${id}/permissions`, {
      readPermissions,
      writePermissions,
    });
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/documents/${id}`);
  },
};

export default api;
