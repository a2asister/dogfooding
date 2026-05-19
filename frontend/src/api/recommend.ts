import request from './request';
import type { RecommendResult } from '@/types';

export const getPersonalizedFeed = (params?: { page?: number; pageSize?: number }) => {
  return request.get<RecommendResult>('/recommend/personalized', { params });
};

export const getHotFeed = (params?: { page?: number; pageSize?: number }) => {
  return request.get<RecommendResult>('/recommend/hot', { params });
};

export const updateRecommendInteraction = (recommendId: string, interaction: string) => {
  return request.put<{ message: string }>(`/recommend/${recommendId}/interaction`, { interaction });
};

export const getRecommendStats = () => {
  return request.get<{
    totalRecommended: number;
    totalClicked: number;
    totalLiked: number;
    totalCollected: number;
    clickRate: number;
  }>('/recommend/stats');
};
