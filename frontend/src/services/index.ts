import request from '@/utils/request'
import type { ApiResponse, PageResult, User, Group, Project, Api, ProjectMember, LoginLog } from '@/types'

export interface LoginParams {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  user: User
}

export const authApi = {
  login: (params: LoginParams) =>
    request.post<ApiResponse<LoginResponse>>('/auth/login', params),
  logout: () => request.post<ApiResponse>('/auth/logout'),
  getProfile: () => request.get<ApiResponse<User>>('/auth/profile'),
  updateProfile: (data: Partial<User>) =>
    request.put<ApiResponse>('/auth/profile', data),
  changePassword: (oldPassword: string, newPassword: string) =>
    request.put<ApiResponse>('/auth/password', { oldPassword, newPassword })
}

export const userApi = {
  getList: (params: {
    page?: number
    pageSize?: number
    keyword?: string
    role?: string
    status?: string
  }) => request.get<ApiResponse<PageResult<User>>>('/users', { params }),
  create: (data: Partial<User>) =>
    request.post<ApiResponse<{ id: number }>>('/users', data),
  update: (id: number, data: Partial<User>) =>
    request.put<ApiResponse>(`/users/${id}`, data),
  batchAction: (ids: number[], action: string) =>
    request.post<ApiResponse>('/users/batch-action', { ids, action }),
  delete: (id: number) => request.delete<ApiResponse>(`/users/${id}`)
}

export const groupApi = {
  getList: () => request.get<ApiResponse<Group[]>>('/groups'),
  getAll: () => request.get<ApiResponse<Group[]>>('/groups/all'),
  getDetail: (id: number) => request.get<ApiResponse<Group>>(`/groups/${id}`),
  create: (data: Partial<Group>) =>
    request.post<ApiResponse<{ id: number }>>('/groups', data),
  update: (id: number, data: Partial<Group>) =>
    request.put<ApiResponse>(`/groups/${id}`, data),
  delete: (id: number) => request.delete<ApiResponse>(`/groups/${id}`),
  archive: (id: number) => request.post<ApiResponse>(`/groups/${id}/archive`),
  unarchive: (id: number) => request.post<ApiResponse>(`/groups/${id}/unarchive`),
  getMembers: (id: number) => request.get<ApiResponse<User[]>>(`/groups/${id}/members`)
}

export const projectApi = {
  getList: (params: {
    page?: number
    pageSize?: number
    groupId?: number
    keyword?: string
  }) => request.get<ApiResponse<PageResult<Project>>>('/projects', { params }),
  getDetail: (id: number) => request.get<ApiResponse<Project>>(`/projects/${id}`),
  create: (data: Partial<Project>) =>
    request.post<ApiResponse<{ id: number }>>('/projects', data),
  update: (id: number, data: Partial<Project>) =>
    request.put<ApiResponse>(`/projects/${id}`, data),
  delete: (id: number) => request.delete<ApiResponse>(`/projects/${id}`),
  getMembers: (id: number) => request.get<ApiResponse<ProjectMember[]>>(`/projects/${id}/members`),
  addMembers: (id: number, userIds: number[], role: string) =>
    request.post<ApiResponse>(`/projects/${id}/members`, { userIds, role }),
  removeMember: (id: number, userId: number) =>
    request.delete<ApiResponse>(`/projects/${id}/members/${userId}`)
}

export const apiApi = {
  getList: (params: {
    page?: number
    pageSize?: number
    projectId: number
    keyword?: string
    method?: string
    status?: string
  }) => request.get<ApiResponse<PageResult<Api>>>('/apis', { params }),
  getDetail: (id: number) => request.get<ApiResponse<Api>>(`/apis/${id}`),
  create: (data: Partial<Api>) =>
    request.post<ApiResponse<{ id: number }>>('/apis', data),
  update: (id: number, data: Partial<Api>) =>
    request.put<ApiResponse>(`/apis/${id}`, data),
  delete: (id: number) => request.delete<ApiResponse>(`/apis/${id}`),
  batchDelete: (ids: number[]) =>
    request.post<ApiResponse>('/apis/batch-delete', { ids })
}

export const logApi = {
  getLoginLogs: (params: {
    page?: number
    pageSize?: number
    username?: string
    status?: string
    startDate?: string
    endDate?: string
  }) => request.get<ApiResponse<PageResult<LoginLog>>>('/logs/login', { params }),
  getMyLoginLogs: (params: { page?: number; pageSize?: number }) =>
    request.get<ApiResponse<PageResult<LoginLog>>>('/logs/login/mine', { params }),
  getStatistics: () => request.get<ApiResponse<any>>('/logs/statistics')
}
