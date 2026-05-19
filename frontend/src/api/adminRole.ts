import request from './request';
import type { Role, Permission, AdminUser } from '@/types';

export const getRoles = () => {
  return request.get<Role[]>('/admin/roles');
};

export const getPermissions = () => {
  return request.get<Permission[]>('/admin/permissions');
};

export const createRole = (data: {
  name: string;
  code: string;
  description?: string;
  permissionIds: string[];
}) => {
  return request.post<Role>('/admin/roles', data);
};

export const updateRole = (
  roleId: string,
  data: Partial<Role> & { permissionIds?: string[] }
) => {
  return request.put<Role>(`/admin/roles/${roleId}`, data);
};

export const deleteRole = (roleId: string) => {
  return request.delete<{ message: string }>(`/admin/roles/${roleId}`);
};

export const getAdminUsers = (params?: { page?: number; pageSize?: number }) => {
  return request.get<{
    admins: AdminUser[];
    total: number;
  }>('/admin/admins', { params });
};

export const createAdminUser = (data: {
  username: string;
  password: string;
  nickname: string;
  email?: string;
  phone?: string;
  roleIds: string[];
}) => {
  return request.post<AdminUser>('/admin/admins', data);
};
