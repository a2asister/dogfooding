import { AppDataSource } from '../config/database';
import { Role } from '../entities/Role';
import { Permission, PermissionType } from '../entities/Permission';
import { AdminUser, AdminStatus } from '../entities/AdminUser';
import bcrypt from 'bcryptjs';

export const initializeDefaultRoles = async (): Promise<void> => {
  const roleRepository = AppDataSource.getRepository(Role);
  const permissionRepository = AppDataSource.getRepository(Permission);
  const adminUserRepository = AppDataSource.getRepository(AdminUser);

  const existingPermissions = await permissionRepository.count();
  if (existingPermissions === 0) {
    const permissions = [
      { name: '用户管理', code: 'user:manage', type: PermissionType.MENU, path: '/users', icon: 'users' },
      { name: '查看用户', code: 'user:view', type: PermissionType.BUTTON },
      { name: '编辑用户', code: 'user:edit', type: PermissionType.BUTTON },
      { name: '删除用户', code: 'user:delete', type: PermissionType.BUTTON },
      
      { name: '内容管理', code: 'content:manage', type: PermissionType.MENU, path: '/content', icon: 'file-text' },
      { name: '查看内容', code: 'content:view', type: PermissionType.BUTTON },
      { name: '编辑内容', code: 'content:edit', type: PermissionType.BUTTON },
      { name: '删除内容', code: 'content:delete', type: PermissionType.BUTTON },
      
      { name: '内容审核', code: 'review:manage', type: PermissionType.MENU, path: '/review', icon: 'check-circle' },
      { name: '审核任务', code: 'review:task', type: PermissionType.BUTTON },
      { name: '批量审核', code: 'review:batch', type: PermissionType.BUTTON },
      
      { name: '评论管理', code: 'comment:manage', type: PermissionType.MENU, path: '/comments', icon: 'message' },
      { name: '删除评论', code: 'comment:delete', type: PermissionType.BUTTON },
      
      { name: '话题管理', code: 'topic:manage', type: PermissionType.MENU, path: '/topics', icon: 'hash' },
      { name: '编辑话题', code: 'topic:edit', type: PermissionType.BUTTON },
      { name: '删除话题', code: 'topic:delete', type: PermissionType.BUTTON },
      
      { name: '运营管理', code: 'operation:manage', type: PermissionType.MENU, path: '/operation', icon: 'trending-up' },
      { name: 'Banner管理', code: 'banner:manage', type: PermissionType.BUTTON },
      { name: '热门榜单', code: 'rank:manage', type: PermissionType.BUTTON },
      { name: '流量扶持', code: 'flow:manage', type: PermissionType.BUTTON },
      
      { name: '风控中心', code: 'risk:manage', type: PermissionType.MENU, path: '/risk', icon: 'shield' },
      { name: '行为风控', code: 'risk:behavior', type: PermissionType.BUTTON },
      { name: '账号风控', code: 'risk:account', type: PermissionType.BUTTON },
      { name: '登录日志', code: 'risk:login:log', type: PermissionType.BUTTON },
      { name: '注册日志', code: 'risk:register:log', type: PermissionType.BUTTON },
      
      { name: '创作者管理', code: 'creator:manage', type: PermissionType.MENU, path: '/creators', icon: 'award' },
      { name: '达人认证', code: 'verification:manage', type: PermissionType.BUTTON },
      { name: '数据中心', code: 'creator:data', type: PermissionType.BUTTON },
      
      { name: '系统管理', code: 'system:manage', type: PermissionType.MENU, path: '/system', icon: 'settings' },
      { name: '角色管理', code: 'role:manage', type: PermissionType.BUTTON },
      { name: '权限管理', code: 'permission:manage', type: PermissionType.BUTTON },
      { name: '管理员管理', code: 'admin:manage', type: PermissionType.BUTTON },
      
      { name: '审核日志', code: 'log:review', type: PermissionType.API },
      { name: '操作日志', code: 'log:operation', type: PermissionType.API },
    ];

    const savedPermissions = await permissionRepository.save(permissions);
    console.log(`已创建 ${savedPermissions.length} 个权限`);

    const superAdminRole = roleRepository.create({
      name: '超级管理员',
      code: 'super_admin',
      description: '拥有所有权限',
      isSystem: true,
      permissions: savedPermissions,
    });
    await roleRepository.save(superAdminRole);

    const adminRole = roleRepository.create({
      name: '管理员',
      code: 'admin',
      description: '常规管理员',
      isSystem: true,
      permissions: savedPermissions.filter(p => !p.code.startsWith('system:')),
    });
    await roleRepository.save(adminRole);

    const contentAuditorRole = roleRepository.create({
      name: '内容审核员',
      code: 'content_auditor',
      description: '负责内容审核',
      isSystem: true,
      permissions: savedPermissions.filter(p => 
        p.code.startsWith('review:') || 
        p.code.startsWith('content:view') ||
        p.code.startsWith('comment:')
      ),
    });
    await roleRepository.save(contentAuditorRole);

    const operationRole = roleRepository.create({
      name: '运营专员',
      code: 'operation',
      description: '负责运营管理',
      isSystem: true,
      permissions: savedPermissions.filter(p => 
        p.code.startsWith('operation:') || 
        p.code.startsWith('topic:') ||
        p.code.startsWith('creator:')
      ),
    });
    await roleRepository.save(operationRole);

    const riskOfficerRole = roleRepository.create({
      name: '风控专员',
      code: 'risk_officer',
      description: '负责风控管理',
      isSystem: true,
      permissions: savedPermissions.filter(p => p.code.startsWith('risk:')),
    });
    await roleRepository.save(riskOfficerRole);

    console.log('已创建 5 个默认角色');

    const existingSuperAdmin = await adminUserRepository.findOne({ where: { isSuperAdmin: true } });
    if (!existingSuperAdmin) {
      const hashedPassword = await bcrypt.hash(process.env.SUPER_ADMIN_PASSWORD || 'superadmin123', 10);
      const superAdmin = adminUserRepository.create({
        username: 'superadmin',
        password: hashedPassword,
        nickname: '超级管理员',
        email: 'superadmin@example.com',
        isSuperAdmin: true,
        status: AdminStatus.ACTIVE,
        roles: [superAdminRole],
      });
      await adminUserRepository.save(superAdmin);
      console.log('已创建超级管理员账号: superadmin / superadmin123');
    }
  }
};

export const createRole = async (name: string, code: string, description: string, permissionIds: string[]): Promise<Role> => {
  const roleRepository = AppDataSource.getRepository(Role);
  const permissionRepository = AppDataSource.getRepository(Permission);

  const permissions = await permissionRepository.findByIds(permissionIds);
  
  const role = roleRepository.create({
    name,
    code,
    description,
    permissions,
  });

  return await roleRepository.save(role);
};

export const updateRole = async (roleId: string, updates: Partial<Role>, permissionIds?: string[]): Promise<Role> => {
  const roleRepository = AppDataSource.getRepository(Role);
  const permissionRepository = AppDataSource.getRepository(Permission);

  const role = await roleRepository.findOne({ where: { id: roleId } });
  if (!role) {
    throw new Error('角色不存在');
  }

  if (role.isSystem) {
    throw new Error('系统角色不可修改');
  }

  if (permissionIds) {
    const permissions = await permissionRepository.findByIds(permissionIds);
    role.permissions = permissions;
  }

  Object.assign(role, updates);
  return await roleRepository.save(role);
};

export const deleteRole = async (roleId: string): Promise<void> => {
  const roleRepository = AppDataSource.getRepository(Role);

  const role = await roleRepository.findOne({ where: { id: roleId } });
  if (!role) {
    throw new Error('角色不存在');
  }

  if (role.isSystem) {
    throw new Error('系统角色不可删除');
  }

  await roleRepository.delete(roleId);
};

export const getRoles = async (): Promise<Role[]> => {
  const roleRepository = AppDataSource.getRepository(Role);
  return await roleRepository.find({ relations: ['permissions'] });
};

export const getPermissions = async (): Promise<Permission[]> => {
  const permissionRepository = AppDataSource.getRepository(Permission);
  return await permissionRepository.find({ order: { sort: 'ASC' } });
};

export const createAdminUser = async (
  username: string,
  password: string,
  nickname: string,
  email: string,
  phone: string,
  roleIds: string[]
): Promise<AdminUser> => {
  const adminUserRepository = AppDataSource.getRepository(AdminUser);
  const roleRepository = AppDataSource.getRepository(Role);

  const hashedPassword = await bcrypt.hash(password, 10);
  const roles = await roleRepository.findByIds(roleIds);

  const admin = adminUserRepository.create({
    username,
    password: hashedPassword,
    nickname,
    email,
    phone,
    roles,
  });

  return await adminUserRepository.save(admin);
};

export const getAdminUsers = async (page: number = 1, pageSize: number = 20): Promise<{ admins: AdminUser[]; total: number }> => {
  const adminUserRepository = AppDataSource.getRepository(AdminUser);
  
  const [admins, total] = await adminUserRepository.findAndCount({
    relations: ['roles'],
    order: { createdAt: 'DESC' },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  return { admins, total };
};
