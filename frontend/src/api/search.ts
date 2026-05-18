import request from './request';
import type { Note, User, Topic, SearchHistory, HotSearch, SearchResult } from '@/types';

export const search = (params: {
  keyword: string;
  type?: 'all' | 'note' | 'user' | 'topic';
  page?: number;
  pageSize?: number;
}) => {
  return request.get<SearchResult>('/search', { params });
};

export const getSearchSuggestions = (keyword: string) => {
  return request.get<{ suggestions: string[] }>('/search/suggestions', { params: { keyword } });
};

export const getSearchHistory = () => {
  return request.get<{ list: SearchHistory[] }>('/search/history');
};

export const clearSearchHistory = () => {
  return request.delete('/search/history');
};

export const deleteSearchHistory = (id: string) => {
  return request.delete(`/search/history/${id}`);
};

export const getHotSearches = () => {
  return request.get<{ list: HotSearch[] }>('/search/hot');
};
