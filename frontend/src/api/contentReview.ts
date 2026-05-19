import request from './request';
import type {
  ReviewTaskResult,
  ReviewTask,
  ViolationDetectionResult,
  ContentRestriction,
  UserRestriction,
} from '@/types';

export const getPendingReviewTasks = (params?: { type?: string; page?: number; pageSize?: number }) => {
  return request.get<ReviewTaskResult>('/content-review/tasks/pending', { params });
};

export const reviewTask = (taskId: string, data: { passed: boolean; reason?: string }) => {
  return request.post<{ message: string; task: ReviewTask }>(`/content-review/tasks/${taskId}/review`, data);
};

export const batchReviewTasks = (data: { taskIds: string[]; passed: boolean; reason?: string }) => {
  return request.post<{ message: string; results: any[] }>('/content-review/tasks/batch-review', data);
};

export const createContentRestriction = (data: {
  noteId: string;
  type: string;
  level: string;
  reasons: any[];
  remark?: string;
}) => {
  return request.post<{ message: string; restriction: ContentRestriction }>(
    '/content-review/content-restriction',
    data
  );
};

export const createUserRestriction = (data: {
  userId: string;
  type: string;
  reason: string;
  scope?: string;
  durationHours?: number;
}) => {
  return request.post<{ message: string; restriction: UserRestriction }>(
    '/content-review/user-restriction',
    data
  );
};

export const liftUserRestriction = (restrictionId: string, reason: string) => {
  return request.post<{ message: string; restriction: UserRestriction }>(
    `/content-review/user-restriction/${restrictionId}/lift`,
    { reason }
  );
};

export const checkUserRestriction = (params?: { scope?: string }) => {
  return request.get<{
    isRestricted: boolean;
    restrictions: UserRestriction[];
  }>('/content-review/user-restriction/check', { params });
};

export const detectContentViolation = (content: string) => {
  return request.post<ViolationDetectionResult>('/content-review/detect', { content });
};

export const getReviewLogs = (params?: { taskId?: string; page?: number; pageSize?: number }) => {
  return request.get<{
    logs: any[];
    total: number;
    page: number;
    pageSize: number;
  }>('/content-review/logs', { params });
};

export const getContentRestrictions = (params?: { noteId?: string; page?: number; pageSize?: number }) => {
  return request.get<{
    restrictions: ContentRestriction[];
    total: number;
    page: number;
    pageSize: number;
  }>('/content-review/content-restrictions', { params });
};

export const getUserRestrictions = (params?: { userId?: string; page?: number; pageSize?: number }) => {
  return request.get<{
    restrictions: UserRestriction[];
    total: number;
    page: number;
    pageSize: number;
  }>('/content-review/user-restrictions', { params });
};
