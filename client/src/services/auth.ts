import axios from '@/utils/axios';
import type { ApiResponse, LoginCredentials, LoginResult, User } from '@/types';

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<ApiResponse<LoginResult>> => {
    const response = await axios.post('/auth/login', credentials);
    return response.data;
  },

  register: async (data: {
    username: string;
    password: string;
    name: string;
    role: 'admin' | 'teacher' | 'student';
    email?: string;
    phone?: string;
  }): Promise<ApiResponse> => {
    const response = await axios.post('/auth/register', data);
    return response.data;
  },

  getProfile: async (): Promise<ApiResponse<User>> => {
    const response = await axios.get('/auth/profile');
    return response.data;
  },

  changePassword: async (data: {
    oldPassword: string;
    newPassword: string;
  }): Promise<ApiResponse> => {
    const response = await axios.post('/auth/change-password', data);
    return response.data;
  },
};
