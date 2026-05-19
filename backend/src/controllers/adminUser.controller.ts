import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { AdminUser, AdminStatus } from '../entities/AdminUser';
import { Role } from '../entities/Role';
import { In } from 'typeorm';
import * as bcrypt from 'bcryptjs';

const adminUserRepository = AppDataSource.getRepository(AdminUser);
const roleRepository = AppDataSource.getRepository(Role);

export const getAdminUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, pageSize = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(pageSize);

    const [admins, total] = await adminUserRepository.findAndCount({
      relations: ['roles'],
      order: { createdAt: 'DESC' },
      skip,
      take: Number(pageSize),
    });

    const adminsWithoutPassword = admins.map(admin => {
      const { password, ...rest } = admin;
      return rest;
    });

    res.json({
      admins: adminsWithoutPassword,
      total,
      page: Number(page),
      pageSize: Number(pageSize),
    });
  } catch (error) {
    console.error('获取管理员列表错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const createAdminUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password, nickname, email, phone, roleIds } = req.body;

    if (!username || !password || !nickname) {
      res.status(400).json({ message: '用户名、密码和昵称不能为空' });
      return;
    }

    const existingAdmin = await adminUserRepository.findOne({
      where: [{ username }, { email }, { phone }],
    });
    if (existingAdmin) {
      res.status(400).json({ message: '用户名、邮箱或手机号已存在' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const roles = roleIds && roleIds.length > 0
      ? await roleRepository.findBy({ id: In(roleIds) })
      : [];

    const admin = adminUserRepository.create({
      username,
      password: hashedPassword,
      nickname,
      email,
      phone,
      roles,
      status: AdminStatus.ACTIVE,
    });

    await adminUserRepository.save(admin);

    const { password: _, ...adminWithoutPassword } = admin;
    res.json(adminWithoutPassword);
  } catch (error) {
    console.error('创建管理员错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const updateAdminUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { nickname, email, phone, roleIds, status } = req.body;

    const admin = await adminUserRepository.findOne({ where: { id } });
    if (!admin) {
      res.status(404).json({ message: '管理员不存在' });
      return;
    }

    if (admin.isSuperAdmin) {
      res.status(400).json({ message: '超级管理员不可修改' });
      return;
    }

    if (nickname) admin.nickname = nickname;
    if (email !== undefined) admin.email = email;
    if (phone !== undefined) admin.phone = phone;
    if (status) admin.status = status;

    if (roleIds) {
      admin.roles = roleIds.length > 0
        ? await roleRepository.findBy({ id: In(roleIds) })
        : [];
    }

    await adminUserRepository.save(admin);

    const { password: _, ...adminWithoutPassword } = admin;
    res.json(adminWithoutPassword);
  } catch (error) {
    console.error('更新管理员错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const deleteAdminUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const admin = await adminUserRepository.findOne({ where: { id } });
    if (!admin) {
      res.status(404).json({ message: '管理员不存在' });
      return;
    }

    if (admin.isSuperAdmin) {
      res.status(400).json({ message: '超级管理员不可删除' });
      return;
    }

    await adminUserRepository.delete(id);
    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除管理员错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};
