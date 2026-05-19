import request from './request';
import type { BehaviorRisk, AccountRisk, LoginLog, RegisterLog } from '@/types';

export const getBehaviorRisks = (params?: {
  status?: string;
  type?: string;
  page?: number;
  pageSize?: number;
}) => {
  return request.get<{
    list: BehaviorRisk[];
    total: number;
    page: number;
    pageSize: number;
  }>('/risk-control/behavior-risks', { params });
};

export const getAccountRisks = (params?: {
  status?: string;
  type?: string;
  page?: number;
  pageSize?: number;
}) => {
  return request.get<{
    list: AccountRisk[];
    total: number;
    page: number;
    pageSize: number;
  }>('/risk-control/account-risks', { params });
};

export const processBehaviorRisk = (
  riskId: string,
  data: {
    confirmed: boolean;
    action?: string;
    reviewNote?: string;
  }
) => {
  return request.post<{ message: string; risk: BehaviorRisk }>(
    `/risk-control/behavior-risks/${riskId}/process`,
    data
  );
};

export const processAccountRisk = (
  riskId: string,
  data: {
    confirmed: boolean;
    action?: string;
    reviewNote?: string;
  }
) => {
  return request.post<{ message: string; risk: AccountRisk }>(
    `/risk-control/account-risks/${riskId}/process`,
    data
  );
};

export const batchProcessBehaviorRisks = (data: {
  riskIds: string[];
  confirmed: boolean;
  action?: string;
  reviewNote?: string;
}) => {
  return request.post<{ message: string; results: any[] }>(
    '/risk-control/behavior-risks/batch-process',
    data
  );
};

export const batchProcessAccountRisks = (data: {
  riskIds: string[];
  confirmed: boolean;
  action?: string;
  reviewNote?: string;
}) => {
  return request.post<{ message: string; results: any[] }>(
    '/risk-control/account-risks/batch-process',
    data
  );
};

export const getLoginLogs = (params?: {
  userId?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}) => {
  return request.get<{
    logs: LoginLog[];
    total: number;
    page: number;
    pageSize: number;
  }>('/risk-control/login-logs', { params });
};

export const getRegisterLogs = (params?: {
  userId?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}) => {
  return request.get<{
    logs: RegisterLog[];
    total: number;
    page: number;
    pageSize: number;
  }>('/risk-control/register-logs', { params });
};

export const getSuspiciousRegisters = (params?: { page?: number; pageSize?: number }) => {
  return request.get<{
    logs: RegisterLog[];
    total: number;
    page: number;
    pageSize: number;
  }>('/risk-control/suspicious-registers', { params });
};
