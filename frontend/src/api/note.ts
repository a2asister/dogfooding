import request from './request';
import type { Note, CreateNoteParams, NoteStats, UserNoteStats, SensitiveCheckResult, NoteWithProtection } from '@/types';

export const getNoteList = (params: {
  page?: number;
  pageSize?: number;
  type?: 'recommend' | 'following';
  topic?: string;
}) => {
  return request.get<{ list: Note[]; total: number; page: number; pageSize: number }>('/notes', { params });
};

export const getNoteDetail = (id: string) => {
  return request.get<{ note: NoteWithProtection }>(`/notes/${id}`);
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

export const updateNote = (id: string, data: Partial<CreateNoteParams> & { locationInfo?: any }) => {
  return request.put<{ note: Note }>(`/notes/${id}`, data);
};

export const deleteNoteToTrash = (id: string) => {
  return request.delete(`/notes/${id}`);
};

export const restoreNote = (id: string) => {
  return request.post(`/notes/${id}/restore`);
};

export const getTrashNotes = (params: { page?: number; pageSize?: number }) => {
  return request.get<{ list: Note[]; total: number; page: number; pageSize: number }>('/notes/trash/list', { params });
};

export const permanentlyDeleteNote = (id: string) => {
  return request.delete(`/notes/${id}/permanent`);
};

export const getNoteStats = (id: string) => {
  return request.get<{ stats: NoteStats }>(`/notes/${id}/stats`);
};

export const getUserNotesStats = () => {
  return request.get<{ stats: UserNoteStats }>('/notes/stats/summary');
};

export const checkSensitiveWords = (data: { title?: string; content?: string }) => {
  return request.post<SensitiveCheckResult>('/notes/check-sensitive', data);
};
