import request from './request';
import type { CreatorReport } from '@/types';

export const getCreatorReportList = (params: {
  page?: number;
  pageSize?: number;
  type?: 'daily' | 'weekly';
  startDate?: string;
  endDate?: string;
}) => {
  return request.get<{ list: CreatorReport[]; total: number; page: number; pageSize: number }>('/creator-reports', { params });
};

export const getCreatorReportDetail = (id: string) => {
  return request.get<{ report: CreatorReport }>(`/creator-reports/${id}`);
};

export const getLatestReport = (type?: 'daily' | 'weekly') => {
  return request.get<{ report: CreatorReport | null }>('/creator-reports/latest', { params: { type } });
};

export const generateReport = (type: 'daily' | 'weekly') => {
  return request.post<{ report: CreatorReport }>('/creator-reports/generate', { type });
};

export const getReportSummary = () => {
  return request.get<{
    totalReports: number;
    lastReportDate?: string;
    avgEngagementRate: number;
    totalEarnings: number;
    totalViews: number;
    totalFollowers: number;
  }>('/creator-reports/summary');
};

export const exportReport = (id: string, format: 'pdf' | 'excel') => {
  return request.get(`/creator-reports/${id}/export`, { params: { format }, responseType: 'blob' });
};
