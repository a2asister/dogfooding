import request from './request';
import type { MembershipPlan, UserMembership } from '@/types';

export const getMembershipPlans = () => {
  return request.get<{ plans: MembershipPlan[] }>('/membership/plans');
};

export const getPlanDetail = (id: string) => {
  return request.get<{ plan: MembershipPlan }>(`/membership/plans/${id}`);
};

export const getUserMembership = () => {
  return request.get<{ membership: UserMembership | null }>('/membership/my');
};

export const purchaseMembership = (planId: string) => {
  return request.post<{ orderId: string }>('/membership/purchase', { planId });
};

export const getMembershipBenefits = () => {
  return request.get<{ benefits: string[]; isMember: boolean; expiresAt?: string }>('/membership/benefits');
};

export const getExpiringMemberships = (days?: number) => {
  return request.get<{ memberships: UserMembership[] }>('/membership/expiring', { params: { days } });
};
