import request from './request';
import type { Note, CreateNoteParams } from '@/types';

export const getNoteList = (params: {
  page?: number;
  pageSize?: number;
  type?: 'recommend' | 'following';
  topic?: string;
}) => {
  return request.get<{ list: Note[]; total: number; page: number; pageSize: number }>('/notes', { params });
};

export const getNoteDetail = (id: string) => {
  return request.get<{ note: Note }>(`/notes/${id}`);
};

export const createNote = (data: CreateNoteParams) => {
  return request.post<{ note: Note }>('/notes', data);
};

export const likeNote = (id: string) => {
  return request.post<{ liked: boolean; likeCount: number }>(`/notes/${id}/like`);
};

export const favoriteNote = (id: string) => {
  return request.post<{ favorited: boolean; favoriteCount: number }>(`/notes/${id}/favorite`);
};

export const shareNote = (id: string) => {
  return request.post<{ shareCount: number }>(`/notes/${id}/share`);
};

export const getDrafts = (params: { page?: number; pageSize?: number }) => {
  return request.get<{ list: Note[]; total: number; page: number; pageSize: number }>('/notes/drafts', { params });
};

export const deleteDraft = (id: string) => {
  return request.delete(`/notes/drafts/${id}`);
};

export const publishDraft = (id: string) => {
  return request.post(`/notes/drafts/${id}/publish`);
};
