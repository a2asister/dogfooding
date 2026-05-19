import request from './request';
import type { DailySiteStats, AnalyticsOverview } from '@/types';

export const getAnalyticsOverview = () => {
  return request.get<{ overview: AnalyticsOverview }>('/analytics/overview');
};

export const getDailyStats = (params: {
  startDate: string;
  endDate: string;
}) => {
  return request.get<{ stats: DailySiteStats[] }>('/analytics/daily', { params });
};

export const getTrafficSources = (params: {
  startDate: string;
  endDate: string;
}) => {
  return request.get<{ sources: Array<{ source: string; count: number; percentage: number }> }>('/analytics/traffic-sources', { params });
};

export const getRetentionStats = (params: {
  startDate: string;
  endDate: string;
}) => {
  return request.get<{
    day1: number;
    day7: number;
    day30: number;
    trend: Array<{ date: string; day1: number; day7: number; day30: number }>;
  }>('/analytics/retention', { params });
};

export const getEngagementStats = (params: {
  startDate: string;
  endDate: string;
}) => {
  return request.get<{
    avgEngagementRate: number;
    totalInteractions: number;
    interactionTrend: Array<{ date: string; count: number; rate: number }>;
  }>('/analytics/engagement', { params });
};

export const getContentPerformance = (params: {
  page?: number;
  pageSize?: number;
  startDate?: string;
  endDate?: string;
  sortBy?: 'views' | 'likes' | 'comments' | 'engagement';
}) => {
  return request.get<{
    list: Array<{
      noteId: string;
      title: string;
      views: number;
      likes: number;
      comments: number;
      favorites: number;
      engagementRate: number;
      hotScore: number;
    }>;
    total: number;
  }>('/analytics/content', { params });
};
