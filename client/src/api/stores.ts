import api from './axios';
import { Store, ApiResponse } from '@/types';

export const storeApi = {
  getAll: async (): Promise<ApiResponse<Store[]>> => {
    const response = await api.get('/api/stores');
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<Store>> => {
    const response = await api.get(`/api/stores/${id}`);
    return response.data;
  },

  create: async (store: Omit<Store, 'id' | 'createdAt'>): Promise<ApiResponse<Store>> => {
    const response = await api.post('/api/stores', store);
    return response.data;
  },

  update: async (id: string, updates: Partial<Store>): Promise<ApiResponse<Store>> => {
    const response = await api.put(`/api/stores/${id}`, updates);
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/api/stores/${id}`);
    return response.data;
  }
};
