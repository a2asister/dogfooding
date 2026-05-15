import axios from 'axios';
import {
  User,
  DesktopConfig,
  FileItem,
  WindowState,
  AppData,
  SortField,
  SortOrder,
  BatchOperationResult,
  ThemeConfig,
  DisplayConfig,
  DateTimeConfig,
  PersonalizationConfig,
  Notification,
  SearchResult,
  SearchCategory,
} from '../types';

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
  saveTheme: (theme: ThemeConfig) => api.put('/desktop/theme', theme),
  saveWallpaper: (wallpaper: string) => api.put('/desktop/wallpaper', { wallpaper }),
  saveTaskbarConfig: (taskbarConfig: DesktopConfig['taskbarConfig']) =>
    api.put('/desktop/taskbar', taskbarConfig),
  saveDisplayConfig: (display: DisplayConfig) => api.put('/desktop/display', display),
  saveDateTimeConfig: (dateTime: DateTimeConfig) => api.put('/desktop/datetime', dateTime),
  savePersonalizationConfig: (personalization: PersonalizationConfig) =>
    api.put('/desktop/personalization', personalization),
  repairConfig: () => api.post('/desktop/repair'),
  getIcons: () => api.get('/desktop/icons'),
};

export const notificationsApi = {
  getAll: (limit?: number, offset?: number) =>
    api.get<{ notifications: Notification[]; total: number }>('/notifications', { params: { limit, offset } }),
  getUnreadCount: () => api.get<{ count: number }>('/notifications/unread/count'),
  create: (data: { title: string; message: string; type?: string; category?: string }) =>
    api.post<Notification>('/notifications', data),
  markAsRead: (id: number) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read/all'),
  delete: (id: number) => api.delete(`/notifications/${id}`),
  clearAll: () => api.delete('/notifications/clear/all'),
  batchDelete: (ids: number[]) => api.post('/notifications/batch/delete', { ids }),
  repair: () => api.post('/notifications/repair'),
};

export const searchApi = {
  search: (query: string, category?: SearchCategory, limit?: number, exact?: boolean) =>
    api.get<{ results: SearchResult[]; total: number }>('/search', {
      params: { q: query, category, limit, exact: exact ? 'true' : 'false' },
    }),
  getRecent: () => api.get<{ searches: string[] }>('/search/recent'),
  repair: () => api.post('/search/repair'),
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