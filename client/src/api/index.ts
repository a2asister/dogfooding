import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import { message } from 'antd';
import { useAuthStore } from '@/store/auth';

const api: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      message.error('登录已过期，请重新登录');
    } else if (error.response?.status === 403) {
      message.error('权限不足');
    } else if (error.response?.data?.error) {
      message.error(error.response.data.error as string);
    } else {
      message.error('请求失败，请稍后重试');
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (username: string, password: string): Promise<{ token: string; user: unknown }> =>
    api.post('/auth/login', { username, password }).then((r) => r.data),
  getMe: (): Promise<{ user: unknown }> => api.get('/auth/me').then((r) => r.data),
  getGithubLoginUrl: (): string => '/api/auth/github/login',
};

export const userApi = {
  list: (params: { page?: number; pageSize?: number; role?: string }): Promise<{ users: unknown[]; total: number }> =>
    api.get('/users', { params }).then((r) => r.data),
  updateRole: (id: string, role: string): Promise<{ user: unknown }> =>
    api.put(`/users/${id}/role`, { role }).then((r) => r.data),
};

export const githubApi = {
  getRepos: (): Promise<{ repos: unknown[] }> => api.get('/github/repos').then((r) => r.data),
  getOrgs: (): Promise<{ orgs: unknown[] }> => api.get('/github/orgs').then((r) => r.data),
  syncRepos: (): Promise<{ repos: unknown[]; count: number }> =>
    api.post('/github/repos/sync').then((r) => r.data),
  importRepo: (id: string, repo: unknown): Promise<{ repo: unknown }> =>
    api.post(`/github/repos/${id}/import`, { repo }).then((r) => r.data),
};

export const repositoryApi = {
  list: (): Promise<{ repos: unknown[] }> => api.get('/repositories').then((r) => r.data),
  get: (id: string): Promise<{ repo: unknown }> => api.get(`/repositories/${id}`).then((r) => r.data),
  delete: (id: string): Promise<{ success: boolean }> =>
    api.delete(`/repositories/${id}`).then((r) => r.data),
  getBranchRules: (repoId: string): Promise<{ rules: unknown[] }> =>
    api.get(`/repositories/${repoId}/branch-rules`).then((r) => r.data),
  createBranchRule: (repoId: string, data: unknown): Promise<{ rule: unknown }> =>
    api.post(`/repositories/${repoId}/branch-rules`, data).then((r) => r.data),
  getSnapshots: (repoId: string): Promise<{ snapshots: unknown[] }> =>
    api.get(`/repositories/${repoId}/snapshots`).then((r) => r.data),
  createSnapshot: (repoId: string, data: unknown): Promise<{ snapshot: unknown }> =>
    api.post(`/repositories/${repoId}/snapshots`, data).then((r) => r.data),
};

export const branchApi = {
  updateRule: (id: string, data: unknown): Promise<{ rule: unknown }> =>
    api.put(`/branch-rules/${id}`, data).then((r) => r.data),
  deleteRule: (id: string): Promise<{ success: boolean }> =>
    api.delete(`/branch-rules/${id}`).then((r) => r.data),
  validateName: (name: string): Promise<{ valid: boolean; pattern?: string; message?: string }> =>
    api.post('/branch/validate', { name }).then((r) => r.data),
};

export const prApi = {
  list: (params: { page?: number; pageSize?: number; repoId?: string; state?: string }): Promise<{ prs: unknown[]; total: number }> =>
    api.get('/pull-requests', { params }).then((r) => r.data),
  get: (id: string): Promise<{ pr: unknown }> => api.get(`/pull-requests/${id}`).then((r) => r.data),
  addReview: (id: string, state: string, comment?: string): Promise<{ pr: unknown }> =>
    api.post(`/pull-requests/${id}/review`, { state, comment }).then((r) => r.data),
  canMerge: (id: string): Promise<{ canMerge: boolean; reasons: string[] }> =>
    api.get(`/pull-requests/${id}/merge-check`).then((r) => r.data),
};

export const pipelineApi = {
  list: (params: { page?: number; pageSize?: number; repoId?: string }): Promise<{ pipelines: unknown[]; total: number }> =>
    api.get('/pipelines', { params }).then((r) => r.data),
  create: (data: unknown): Promise<{ pipeline: unknown }> => api.post('/pipelines', data).then((r) => r.data),
  get: (id: string): Promise<{ pipeline: unknown }> => api.get(`/pipelines/${id}`).then((r) => r.data),
  update: (id: string, data: unknown): Promise<{ pipeline: unknown }> =>
    api.put(`/pipelines/${id}`, data).then((r) => r.data),
  delete: (id: string): Promise<{ success: boolean }> => api.delete(`/pipelines/${id}`).then((r) => r.data),
  run: (id: string, data: unknown): Promise<{ run: unknown }> =>
    api.post(`/pipelines/${id}/run`, data).then((r) => r.data),
  listRuns: (params: {
    page?: number;
    pageSize?: number;
    pipelineId?: string;
    repoId?: string;
    status?: string;
  }): Promise<{ runs: unknown[]; total: number }> => api.get('/pipeline-runs', { params }).then((r) => r.data),
  getRun: (id: string): Promise<{ run: unknown }> => api.get(`/pipeline-runs/${id}`).then((r) => r.data),
  cancelRun: (id: string): Promise<{ success: boolean }> =>
    api.post(`/pipeline-runs/${id}/cancel`).then((r) => r.data),
};

export const deployApi = {
  listEnvironments: (): Promise<{ environments: unknown[] }> =>
    api.get('/environments').then((r) => r.data),
  createEnvironment: (data: unknown): Promise<{ environment: unknown }> =>
    api.post('/environments', data).then((r) => r.data),
  deploy: (data: unknown): Promise<{ deployment: unknown }> => api.post('/deployments', data).then((r) => r.data),
  listDeployments: (params: {
    page?: number;
    pageSize?: number;
    envId?: string;
    repoId?: string;
    status?: string;
  }): Promise<{ deployments: unknown[]; total: number }> =>
    api.get('/deployments', { params }).then((r) => r.data),
  rollback: (id: string): Promise<{ deployment: unknown }> =>
    api.post(`/deployments/${id}/rollback`).then((r) => r.data),
};

export const auditApi = {
  list: (params: {
    page?: number;
    pageSize?: number;
    userId?: string;
    action?: string;
    module?: string;
    startTime?: number;
    endTime?: number;
  }): Promise<{ logs: unknown[]; total: number }> => api.get('/audit-logs', { params }).then((r) => r.data),
  export: (params: { userId?: string; action?: string; module?: string; startTime?: number; endTime?: number }): Promise<string> =>
    api.get('/audit-logs/export', { params, responseType: 'blob' }).then((r) => r.data as never),
};

export const alertApi = {
  list: (params: { page?: number; pageSize?: number; read?: boolean; level?: string }): Promise<{
    alerts: unknown[];
    total: number;
    unreadCount: number;
  }> => api.get('/alerts', { params }).then((r) => r.data),
  markRead: (ids: string[]): Promise<{ success: boolean }> =>
    api.post('/alerts/mark-read', { ids }).then((r) => r.data),
  markAllRead: (): Promise<{ success: boolean }> => api.post('/alerts/mark-all-read').then((r) => r.data),
  delete: (id: string): Promise<{ success: boolean }> => api.delete(`/alerts/${id}`).then((r) => r.data),
};

export const dashboardApi = {
  getStats: (): Promise<unknown> => api.get('/dashboard/stats').then((r) => r.data),
};

export default api;
