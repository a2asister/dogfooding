import axios from 'axios';
import type { Element, Favorite, Note, KnowledgeCategory } from '@/types/element';

const api = axios.create({
  baseURL: 'http://localhost:8765',
  timeout: 10000,
});

export const elementApi = {
  getAll: (): Promise<Element[]> => api.get('/elements').then(res => res.data),
  getOne: (id: number): Promise<Element> => api.get(`/elements/${id}`).then(res => res.data),
  bulkCreate: (elements: Omit<Element, 'id'>[]): Promise<Element[]> => 
    api.post('/elements/bulk', elements).then(res => res.data),
};

export const favoriteApi = {
  add: (userId: string, elementId: number): Promise<Favorite> => 
    api.post('/favorites', { userId, elementId }).then(res => res.data),
  remove: (userId: string, elementId: number): Promise<void> => 
    api.delete(`/favorites/user/${userId}/element/${elementId}`).then(res => res.data),
  getByUser: (userId: string): Promise<Favorite[]> => 
    api.get(`/favorites/user/${userId}`).then(res => res.data),
  isFavorite: (userId: string, elementId: number): Promise<{ isFavorite: boolean }> => 
    api.get(`/favorites/user/${userId}/element/${elementId}`).then(res => res.data),
};

export const noteApi = {
  create: (data: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'element' | 'category'>): Promise<Note> => 
    api.post('/notes', data).then(res => res.data),
  update: (id: number, data: Partial<Note>): Promise<Note> => 
    api.patch(`/notes/${id}`, data).then(res => res.data),
  remove: (id: number): Promise<void> => 
    api.delete(`/notes/${id}`).then(res => res.data),
  getByUser: (userId: string): Promise<Note[]> => 
    api.get(`/notes/user/${userId}`).then(res => res.data),
};

export const categoryApi = {
  getAll: (): Promise<KnowledgeCategory[]> => 
    api.get('/knowledge-categories').then(res => res.data),
  create: (data: Omit<KnowledgeCategory, 'id' | 'notes'>): Promise<KnowledgeCategory> => 
    api.post('/knowledge-categories', data).then(res => res.data),
  update: (id: number, data: Partial<KnowledgeCategory>): Promise<KnowledgeCategory> => 
    api.patch(`/knowledge-categories/${id}`, data).then(res => res.data),
  remove: (id: number): Promise<void> => 
    api.delete(`/knowledge-categories/${id}`).then(res => res.data),
};
