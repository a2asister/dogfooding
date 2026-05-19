import request from './request';
import type { Earning, EarningSummary, Withdrawal } from '@/types';

export const getEarningSummary = () => {
  return request.get<{ summary: EarningSummary }>('/earnings/summary');
};

export const getEarningList = (params: {
  page?: number;
  pageSize?: number;
  type?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}) => {
  return request.get<{ list: Earning[]; total: number; page: number; pageSize: number }>('/earnings', { params });
};

export const getEarningDetail = (id: string) => {
  return request.get<{ earning: Earning }>(`/earnings/${id}`);
};

export const createWithdrawal = (data: {
  amount: number;
  method: 'alipay' | 'wechat' | 'bank';
  accountInfo: Record<string, any>;
}) => {
  return request.post<{ withdrawal: Withdrawal }>('/earnings/withdraw', data);
};

export const getWithdrawalList = (params: {
  page?: number;
  pageSize?: number;
  status?: string;
}) => {
  return request.get<{ list: Withdrawal[]; total: number; page: number; pageSize: number }>('/earnings/withdrawals', { params });
};

export const getWithdrawalDetail = (id: string) => {
  return request.get<{ withdrawal: Withdrawal }>(`/earnings/withdrawals/${id}`);
};
