import request from './request';
import type { Note } from '@/types';

export const getHotFeed = (params: {
  page?: number;
  pageSize?: number;
}) => {
  return request.get<{ list: Note[]; total: number; page: number; pageSize: number }>('/feed/hot', { params });
};

export const getNearbyFeed = (params: {
  page?: number;
  pageSize?: number;
  city?: string;
  lat?: number;
  lng?: number;
  radius?: number;
}) => {
  return request.get<{ list: Note[]; total: number; page: number; pageSize: number }>('/feed/nearby', { params });
};

export const dislikeNote = (id: string, data?: { reason?: string }) => {
  return request.post<{ disliked: boolean }>(`/feed/dislike/${id}`, data);
};

export const blockUser = (userId: string) => {
  return request.post<{ blocked: boolean }>('/feed/block/user', { userId });
};

export const blockTopic = (topicId: string) => {
  return request.post<{ blocked: boolean }>('/feed/block/topic', { topicId });
};

export const getBlockList = (params?: { type?: 'user' | 'topic' }) => {
  return request.get<{ users: any[]; topics: any[] }>('/feed/blocks', { params });
};
