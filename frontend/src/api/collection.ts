import request from './request';
import type { Collection, CollectionItem, Note } from '@/types';

export const createCollection = (data: {
  name: string;
  description?: string;
  cover?: string;
  isPublic?: boolean;
}) => {
  return request.post<{ collection: Collection }>('/collections', data);
};

export const getCollectionList = (params: {
  userId: string;
  page?: number;
  pageSize?: number;
}) => {
  return request.get<{ list: Collection[]; total: number; page: number; pageSize: number }>(
    '/collections',
    { params }
  );
};

export const getCollectionDetail = (id: string) => {
  return request.get<{ collection: Collection }>(`/collections/${id}`);
};

export const getCollectionItems = (params: {
  id: string;
  page?: number;
  pageSize?: number;
}) => {
  return request.get<{ list: CollectionItem[]; total: number; page: number; pageSize: number }>(
    `/collections/${params.id}/items`,
    { params: { page: params.page, pageSize: params.pageSize } }
  );
};

export const addNoteToCollection = (data: {
  collectionId: string;
  noteId: string;
}) => {
  return request.post('/collections/items', data);
};

export const removeNoteFromCollection = (data: {
  collectionId: string;
  noteId: string;
}) => {
  return request.delete('/collections/items', { data });
};

export const batchAddToCollection = (data: {
  collectionId: string;
  noteIds: string[];
}) => {
  return request.post<{ addedCount: number }>('/collections/items/batch', data);
};

export const updateCollection = (id: string, data: {
  name?: string;
  description?: string;
  cover?: string;
  isPublic?: boolean;
}) => {
  return request.put<{ collection: Collection }>(`/collections/${id}`, data);
};

export const deleteCollection = (id: string) => {
  return request.delete(`/collections/${id}`);
};
