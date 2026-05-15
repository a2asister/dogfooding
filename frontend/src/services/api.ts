import axios from 'axios';
import { User, DesktopConfig, FileItem } from '../types';

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

export const authApi = {
  register: (username: string, password: string) =>
    api.post<{ access_token: string; user: User }>('/auth/register', { username, password }),
  login: (username: string, password: string) =>
    api.post<{ access_token: string; user: User }>('/auth/login', { username, password }),
  getProfile: () => api.get<User>('/auth/profile'),
};

export const desktopApi = {
  getConfig: () => api.get<DesktopConfig>('/desktop/init'),
  saveLayout: (layout: DesktopConfig['layout']) =>
    api.post('/desktop/layout', { layout }),
  getIcons: () => api.get('/desktop/icons'),
};

export const filesApi = {
  getFiles: (parentId?: number) =>
    api.get<FileItem[]>('/files', { params: { parentId } }),
  getFile: (id: number) => api.get<FileItem>(`/files/${id}`),
  createFile: (data: { name: string; type: 'folder' | 'file'; content?: string; parentId?: number }) =>
    api.post<FileItem>('/files', data),
  updateFile: (id: number, data: { name?: string; content?: string }) =>
    api.put<FileItem>(`/files/${id}`, data),
  deleteFile: (id: number) => api.delete(`/files/${id}`),
};

export default api;