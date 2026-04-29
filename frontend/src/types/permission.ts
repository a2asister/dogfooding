export interface Permission {
  id: string
  key: string
  name: string
  description: string
  category: 'project' | 'issue' | 'comment' | 'worklog' | 'attachment' | 'admin'
  isSystem: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Role {
  id: string
  projectId?: string
  name: string
  description?: string
  isSystem: boolean
  isActive: boolean
  permissionIds: string[]
  sortOrder: number
  createdAt: Date
  updatedAt: Date
}

export interface ProjectMember {
  id: string
  projectId: string
  userId: string
  roleId: string
  isActive: boolean
  joinedAt: Date
  leftAt?: Date
}

export interface PermissionScope {
  type: 'project' | 'issue' | 'custom'
  projectId?: string
  issueId?: string
  filters?: Record<string, unknown>
}

export interface UserPermission {
  userId: string
  projectId?: string
  permissions: string[]
  scope?: PermissionScope
}

export const SYSTEM_PERMISSIONS: Omit<Permission, 'id' | 'createdAt' | 'updatedAt'>[] = [
  { key: 'admin', name: '管理员权限', description: '拥有项目的所有管理权限', category: 'admin', isSystem: true },
  { key: 'project_edit', name: '编辑项目', description: '可以编辑项目基本信息', category: 'project', isSystem: true },
  { key: 'project_delete', name: '删除项目', description: '可以删除项目', category: 'project', isSystem: true },
  { key: 'member_manage', name: '管理成员', description: '可以添加、移除项目成员，分配角色', category: 'project', isSystem: true },
  
  { key: 'issue_create', name: '创建事项', description: '可以创建新的事项', category: 'issue', isSystem: true },
  { key: 'issue_edit', name: '编辑事项', description: '可以编辑事项信息', category: 'issue', isSystem: true },
  { key: 'issue_delete', name: '删除事项', description: '可以删除事项', category: 'issue', isSystem: true },
  { key: 'issue_assign', name: '分配事项', description: '可以分配事项负责人', category: 'issue', isSystem: true },
  { key: 'issue_transition', name: '状态流转', description: '可以更改事项状态', category: 'issue', isSystem: true },
  { key: 'issue_link', name: '关联事项', description: '可以创建和移除事项关联', category: 'issue', isSystem: true },
  { key: 'issue_move', name: '移动事项', description: '可以在项目间或模块间移动事项', category: 'issue', isSystem: true },
  { key: 'issue_bulk_edit', name: '批量编辑', description: '可以批量编辑多个事项', category: 'issue', isSystem: true },
  
  { key: 'comment_create', name: '添加评论', description: '可以添加评论', category: 'comment', isSystem: true },
  { key: 'comment_edit', name: '编辑评论', description: '可以编辑自己的评论', category: 'comment', isSystem: true },
  { key: 'comment_delete', name: '删除评论', description: '可以删除评论', category: 'comment', isSystem: true },
  { key: 'comment_edit_all', name: '编辑所有评论', description: '可以编辑任何人的评论', category: 'comment', isSystem: true },
  { key: 'comment_delete_all', name: '删除所有评论', description: '可以删除任何人的评论', category: 'comment', isSystem: true },
  
  { key: 'worklog_create', name: '记录工时', description: '可以记录工时', category: 'worklog', isSystem: true },
  { key: 'worklog_edit', name: '编辑工时', description: '可以编辑自己的工时记录', category: 'worklog', isSystem: true },
  { key: 'worklog_delete', name: '删除工时', description: '可以删除工时记录', category: 'worklog', isSystem: true },
  { key: 'worklog_edit_all', name: '编辑所有工时', description: '可以编辑任何人的工时记录', category: 'worklog', isSystem: true },
  
  { key: 'attachment_create', name: '上传附件', description: '可以上传附件', category: 'attachment', isSystem: true },
  { key: 'attachment_delete', name: '删除附件', description: '可以删除附件', category: 'attachment', isSystem: true },
  
  { key: 'sprint_manage', name: '管理迭代', description: '可以创建、启动、完成迭代', category: 'project', isSystem: true },
  { key: 'version_manage', name: '管理版本', description: '可以创建、发布版本', category: 'project', isSystem: true },
  { key: 'workflow_manage', name: '管理工作流', description: '可以配置工作流', category: 'project', isSystem: true },
  { key: 'field_manage', name: '管理自定义字段', description: '可以配置自定义字段', category: 'project', isSystem: true },
  { key: 'role_manage', name: '管理角色', description: '可以创建和编辑角色', category: 'project', isSystem: true },
  { key: 'report_view', name: '查看报表', description: '可以查看项目报表', category: 'project', isSystem: true },
  { key: 'filter_manage', name: '管理筛选器', description: '可以创建和共享筛选器', category: 'project', isSystem: true },
]

export const SYSTEM_ROLES: Omit<Role, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>[] = [
  { name: '项目管理员', description: '拥有项目的所有权限', isSystem: true, isActive: true, sortOrder: 1, permissionIds: [] },
  { name: '开发人员', description: '可以创建和编辑事项，记录工时', isSystem: true, isActive: true, sortOrder: 2, permissionIds: [] },
  { name: '测试人员', description: '可以创建和编辑测试用例、缺陷', isSystem: true, isActive: true, sortOrder: 3, permissionIds: [] },
  { name: '产品经理', description: '可以创建和编辑需求，管理迭代', isSystem: true, isActive: true, sortOrder: 4, permissionIds: [] },
  { name: '查看者', description: '只能查看项目内容', isSystem: true, isActive: true, sortOrder: 5, permissionIds: [] },
]
