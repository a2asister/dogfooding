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
  id: number;
  username: string;
  email: string;
  password: string;
  nickname: string;
  avatar?: string;
  phone?: string;
  role: Role;
  groupId?: number;
  status: 'active' | 'disabled';
  createdAt: string;
  updatedAt: string;
}

export interface Group {
  id: number;
  name: string;
  description?: string;
  leaderId: number;
  status: 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: number;
  name: string;
  description?: string;
  leaderId: number;
  groupId: number;
  baseUrl: string;
  status: ProjectStatus;
  globalHeaders?: string;
  globalParams?: string;
  timeout: number;
  responseFormat: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectMember {
  id: number;
  projectId: number;
  userId: number;
  role: Role;
  createdAt: string;
}

export interface Api {
  id: number;
  projectId: number;
  name: string;
  description?: string;
  method: ApiMethod;
  path: string;
  requestHeaders?: string;
  requestParams?: string;
  requestBody?: string;
  responseBody?: string;
  mockEnabled: number;
  mockData?: string;
  status: 'draft' | 'published';
  createdBy: number;
  updatedBy: number;
  createdAt: string;
  updatedAt: string;
}

export interface LoginLog {
  id: number;
  userId: number;
  username: string;
  ip: string;
  userAgent: string;
  device: string;
  loginTime: string;
  status: 'success' | 'failed';
}

export interface TokenPayload {
  id: number;
  username: string;
  role: Role;
}
