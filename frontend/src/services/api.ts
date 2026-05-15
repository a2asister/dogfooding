import axios from 'axios';
import { User, DesktopConfig, FileItem, WindowState, AppData, SortField, SortOrder, BatchOperationResult } from '../types';

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
  getFiles: (parentId?: number, sortField?: SortField, sortOrder?: SortOrder) =>
    api.get<FileItem[]>('/files', { params: { parentId, sortField, sortOrder } }),
  getFile: (id: number) => api.get<FileItem>(`/files/${id}`),
  getFilePath: (id: number) => api.get<string>(`/files/${id}/path`),
  getFileByPath: (path: string) => api.get<FileItem>('/files/path', { params: { path } }),
  createFile: (data: { name: string; type: 'folder' | 'file'; content?: string; parentId?: number; mimeType?: string }) =>
    api.post<FileItem>('/files', data),
  updateFile: (id: number, data: { name?: string; content?: string; parentId?: number }) =>
    api.put<FileItem>(`/files/${id}`, data),
  moveFile: (id: number, targetParentId?: number) =>
    api.put<FileItem>(`/files/${id}/move`, { targetParentId }),
  copyFile: (id: number, targetParentId?: number) =>
    api.put<FileItem>(`/files/${id}/copy`, { targetParentId }),
  moveToTrash: (id: number) => api.put(`/files/${id}/trash`),
  restoreFromTrash: (id: number, targetParentId?: number) =>
    api.put<FileItem>(`/files/${id}/restore`, { targetParentId }),
  permanentlyDelete: (id: number) => api.delete(`/files/${id}`),
  deleteFile: (id: number) => api.put(`/files/${id}/trash`),
  getTrash: () => api.get<FileItem[]>('/files/trash'),
  emptyTrash: () => api.delete('/files/trash/empty'),
  batchOperation: (data: { fileIds: number[]; operation: 'delete' | 'move' | 'copy' | 'restore'; targetParentId?: number }) =>
    api.post<BatchOperationResult>('/files/batch', data),
  sortFiles: (parentId: number | null, field: SortField, order: SortOrder) =>
    api.post<FileItem[]>('/files/sort', { field, order }, { params: { parentId } }),
};

export const windowStateApi = {
  getAllWindows: () => api.get<WindowState[]>('/windows'),
  getWindow: (windowId: string) => api.get<WindowState>(`/windows/${windowId}`),
  createWindow: (data: Omit<WindowState, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) =>
    api.post<WindowState>('/windows', data),
  updateWindow: (windowId: string, data: Partial<WindowState>) =>
    api.put<WindowState>(`/windows/${windowId}`, data),
  closeWindow: (windowId: string) => api.delete(`/windows/${windowId}`),
  closeAllWindows: () => api.delete('/windows'),
  bringToFront: (windowId: string) => api.put<WindowState>(`/windows/${windowId}/front`),
  minimizeWindow: (windowId: string) => api.put<WindowState>(`/windows/${windowId}/minimize`),
  maximizeWindow: (windowId: string) => api.put<WindowState>(`/windows/${windowId}/maximize`),
};

export const appDataApi = {
  getAllByType: (type: 'notepad' | 'calculator' | 'browser') =>
    api.get<AppData[]>('/app-data', { params: { type } }),
  getLatestByType: (type: 'notepad' | 'calculator' | 'browser') =>
    api.get<AppData>('/app-data/latest', { params: { type } }),
  getById: (id: number) => api.get<AppData>(`/app-data/${id}`),
  create: (data: { appType: 'notepad' | 'calculator' | 'browser'; content?: string; metadata?: any; title?: string }) =>
    api.post<AppData>('/app-data', data),
  update: (id: number, data: { content?: string; metadata?: any; title?: string }) =>
    api.put<AppData>(`/app-data/${id}`, data),
  delete: (id: number) => api.delete(`/app-data/${id}`),
  deleteAllByType: (type: 'notepad' | 'calculator' | 'browser') =>
    api.delete('/app-data', { params: { type } }),
};

export default api;