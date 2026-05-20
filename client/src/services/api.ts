import axios from 'axios';
import type { Project, Task, TaskLog } from '../types';

const request = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

request.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error)
);

export const projectApi = {
  getProjects: (params?: { status?: string; type?: string }) =>
    request.get<unknown, { code: number; message: string; data: Project[] }>('/projects', { params }),

  getProject: (id: string) =>
    request.get<unknown, { code: number; message: string; data: Project }>(`/projects/${id}`),

  createProject: (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'status'>) =>
    request.post<unknown, { code: number; message: string; data: Project }>('/projects', data),

  updateProject: (id: string, data: Partial<Project>) =>
    request.put<unknown, { code: number; message: string; data: Project }>(`/projects/${id}`, data),

  deleteProject: (id: string) =>
    request.delete<unknown, { code: number; message: string; data: null }>(`/projects/${id}`),
};

export const taskApi = {
  getTasks: (projectId: string, params?: { status?: string; type?: string; assignee?: string; includeArchived?: boolean }) =>
    request.get<unknown, { code: number; message: string; data: Task[] }>(`/projects/${projectId}/tasks`, { params }),

  getTask: (projectId: string, taskId: string) =>
    request.get<unknown, { code: number; message: string; data: Task }>(`/projects/${projectId}/tasks/${taskId}`),

  getTaskLogs: (projectId: string, taskId: string) =>
    request.get<unknown, { code: number; message: string; data: TaskLog[] }>(`/projects/${projectId}/tasks/${taskId}/logs`),

  createTask: (projectId: string, data: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'isPinned' | 'isArchived'>) =>
    request.post<unknown, { code: number; message: string; data: Task }>(`/projects/${projectId}/tasks`, data),

  updateTask: (projectId: string, taskId: string, data: Partial<Task> & { operator?: string }) =>
    request.put<unknown, { code: number; message: string; data: Task }>(`/projects/${projectId}/tasks/${taskId}`, data),

  pinTask: (projectId: string, taskId: string, operator = 'user') =>
    request.post<unknown, { code: number; message: string; data: Task }>(`/projects/${projectId}/tasks/${taskId}/pin`, { operator }),

  unpinTask: (projectId: string, taskId: string, operator = 'user') =>
    request.post<unknown, { code: number; message: string; data: Task }>(`/projects/${projectId}/tasks/${taskId}/unpin`, { operator }),

  archiveTask: (projectId: string, taskId: string, operator = 'user') =>
    request.post<unknown, { code: number; message: string; data: Task }>(`/projects/${projectId}/tasks/${taskId}/archive`, { operator }),

  unarchiveTask: (projectId: string, taskId: string, operator = 'user') =>
    request.post<unknown, { code: number; message: string; data: Task }>(`/projects/${projectId}/tasks/${taskId}/unarchive`, { operator }),

  deleteTask: (projectId: string, taskId: string, operator = 'user') =>
    request.delete<unknown, { code: number; message: string; data: null }>(`/projects/${projectId}/tasks/${taskId}`, { data: { operator } }),
};
