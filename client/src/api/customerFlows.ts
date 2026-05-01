import api from './axios';
import { CustomerFlow, ApiResponse } from '@/types';

export const customerFlowApi = {
  getAll: async (storeId?: string): Promise<ApiResponse<CustomerFlow[]>> => {
    const params = storeId ? { storeId } : {};
    const response = await api.get('/api/customer-flows', { params });
    return response.data;
  },

  create: async (flow: Omit<CustomerFlow, 'id' | 'timestamp'>): Promise<ApiResponse<CustomerFlow>> => {
    const response = await api.post('/api/customer-flows', flow);
    return response.data;
  }
};
