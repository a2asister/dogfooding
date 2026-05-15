import axios from 'axios';
import { Announcement } from './types';

const api = axios.create({
  baseURL: '/api',
});

export const announcementApi = {
  getAll: (userId?: string) =>
    api.get<Announcement[]>('/announcements', { params: { userId } }),

  getAllAdmin: () => api.get<Announcement[]>('/announcements/admin'),

  getById: (id: number, userId?: string) =>
    api.get<Announcement>(`/announcements/${id}`, { params: { userId } }),

  create: (data: Partial<Announcement>) =>
    api.post<Announcement>('/announcements', data),

  update: (id: number, data: Partial<Announcement>) =>
    api.patch<Announcement>(`/announcements/${id}`, data),

  delete: (id: number) => api.delete(`/announcements/${id}`),

  batchDelete: (ids: number[]) =>
    api.delete('/announcements/batch', { data: { ids } }),

  batchUpdate: (data: { ids: number[]; status?: string; isPinned?: boolean }) =>
    api.post('/announcements/batch', data),

  markAsRead: (id: number, userId: string) =>
    api.post(`/announcements/${id}/read`, { userId }),
};
