import request from './request';
import type { Comment, CreateCommentParams } from '@/types';

export const getCommentList = (params: {
  noteId: string;
  page?: number;
  pageSize?: number;
}) => {
  return request.get<{ list: Comment[]; total: number; page: number; pageSize: number }>('/comments', { params });
};

export const getReplyList = (params: {
  commentId: string;
  page?: number;
  pageSize?: number;
}) => {
  return request.get<{ list: Comment[]; total: number; page: number; pageSize: number }>('/comments/replies', { params });
};

export const createComment = (data: CreateCommentParams) => {
  return request.post<{ comment: Comment }>('/comments', data);
};

export const likeComment = (id: string) => {
  return request.post<{ liked: boolean; likeCount: number }>(`/comments/like/${id}`);
};

export const deleteComment = (id: string) => {
  return request.delete(`/comments/${id}`);
};

export const pinComment = (id: string) => {
  return request.post<{ isPinned: boolean }>(`/comments/pin/${id}`);
};
