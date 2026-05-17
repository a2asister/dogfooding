import request from './request';
import type { Note, User } from '@/types';

export const getPendingNotes = (params: { page?: number; pageSize?: number }) => {
  return request.get<{ list: Note[]; total: number; page: number; pageSize: number }>('/admin/notes/pending', { params });
};

export const approveNote = (id: string) => {
  return request.post(`/admin/notes/${id}/approve`);
};

export const rejectNote = (id: string, reason: string) => {
  return request.post(`/admin/notes/${id}/reject`, { reason });
};

export const takeDownNote = (id: string, reason: string) => {
  return request.post(`/admin/notes/${id}/take-down`, { reason });
};

export const getUserList = (params: { page?: number; pageSize?: number; keyword?: string }) => {
  return request.get<{ list: User[]; total: number; page: number; pageSize: number }>('/admin/users', { params });
};

export const toggleUserStatus = (id: string) => {
  return request.post<{ isActive: boolean }>(`/admin/users/${id}/toggle-status`);
};

export const getSystemConfigs = () => {
  return request.get<{ configs: Record<string, string> }>('/admin/configs');
};

export const updateSystemConfig = (data: { key: string; value: string; description?: string }) => {
  return request.put('/admin/configs', data);
};
