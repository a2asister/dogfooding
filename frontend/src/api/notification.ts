import request from './request';
import type { Notification } from '@/types';

export const getNotificationList = (params: {
  type?: string;
  page?: number;
  pageSize?: number;
}) => {
  return request.get<{
    list: Notification[];
    total: number;
    unreadCount: number;
    page: number;
    pageSize: number;
  }>('/notifications', { params });
};

export const getUnreadCount = () => {
  return request.get<{
    total: number;
    like: number;
    comment: number;
    reply: number;
    follow: number;
    favorite: number;
    system: number;
  }>('/notifications/unread-count');
};

export const markAsRead = (id: string) => {
  return request.post(`/notifications/${id}/read`);
};

export const markAllAsRead = () => {
  return request.post('/notifications/read-all');
};

export const deleteNotification = (id: string) => {
  return request.delete(`/notifications/${id}`);
};

export const clearAllNotifications = () => {
  return request.delete('/notifications');
};
