import request from './request';
import type { CreatorOverview, CreatorData, CreatorVerification } from '@/types';

export const getCreatorOverview = () => {
  return request.get<CreatorOverview>('/creator/overview');
};

export const getCreatorDataRange = (params: { startDate: string; endDate: string }) => {
  return request.get<{
    list: CreatorData[];
    total: number;
  }>('/creator/data', { params });
};

export const generateCreatorDailyData = (data?: { date?: string }) => {
  return request.post<{ message: string; data: CreatorData }>('/creator/data/generate', data || {});
};

export const applyForVerification = (data: {
  type: string;
  realName: string;
  materials?: Array<{ type: string; url: string; description: string }>;
  description?: string;
  idCard?: string;
  organizationName?: string;
  organizationLicense?: string;
}) => {
  return request.post<{ message: string; verification: CreatorVerification }>(
    '/creator/verification/apply',
    data
  );
};

export const reviewVerification = (
  verificationId: string,
  data: {
    passed: boolean;
    reviewNote?: string;
    level?: number;
    badgeText?: string;
    badgeIcon?: string;
    validDays?: number;
  }
) => {
  return request.post<{ message: string; verification: CreatorVerification }>(
    `/creator/verification/${verificationId}/review`,
    data
  );
};

export const getCreatorVerifications = (params?: {
  status?: string;
  page?: number;
  pageSize?: number;
}) => {
  return request.get<{
    list: CreatorVerification[];
    total: number;
    page: number;
    pageSize: number;
  }>('/creator/verifications', { params });
};

export const getMyVerification = () => {
  return request.get<{ verification: CreatorVerification | null }>('/creator/verification/me');
};
