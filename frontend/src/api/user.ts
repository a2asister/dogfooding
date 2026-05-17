import request from './request';
import type { User } from '@/types';

export const getUserProfile = (id: string) => {
  return request.get<{ user: User }>(`/users/${id}`);
};

export const followUser = (id: string) => {
  return request.post<{ following: boolean }>(`/users/${id}/follow`);
};

export const updateProfile = (data: { nickname?: string; bio?: string; avatar?: string }) => {
  return request.put<{ user: User }>('/users/profile', data);
};
