export enum Role {
  SUPER_ADMIN = 'super_admin',
  GROUP_ADMIN = 'group_admin',
  PROJECT_ADMIN = 'project_admin',
  MEMBER = 'member',
  GUEST = 'guest'
}

export enum ProjectStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived'
}

export enum ApiMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
  HEAD = 'HEAD',
  OPTIONS = 'OPTIONS'
}

export interface User {
  id: number
  username: string
  email: string
  nickname: string
  avatar?: string
  phone?: string
  role: Role
  groupId?: number
  groupName?: string
  status: 'active' | 'disabled'
  createdAt: string
  updatedAt: string
}

export interface Group {
  id: number
  name: string
  description?: string
  leaderId: number
  leaderName?: string
  status: 'active' | 'archived'
  createdAt: string
  updatedAt: string
}

export interface Project {
  id: number
  name: string
  description?: string
  leaderId: number
  leaderName?: string
  groupId: number
  groupName?: string
  baseUrl: string
  status: ProjectStatus
  globalHeaders?: string
  globalParams?: string
  timeout: number
  responseFormat: string
  createdAt: string
  updatedAt: string
}

export interface ProjectMember {
  id: number
  projectId: number
  userId: number
  username?: string
  nickname?: string
  email?: string
  avatar?: string
  role: Role
  status?: string
  createdAt: string
}

export interface Api {
  id: number
  projectId: number
  name: string
  description?: string
  method: ApiMethod
  path: string
  requestHeaders?: string
  requestParams?: string
  requestBody?: string
  responseBody?: string
  mockEnabled: number
  mockData?: string
  status: 'draft' | 'published'
  createdBy: number
  creatorName?: string
  updatedBy: number
  createdAt: string
  updatedAt: string
}

export interface LoginLog {
  id: number
  userId: number
  username: string
  ip: string
  userAgent: string
  device: string
  loginTime: string
  status: 'success' | 'failed'
}

export interface AuthState {
  token: string | null
  user: User | null
  login: (token: string, user: User) => void
  logout: () => void
  updateUser: (user: Partial<User>) => void
}

export interface ApiResponse<T = unknown> {
  code: number
  data: T
  message: string
}

export interface PageResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}
