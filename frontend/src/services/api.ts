import axios from 'axios';
import { DataSeries, CreateSeriesRequest, TrendLine } from '../types';

const API_BASE_URL = 'http://localhost:3002/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const dataSeriesApi = {
  getAll: async (): Promise<DataSeries[]> => {
    const response = await api.get('/series');
    return response.data.data;
  },

  getById: async (id: string): Promise<DataSeries> => {
    const response = await api.get(`/series/${id}`);
    return response.data.data;
  },

  getTrendAnalysis: async (id: string): Promise<TrendLine> => {
    const response = await api.get(`/series/${id}/trend`);
    return response.data.data;
  },

  create: async (data: CreateSeriesRequest): Promise<DataSeries> => {
    const response = await api.post('/series', data);
    return response.data.data;
  },

  recalculate: async (id: string, data: Partial<CreateSeriesRequest>): Promise<DataSeries> => {
    const response = await api.put(`/series/${id}/recalculate`, data);
    return response.data.data;
  },

  compare: async (ids: string[]): Promise<{ series: DataSeries[]; trendLines: TrendLine[] }> => {
    const response = await api.post('/series/compare', { ids });
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/series/${id}`);
  },

  exportExcel: async (id: string): Promise<void> => {
    const response = await api.get(`/series/${id}/export/excel`, {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.download = `report-${id}.xlsx`;
    link.click();
  },

  exportPDF: async (id: string): Promise<void> => {
    const response = await api.get(`/series/${id}/export/pdf`, {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.download = `report-${id}.pdf`;
    link.click();
  },
};
