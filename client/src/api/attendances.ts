import api from './axios';
import { Attendance, ApiResponse } from '@/types';

export const attendanceApi = {
  getAll: async (storeId?: string): Promise<ApiResponse<Attendance[]>> => {
    const params = storeId ? { storeId } : {};
    const response = await api.get('/api/attendances', { params });
    return response.data;
  },

  create: async (attendance: Omit<Attendance, 'id'>): Promise<ApiResponse<Attendance>> => {
    const response = await api.post('/api/attendances', attendance);
    return response.data;
  },

  update: async (id: string, updates: Partial<Attendance>): Promise<ApiResponse<Attendance>> => {
    const response = await api.put(`/api/attendances/${id}`, updates);
    return response.data;
  }
};
