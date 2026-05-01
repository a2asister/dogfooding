import api from './axios';
import { Inventory, ApiResponse } from '@/types';

export const inventoryApi = {
  getAll: async (storeId?: string): Promise<ApiResponse<Inventory[]>> => {
    const params = storeId ? { storeId } : {};
    const response = await api.get('/api/inventories', { params });
    return response.data;
  },

  create: async (inventory: Omit<Inventory, 'id' | 'updatedAt'>): Promise<ApiResponse<Inventory>> => {
    const response = await api.post('/api/inventories', inventory);
    return response.data;
  },

  update: async (id: string, updates: Partial<Inventory>): Promise<ApiResponse<Inventory>> => {
    const response = await api.put(`/api/inventories/${id}`, updates);
    return response.data;
  }
};
