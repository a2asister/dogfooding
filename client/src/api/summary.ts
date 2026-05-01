import api from './axios';
import { SummaryData, ApiResponse } from '@/types';

export const summaryApi = {
  getSummary: async (): Promise<ApiResponse<SummaryData>> => {
    const response = await api.get('/api/summary');
    return response.data;
  }
};
