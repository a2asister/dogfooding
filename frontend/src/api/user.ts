import request from './request';
import type { User, UserExtended, PrivacySettings, NotificationSettings, BlacklistItem } from '@/types';

export const getUserProfile = (id: string) => {
  return request.get<{ user: User }>(`/users/${id}`);
};

export const followUser = (id: string) => {
  return request.post<{ following: boolean }>(`/users/${id}/follow`);
};

export const updateProfile = (data: { nickname?: string; bio?: string; avatar?: string }) => {
  return request.put<{ user: User }>('/users/profile', data);
};

export const updateProfileExtended = (data: {
  nickname?: string;
  bio?: string;
  avatar?: string;
  background?: string;
  location?: string;
  gender?: string;
  birthday?: string;
  website?: string;
}) => {
  return request.put<{ user: UserExtended }>('/users/profile', data);
};

export const getPrivacySettings = () => {
  return request.get<{ settings: PrivacySettings }>('/users/privacy');
};

export const updatePrivacySettings = (data: Partial<PrivacySettings>) => {
  return request.put<{ settings: PrivacySettings }>('/users/privacy', data);
};

export const getNotificationSettings = () => {
  return request.get<{ settings: NotificationSettings }>('/users/notification-settings');
};

export const updateNotificationSettings = (data: Partial<NotificationSettings>) => {
  return request.put<{ settings: NotificationSettings }>('/users/notification-settings', data);
};

export const addToBlacklist = (blockedUserId: string) => {
  return request.post('/users/blacklist', { blockedUserId });
};

export const removeFromBlacklist = (blockedUserId: string) => {
  return request.delete('/users/blacklist', { data: { blockedUserId } });
};

export const getBlacklist = () => {
  return request.get<{ list: BlacklistItem[] }>('/users/blacklist');
};
