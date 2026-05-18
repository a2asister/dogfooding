import request from './request';
import type { Report } from '@/types';

export const createReport = (data: {
  type: 'note' | 'comment' | 'user';
  targetId: string;
  reason: string;
  description?: string;
  images?: string[];
}) => {
  return request.post<{ report: Report }>('/reports', data);
};

export const getMyReports = (params?: {
  page?: number;
  pageSize?: number;
}) => {
  return request.get<{ list: Report[]; total: number; page: number; pageSize: number }>(
    '/reports/my',
    { params }
  );
};
