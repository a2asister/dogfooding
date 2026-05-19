import request from './request';
import type { Promotion } from '@/types';

export const createPromotion = (data: {
  noteId: string;
  planType: 'views_boost' | 'likes_boost' | 'followers_boost' | 'hot_promotion';
  budget: number;
  durationHours: number;
}) => {
  return request.post<{ promotion: Promotion }>('/promotions', data);
};

export const getPromotionList = (params: {
  page?: number;
  pageSize?: number;
  status?: string;
}) => {
  return request.get<{ list: Promotion[]; total: number; page: number; pageSize: number }>('/promotions', { params });
};

export const getPromotionDetail = (id: string) => {
  return request.get<{ promotion: Promotion }>(`/promotions/${id}`);
};

export const pausePromotion = (id: string) => {
  return request.post<{ promotion: Promotion }>(`/promotions/${id}/pause`);
};

export const resumePromotion = (id: string) => {
  return request.post<{ promotion: Promotion }>(`/promotions/${id}/resume`);
};

export const cancelPromotion = (id: string) => {
  return request.post<{ promotion: Promotion }>(`/promotions/${id}/cancel`);
};

export const getPromotionPlans = () => {
  return request.get<{ plans: Array<{ type: string; name: string; description: string; price: number; features: string[] }> }>('/promotions/plans');
};
