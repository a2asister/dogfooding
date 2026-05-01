import api from './axios';
import { Promotion, ApiResponse } from '@/types';

export const promotionApi = {
  getAll: async (storeId?: string): Promise<ApiResponse<Promotion[]>> => {
    const params = storeId ? { storeId } : {};
    const response = await api.get('/api/promotions', { params });
    return response.data;
  },

  create: async (promotion: Omit<Promotion, 'id'>): Promise<ApiResponse<Promotion>> => {
    const response = await api.post('/api/promotions', promotion);
    return response.data;
  },

  update: async (id: string, updates: Partial<Promotion>): Promise<ApiResponse<Promotion>> => {
    const response = await api.put(`/api/promotions/${id}`, updates);
    return response.data;
  }
};
