import axios from '@/utils/axios';
import type { ApiResponse, PaginatedResponse, User, UserRole } from '@/types';

export interface UserQueryParams {
  role?: UserRole;
  gradeId?: string;
  classId?: string;
  keyword?: string;
  page?: number;
  pageSize?: number;
}

export interface CreateUserParams {
  username: string;
  password: string;
  name: string;
  role: UserRole;
  email?: string;
  phone?: string;
  studentNo?: string;
  teacherNo?: string;
  gradeId?: string;
  classId?: string;
}

export interface UpdateUserParams {
  name?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  studentNo?: string;
  teacherNo?: string;
  gradeId?: string;
  classId?: string;
  isActive?: boolean;
}

export const userApi = {
  getUsers: async (params?: UserQueryParams): Promise<ApiResponse<PaginatedResponse<User>>> => {
    const response = await axios.get('/users', { params });
    return response.data;
  },

  getTeachers: async (): Promise<ApiResponse<User[]>> => {
    const response = await axios.get('/users/teachers');
    return response.data;
  },

  getUserById: async (id: string): Promise<ApiResponse<User>> => {
    const response = await axios.get(`/users/${id}`);
    return response.data;
  },

  createUser: async (data: CreateUserParams): Promise<ApiResponse<User>> => {
    const response = await axios.post('/users', data);
    return response.data;
  },

  updateUser: async (id: string, data: UpdateUserParams): Promise<ApiResponse> => {
    const response = await axios.put(`/users/${id}`, data);
    return response.data;
  },

  deleteUser: async (id: string): Promise<ApiResponse> => {
    const response = await axios.delete(`/users/${id}`);
    return response.data;
  },

  toggleStatus: async (id: string): Promise<ApiResponse<{ isActive: boolean }>> => {
    const response = await axios.post(`/users/${id}/toggle-status`);
    return response.data;
  },

  resetPassword: async (id: string, newPassword: string): Promise<ApiResponse> => {
    const response = await axios.post(`/users/${id}/reset-password`, { newPassword });
    return response.data;
  },
};
