import axios from 'axios';
import type {
  Project,
  Task,
  TaskLog,
  User,
  Organization,
  Sprint,
  BacklogItem,
  Version,
  PaginatedResponse,
  LoginResponse,
  ApiResponse,
} from '../types';

export const api = axios.create({
  baseURL: 'http://localhost:31845/api',
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (username: string, password: string) =>
    api.post<unknown, ApiResponse<LoginResponse>>('/auth/login', { username, password }),

  register: (username: string, email: string, password: string, realName: string) =>
    api.post<unknown, ApiResponse<LoginResponse>>('/auth/register', { username, email, password, realName }),
};

export const userApi = {
  getUsers: (params?: { page?: number; pageSize?: number; keyword?: string; role?: string; departmentId?: string; status?: string }) =>
    api.get<unknown, ApiResponse<PaginatedResponse<User>>>('/users', { params }),

  getAllUsers: () =>
    api.get<unknown, ApiResponse<User[]>>('/users/all'),

  getUser: (id: string) =>
    api.get<unknown, ApiResponse<User>>(`/users/${id}`),

  createUser: (data: { username: string; email: string; password: string; realName: string; role?: string; phone?: string; departmentId?: string }) =>
    api.post<unknown, ApiResponse<User>>('/users', data),

  updateUser: (id: string, data: Partial<User>) =>
    api.put<unknown, ApiResponse<User>>(`/users/${id}`, data),

  deleteUser: (id: string) =>
    api.delete<unknown, ApiResponse<null>>(`/users/${id}`),

  updatePassword: (id: string, oldPassword?: string, newPassword: string) =>
    api.put<unknown, ApiResponse<null>>(`/users/${id}/password`, { oldPassword, newPassword }),
};

export const organizationApi = {
  getOrganizations: () =>
    api.get<unknown, ApiResponse<Organization[]>>('/organizations'),

  getOrganizationTree: () =>
    api.get<unknown, ApiResponse<Organization[]>>('/organizations/tree'),

  getOrganization: (id: string) =>
    api.get<unknown, ApiResponse<Organization>>(`/organizations/${id}`),

  getOrganizationUsers: (id: string) =>
    api.get<unknown, ApiResponse<User[]>>(`/organizations/${id}/users`),

  createOrganization: (data: Partial<Organization>) =>
    api.post<unknown, ApiResponse<Organization>>('/organizations', data),

  updateOrganization: (id: string, data: Partial<Organization>) =>
    api.put<unknown, ApiResponse<Organization>>(`/organizations/${id}`, data),

  deleteOrganization: (id: string) =>
    api.delete<unknown, ApiResponse<null>>(`/organizations/${id}`),
};

export const projectApi = {
  getProjects: (params?: { status?: string; type?: string }) =>
    api.get<unknown, ApiResponse<Project[]>>('/projects', { params }),

  getProject: (id: string) =>
    api.get<unknown, ApiResponse<Project>>(`/projects/${id}`),

  createProject: (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'status'>) =>
    api.post<unknown, ApiResponse<Project>>('/projects', data),

  updateProject: (id: string, data: Partial<Project>) =>
    api.put<unknown, ApiResponse<Project>>(`/projects/${id}`, data),

  deleteProject: (id: string) =>
    api.delete<unknown, ApiResponse<null>>(`/projects/${id}`),
};

export const taskApi = {
  getTasks: (projectId: string, params?: { status?: string; type?: string; assignee?: string; includeArchived?: boolean; sprintId?: string; versionId?: string }) =>
    api.get<unknown, ApiResponse<Task[]>>(`/projects/${projectId}/tasks`, { params }),

  getTask: (projectId: string, taskId: string) =>
    api.get<unknown, ApiResponse<Task>>(`/projects/${projectId}/tasks/${taskId}`),

  getTaskLogs: (projectId: string, taskId: string) =>
    api.get<unknown, ApiResponse<TaskLog[]>>(`/projects/${projectId}/tasks/${taskId}/logs`),

  createTask: (projectId: string, data: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'isPinned' | 'isArchived'>) =>
    api.post<unknown, ApiResponse<Task>>(`/projects/${projectId}/tasks`, data),

  updateTask: (projectId: string, taskId: string, data: Partial<Task> & { operator?: string }) =>
    api.put<unknown, ApiResponse<Task>>(`/projects/${projectId}/tasks/${taskId}`, data),

  pinTask: (projectId: string, taskId: string, operator = 'user') =>
    api.post<unknown, ApiResponse<Task>>(`/projects/${projectId}/tasks/${taskId}/pin`, { operator }),

  unpinTask: (projectId: string, taskId: string, operator = 'user') =>
    api.post<unknown, ApiResponse<Task>>(`/projects/${projectId}/tasks/${taskId}/unpin`, { operator }),

  archiveTask: (projectId: string, taskId: string, operator = 'user') =>
    api.post<unknown, ApiResponse<Task>>(`/projects/${projectId}/tasks/${taskId}/archive`, { operator }),

  unarchiveTask: (projectId: string, taskId: string, operator = 'user') =>
    api.post<unknown, ApiResponse<Task>>(`/projects/${projectId}/tasks/${taskId}/unarchive`, { operator }),

  deleteTask: (projectId: string, taskId: string, operator = 'user') =>
    api.delete<unknown, ApiResponse<null>>(`/projects/${projectId}/tasks/${taskId}`, { data: { operator } }),
};

export const sprintApi = {
  getSprints: (params?: { projectId?: string; status?: string }) =>
    api.get<unknown, ApiResponse<Sprint[]>>('/sprints', { params }),

  getSprint: (id: string) =>
    api.get<unknown, ApiResponse<Sprint>>(`/sprints/${id}`),

  createSprint: (data: Omit<Sprint, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'velocity'>) =>
    api.post<unknown, ApiResponse<Sprint>>('/sprints', data),

  updateSprint: (id: string, data: Partial<Sprint>) =>
    api.put<unknown, ApiResponse<Sprint>>(`/sprints/${id}`, data),

  deleteSprint: (id: string) =>
    api.delete<unknown, ApiResponse<null>>(`/sprints/${id}`),

  addTasksToSprint: (id: string, taskIds: string[]) =>
    api.post<unknown, ApiResponse<null>>(`/sprints/${id}/tasks`, { taskIds }),

  removeTasksFromSprint: (id: string, taskIds: string[]) =>
    api.delete<unknown, ApiResponse<null>>(`/sprints/${id}/tasks`, { data: { taskIds } }),

  startSprint: (id: string) =>
    api.post<unknown, ApiResponse<null>>(`/sprints/${id}/start`),

  pauseSprint: (id: string) =>
    api.post<unknown, ApiResponse<null>>(`/sprints/${id}/pause`),

  resumeSprint: (id: string) =>
    api.post<unknown, ApiResponse<null>>(`/sprints/${id}/resume`),

  completeSprint: (id: string) =>
    api.post<unknown, ApiResponse<null>>(`/sprints/${id}/complete`),
};

export const backlogApi = {
  getBacklogItems: (params?: { projectId?: string; status?: string; type?: string; priority?: string; assignee?: string }) =>
    api.get<unknown, ApiResponse<BacklogItem[]>>('/backlog', { params }),

  getBacklogItem: (id: string) =>
    api.get<unknown, ApiResponse<BacklogItem>>(`/backlog/${id}`),

  createBacklogItem: (data: Omit<BacklogItem, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'sprintId' | 'sort'>) =>
    api.post<unknown, ApiResponse<BacklogItem>>('/backlog', data),

  updateBacklogItem: (id: string, data: Partial<BacklogItem>) =>
    api.put<unknown, ApiResponse<BacklogItem>>(`/backlog/${id}`, data),

  deleteBacklogItem: (id: string) =>
    api.delete<unknown, ApiResponse<null>>(`/backlog/${id}`),

  batchDelete: (ids: string[]) =>
    api.post<unknown, ApiResponse<null>>('/backlog/batch/delete', { ids }),

  batchUpdateStatus: (ids: string[], status: BacklogItem['status']) =>
    api.post<unknown, ApiResponse<null>>('/backlog/batch/update-status', { ids, status }),

  addToSprint: (id: string, sprintId: string) =>
    api.post<unknown, ApiResponse<null>>(`/backlog/${id}/add-to-sprint`, { sprintId }),

  removeFromSprint: (id: string) =>
    api.post<unknown, ApiResponse<null>>(`/backlog/${id}/remove-from-sprint`),

  convertToTask: (id: string) =>
    api.post<unknown, ApiResponse<{ taskId: string }>>(`/backlog/${id}/convert-to-task`),
};

export const versionApi = {
  getVersions: (params?: { projectId?: string; type?: string; status?: string }) =>
    api.get<unknown, ApiResponse<Version[]>>('/versions', { params }),

  getVersion: (id: string) =>
    api.get<unknown, ApiResponse<Version>>(`/versions/${id}`),

  createVersion: (data: Omit<Version, 'id' | 'createdAt' | 'updatedAt' | 'status'>) =>
    api.post<unknown, ApiResponse<Version>>('/versions', data),

  updateVersion: (id: string, data: Partial<Version>) =>
    api.put<unknown, ApiResponse<Version>>(`/versions/${id}`, data),

  deleteVersion: (id: string) =>
    api.delete<unknown, ApiResponse<null>>(`/versions/${id}`),

  addTasksToVersion: (id: string, taskIds: string[]) =>
    api.post<unknown, ApiResponse<null>>(`/versions/${id}/tasks`, { taskIds }),

  removeTasksFromVersion: (id: string, taskIds: string[]) =>
    api.delete<unknown, ApiResponse<null>>(`/versions/${id}/tasks`, { data: { taskIds } }),
};
