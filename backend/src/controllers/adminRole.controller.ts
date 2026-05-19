import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Role } from '../entities/Role';
import { Permission } from '../entities/Permission';
import { In } from 'typeorm';

const roleRepository = AppDataSource.getRepository(Role);
const permissionRepository = AppDataSource.getRepository(Permission);

export const getRoles = async (_req: Request, res: Response): Promise<void> => {
  try {
    const roles = await roleRepository.find({
      relations: ['permissions'],
      order: { createdAt: 'DESC' },
    });
    res.json(roles);
  } catch (error) {
    console.error('获取角色列表错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const getPermissions = async (_req: Request, res: Response): Promise<void> => {
  try {
    const permissions = await permissionRepository.find({
      relations: ['children'],
      order: { sort: 'ASC', createdAt: 'ASC' },
    });
    
    const rootPermissions = permissions.filter(p => !p.parentId);
    res.json(rootPermissions);
  } catch (error) {
    console.error('获取权限列表错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const createRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, code, description, permissionIds } = req.body;

    const existingRole = await roleRepository.findOne({ where: [{ name }, { code }] });
    if (existingRole) {
      res.status(400).json({ message: '角色名称或编码已存在' });
      return;
    }

    const permissions = permissionIds && permissionIds.length > 0
      ? await permissionRepository.findBy({ id: In(permissionIds) })
      : [];

    const role = roleRepository.create({
      name,
      code,
      description,
      permissions,
    });

    await roleRepository.save(role);

    const savedRole = await roleRepository.findOne({
      where: { id: role.id },
      relations: ['permissions'],
    });

    res.json(savedRole);
  } catch (error) {
    console.error('创建角色错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const updateRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, code, description, permissionIds, isActive } = req.body;

    const role = await roleRepository.findOne({ where: { id } });
    if (!role) {
      res.status(404).json({ message: '角色不存在' });
      return;
    }

    if (role.isSystem) {
      res.status(400).json({ message: '系统内置角色不可修改' });
      return;
    }

    if (name) role.name = name;
    if (code) role.code = code;
    if (description !== undefined) role.description = description;
    if (isActive !== undefined) role.isActive = isActive;

    if (permissionIds) {
      role.permissions = permissionIds.length > 0
        ? await permissionRepository.findBy({ id: In(permissionIds) })
        : [];
    }

    await roleRepository.save(role);

    const updatedRole = await roleRepository.findOne({
      where: { id: role.id },
      relations: ['permissions'],
    });

    res.json(updatedRole);
  } catch (error) {
    console.error('更新角色错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const deleteRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const role = await roleRepository.findOne({ where: { id } });
    if (!role) {
      res.status(404).json({ message: '角色不存在' });
      return;
    }

    if (role.isSystem) {
      res.status(400).json({ message: '系统内置角色不可删除' });
      return;
    }

    await roleRepository.delete(id);
    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除角色错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};
