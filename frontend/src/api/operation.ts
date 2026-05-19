import request from './request';
import type { Banner, HotRank, FlowSupport } from '@/types';

export const createBanner = (data: {
  title: string;
  image: string;
  position: string;
  type: string;
  targetId?: string;
  targetUrl?: string;
  description?: string;
  sort?: number;
  isActive?: boolean;
  startTime?: string;
  endTime?: string;
}) => {
  return request.post<{ message: string; banner: Banner }>('/operation/banners', data);
};

export const updateBanner = (bannerId: string, data: Partial<Banner>) => {
  return request.put<{ message: string; banner: Banner }>(`/operation/banners/${bannerId}`, data);
};

export const deleteBanner = (bannerId: string) => {
  return request.delete<{ message: string }>(`/operation/banners/${bannerId}`);
};

export const getBanners = (params?: { position?: string; includeInactive?: boolean }) => {
  return request.get<{ banners: Banner[] }>('/operation/banners', { params });
};

export const incrementBannerClick = (bannerId: string) => {
  return request.post<{ message: string }>(`/operation/banners/${bannerId}/click`);
};

export const generateHotRanks = (data: { type: string; limit?: number }) => {
  return request.post<{ message: string; count: number }>('/operation/hot-ranks/generate', data);
};

export const getHotRanks = (params?: { type?: string; page?: number; pageSize?: number }) => {
  return request.get<{
    list: HotRank[];
    total: number;
    page: number;
    pageSize: number;
  }>('/operation/hot-ranks', { params });
};

export const manualBoostRank = (rankId: string, boostValue: number) => {
  return request.post<{ message: string; rank: HotRank }>(`/operation/hot-ranks/${rankId}/boost`, {
    boostValue,
  });
};

export const pinRank = (rankId: string, isPinned: boolean) => {
  return request.post<{ message: string; rank: HotRank }>(`/operation/hot-ranks/${rankId}/pin`, {
    isPinned,
  });
};

export const createFlowSupport = (data: {
  noteId: string;
  type: string;
  boostMultiplier: number;
  reason?: string;
  targetViews?: number;
  startTime?: string;
  endTime?: string;
}) => {
  return request.post<{ message: string; support: FlowSupport }>('/operation/flow-support', data);
};

export const cancelFlowSupport = (supportId: string) => {
  return request.post<{ message: string; support: FlowSupport }>(
    `/operation/flow-support/${supportId}/cancel`
  );
};

export const getFlowSupports = (params?: {
  noteId?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}) => {
  return request.get<{
    list: FlowSupport[];
    total: number;
    page: number;
    pageSize: number;
  }>('/operation/flow-support', { params });
};
