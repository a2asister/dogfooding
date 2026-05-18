import request from './request';
import type { Topic, Note } from '@/types';

export const getTopicSquare = () => {
  return request.get<{
    hotTopics: Topic[];
    topics: Topic[];
    categories: string[];
  }>('/topics/square');
};

export const getTopicDetail = (id: string) => {
  return request.get<{ topic: Topic }>(`/topics/${id}`);
};

export const getTopicNotes = (params: {
  id: string;
  page?: number;
  pageSize?: number;
  sort?: 'latest' | 'hot';
}) => {
  return request.get<{ list: Note[]; total: number; page: number; pageSize: number }>(
    `/topics/${params.id}/notes`,
    { params: { page: params.page, pageSize: params.pageSize, sort: params.sort } }
  );
};

export const followTopic = (id: string) => {
  return request.post<{ following: boolean; followCount: number }>(`/topics/${id}/follow`);
};

export const getFollowedTopics = () => {
  return request.get<{ list: Topic[] }>('/topics/followed');
};
