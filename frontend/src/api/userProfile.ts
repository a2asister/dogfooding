import request from './request';
import type { UserProfile, UserTag, UserTagRelation } from '@/types';

export const getUserProfile = () => {
  return request.get<UserProfile>('/user-profile/profile');
};

export const getUserTags = () => {
  return request.get<{ tags: UserTagRelation[] }>('/user-profile/tags');
};

export const generateUserTags = () => {
  return request.post<{ message: string; tags: UserTagRelation[] }>('/user-profile/tags/generate');
};

export const recordUserBehavior = (data: {
  behaviorType: string;
  targetType: string;
  targetId: string;
  noteId?: string;
  metadata?: Record<string, any>;
}) => {
  return request.post<{ message: string }>('/user-profile/behavior', data);
};

export const getAllTags = () => {
  return request.get<{ tags: UserTag[] }>('/user-profile/tags/all');
};
