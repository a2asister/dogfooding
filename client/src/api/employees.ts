import api from './axios';
import { Employee, ApiResponse } from '@/types';

export const employeeApi = {
  getAll: async (storeId?: string): Promise<ApiResponse<Employee[]>> => {
    const params = storeId ? { storeId } : {};
    const response = await api.get('/api/employees', { params });
    return response.data;
  },

  create: async (employee: Omit<Employee, 'id' | 'createdAt'>): Promise<ApiResponse<Employee>> => {
    const response = await api.post('/api/employees', employee);
    return response.data;
  },

  update: async (id: string, updates: Partial<Employee>): Promise<ApiResponse<Employee>> => {
    const response = await api.put(`/api/employees/${id}`, updates);
    return response.data;
  }
};
