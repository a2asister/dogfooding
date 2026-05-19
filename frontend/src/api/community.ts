import request from './request';
import type { Community, CommunityMember } from '@/types';

export const getCommunityList = (params: {
  page?: number;
  pageSize?: number;
  category?: string;
  keyword?: string;
}) => {
  return request.get<{ list: Community[]; total: number; page: number; pageSize: number }>('/communities', { params });
};

export const getCommunityDetail = (id: string) => {
  return request.get<{ community: Community; isMember: boolean; member?: CommunityMember }>(`/communities/${id}`);
};

export const createCommunity = (data: {
  name: string;
  description: string;
  avatar?: string;
  cover?: string;
  category: string;
  isPublic: boolean;
}) => {
  return request.post<{ community: Community }>('/communities', data);
};

export const updateCommunity = (id: string, data: Partial<Community>) => {
  return request.put<{ community: Community }>(`/communities/${id}`, data);
};

export const deleteCommunity = (id: string) => {
  return request.delete(`/communities/${id}`);
};

export const joinCommunity = (id: string, joinReason?: string) => {
  return request.post<{ member: CommunityMember }>(`/communities/${id}/join`, { joinReason });
};

export const leaveCommunity = (id: string) => {
  return request.post(`/communities/${id}/leave`);
};

export const getCommunityMembers = (id: string, params: {
  page?: number;
  pageSize?: number;
  role?: string;
  status?: string;
}) => {
  return request.get<{ list: CommunityMember[]; total: number }>(`/communities/${id}/members`, { params });
};

export const updateMemberRole = (communityId: string, userId: string, role: string) => {
  return request.post(`/communities/${communityId}/members/${userId}/role`, { role });
};

export const removeMember = (communityId: string, userId: string, reason?: string) => {
  return request.post(`/communities/${communityId}/members/${userId}/remove`, { reason });
};

export const muteMember = (communityId: string, userId: string, reason?: string) => {
  return request.post(`/communities/${communityId}/members/${userId}/mute`, { reason });
};

export const unmuteMember = (communityId: string, userId: string) => {
  return request.post(`/communities/${communityId}/members/${userId}/unmute`);
};

export const getMyCommunities = (params: {
  page?: number;
  pageSize?: number;
  status?: string;
}) => {
  return request.get<{ list: Community[]; total: number }>('/communities/my', { params });
};
