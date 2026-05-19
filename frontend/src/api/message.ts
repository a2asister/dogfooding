import request from './request';
import type { Message, Conversation } from '@/types';

export const getConversationList = (params: {
  page?: number;
  pageSize?: number;
}) => {
  return request.get<{ list: Conversation[]; total: number }>('/messages/conversations', { params });
};

export const getConversationDetail = (id: string) => {
  return request.get<{ conversation: Conversation }>(`/messages/conversations/${id}`);
};

export const getMessageList = (conversationId: string, params: {
  page?: number;
  pageSize?: number;
  before?: string;
}) => {
  return request.get<{ list: Message[]; total: number; hasMore: boolean }>(`/messages/conversations/${conversationId}/messages`, { params });
};

export const sendMessage = (conversationId: string, data: {
  type: 'text' | 'image' | 'link' | 'note_share' | 'product_share';
  content: string;
  metadata?: Record<string, any>;
}) => {
  return request.post<{ message: Message }>(`/messages/conversations/${conversationId}/messages`, data);
};

export const sendDirectMessage = (userId: string, data: {
  type: 'text' | 'image' | 'link' | 'note_share' | 'product_share';
  content: string;
  metadata?: Record<string, any>;
}) => {
  return request.post<{ message: Message; conversation: Conversation }>(`/messages/send/${userId}`, data);
};

export const markAsRead = (conversationId: string) => {
  return request.post(`/messages/conversations/${conversationId}/read`);
};

export const markAllAsRead = () => {
  return request.post('/messages/read-all');
};

export const deleteConversation = (id: string) => {
  return request.delete(`/messages/conversations/${id}`);
};

export const deleteMessage = (id: string) => {
  return request.delete(`/messages/${id}`);
};

export const recallMessage = (id: string) => {
  return request.post(`/messages/${id}/recall`);
};

export const getUnreadCount = () => {
  return request.get<{ count: number }>('/messages/unread-count');
};

export const blockUserMessages = (userId: string) => {
  return request.post(`/messages/block/${userId}`);
};

export const unblockUserMessages = (userId: string) => {
  return request.post(`/messages/unblock/${userId}`);
};

export const getBlockedUsers = () => {
  return request.get<{ users: Array<{ userId: string; user: any; blockedAt: string }> }>('/messages/blocked');
};
