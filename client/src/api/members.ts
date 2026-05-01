import api from './axios';
import { Member, ApiResponse } from '@/types';

export const memberApi = {
  getAll: async (storeId?: string): Promise<ApiResponse<Member[]>> => {
    const params = storeId ? { storeId } : {};
    const response = await api.get('/api/members', { params });
    return response.data;
  },

  create: async (member: Omit<Member, 'id' | 'createdAt' | 'points' | 'totalSpent'>): Promise<ApiResponse<Member>> => {
    const response = await api.post('/api/members', member);
    return response.data;
  },

  update: async (id: string, updates: Partial<Member>): Promise<ApiResponse<Member>> => {
    const response = await api.put(`/api/members/${id}`, updates);
    return response.data;
  }
};
