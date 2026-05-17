import request from './request';
import type { LoginParams, PhoneLoginParams, RegisterParams, User } from '@/types';

export const login = (data: LoginParams) => {
  return request.post<{ token: string; user: User }>('/auth/login', data);
};

export const phoneLogin = (data: PhoneLoginParams) => {
  return request.post<{ token: string; user: User }>('/auth/phone-login', data);
};

export const register = (data: RegisterParams) => {
  return request.post<{ token: string; user: User }>('/auth/register', data);
};

export const getCurrentUser = () => {
  return request.get<{ user: User }>('/auth/me');
};
