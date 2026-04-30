import api from './index'
import type { User, ApiResponse } from '@/types'

export const authApi = {
  login: (data: { username: string; password: string }) => {
    return api.post<ApiResponse<{ user: User; token: string }>>('/auth/login', data)
  },
  
  adminLogin: (data: { username: string; password: string }) => {
    return api.post<ApiResponse<{ user: User; token: string }>>('/admin/auth/login', data)
  },
  
  getProfile: () => {
    return api.get<ApiResponse<User>>('/auth/profile')
  },
  
  updateProfile: (data: Partial<User>) => {
    return api.put<ApiResponse<User>>('/auth/profile', data)
  },
}

export const userApi = {
  getUsers: (params?: { keyword?: string; page?: number; pageSize?: number }) => {
    return api.get<ApiResponse<{ users: User[]; total: number }>>('/admin/users', { params })
  },
  
  createUser: (data: Partial<User>) => {
    return api.post<ApiResponse<User>>('/admin/users', data)
  },
  
  updateUser: (id: number, data: Partial<User>) => {
    return api.put<ApiResponse<User>>(`/admin/users/${id}`, data)
  },
  
  deleteUser: (id: number) => {
    return api.delete<ApiResponse<void>>(`/admin/users/${id}`)
  },
}
