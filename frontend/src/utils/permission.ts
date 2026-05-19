import { Role } from '@/types'

export const roleLabels: Record<Role, string> = {
  [Role.SUPER_ADMIN]: '超级管理员',
  [Role.GROUP_ADMIN]: '分组管理员',
  [Role.PROJECT_ADMIN]: '项目管理员',
  [Role.MEMBER]: '普通成员',
  [Role.GUEST]: '访客'
}

export const roleColors: Record<Role, string> = {
  [Role.SUPER_ADMIN]: 'red',
  [Role.GROUP_ADMIN]: 'orange',
  [Role.PROJECT_ADMIN]: 'blue',
  [Role.MEMBER]: 'green',
  [Role.GUEST]: 'default'
}

export function hasPermission(userRole: Role | undefined, requiredRoles: Role[]): boolean {
  if (!userRole) return false
  return requiredRoles.includes(userRole)
}

export function isSuperAdmin(role: Role | undefined): boolean {
  return role === Role.SUPER_ADMIN
}

export function isGroupAdmin(role: Role | undefined): boolean {
  return role === Role.SUPER_ADMIN || role === Role.GROUP_ADMIN
}

export function isProjectAdmin(role: Role | undefined): boolean {
  return role === Role.SUPER_ADMIN || role === Role.GROUP_ADMIN || role === Role.PROJECT_ADMIN
}

export function canManageUsers(role: Role | undefined): boolean {
  return isGroupAdmin(role)
}

export function canManageGroups(role: Role | undefined): boolean {
  return isSuperAdmin(role)
}

export function canCreateProject(role: Role | undefined): boolean {
  return isGroupAdmin(role)
}

export function canEditProject(role: Role | undefined, isMemberAdmin: boolean): boolean {
  return isGroupAdmin(role) || isMemberAdmin
}

export function canManageProjectMembers(role: Role | undefined, isMemberAdmin: boolean): boolean {
  return isGroupAdmin(role) || isMemberAdmin
}

export function canEditApi(role: Role | undefined, isMemberAdmin: boolean, isMember: boolean): boolean {
  return isGroupAdmin(role) || isMemberAdmin || isMember
}

export function canDeleteApi(role: Role | undefined, isMemberAdmin: boolean): boolean {
  return isGroupAdmin(role) || isMemberAdmin
}
