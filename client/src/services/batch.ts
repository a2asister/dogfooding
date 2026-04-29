import axios from '@/utils/axios';
import type { ApiResponse, PaginatedResponse, ElectiveBatch } from '@/types';

export interface BatchQueryParams {
  status?: string;
  page?: number;
  pageSize?: number;
}

export interface CreateBatchParams {
  name: string;
  academicYear: string;
  semester: string;
  startDate: Date | string;
  endDate: Date | string;
  gradeIds: string[];
  maxCredits: number;
  minCredits: number;
  description?: string;
}

export const batchApi = {
  getBatches: async (params?: BatchQueryParams): Promise<ApiResponse<PaginatedResponse<ElectiveBatch>>> => {
    const response = await axios.get('/batches', { params });
    return response.data;
  },

  getActiveBatches: async (): Promise<ApiResponse<ElectiveBatch[]>> => {
    const response = await axios.get('/batches/active');
    return response.data;
  },

  getBatchById: async (id: string): Promise<ApiResponse<ElectiveBatch>> => {
    const response = await axios.get(`/batches/${id}`);
    return response.data;
  },

  createBatch: async (data: CreateBatchParams): Promise<ApiResponse<ElectiveBatch>> => {
    const response = await axios.post('/batches', data);
    return response.data;
  },

  startBatch: async (id: string): Promise<ApiResponse> => {
    const response = await axios.post(`/batches/${id}/start`);
    return response.data;
  },

  endBatch: async (id: string): Promise<ApiResponse> => {
    const response = await axios.post(`/batches/${id}/end`);
    return response.data;
  },
};
