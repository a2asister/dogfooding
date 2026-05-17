import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/database';
import { User, UserRole } from '../entities/User';
import { In } from 'typeorm';

const userRepository = AppDataSource.getRepository(User);

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone, username, password, nickname } = req.body;

    if (!phone && !username) {
      res.status(400).json({ message: '手机号或用户名至少提供一个' });
      return;
    }

    if (!password) {
      res.status(400).json({ message: '密码不能为空' });
      return;
    }

    const existingUser = await userRepository.findOne({
      where: [{ phone }, { username }],
    });

    if (existingUser) {
      res.status(400).json({ message: '手机号或用户名已存在' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = userRepository.create({
      phone,
      username,
      password: hashedPassword,
      nickname: nickname || `用户${Math.floor(Math.random() * 10000)}`,
      role: UserRole.USER,
    });

    await userRepository.save(user);

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any }
    );

    res.status(201).json({
      message: '注册成功',
      token,
      user: {
        id: user.id,
        phone: user.phone,
        username: user.username,
        nickname: user.nickname,
        avatar: user.avatar,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone, username, password } = req.body;

    if ((!phone && !username) || !password) {
      res.status(400).json({ message: '请提供完整的登录信息' });
      return;
    }

    const user = await userRepository.findOne({
      where: [{ phone }, { username }],
    });

    if (!user) {
      res.status(401).json({ message: '用户不存在' });
      return;
    }

    if (!user.isActive) {
      res.status(401).json({ message: '账号已被禁用' });
      return;
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      res.status(401).json({ message: '密码错误' });
      return;
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any }
    );

    res.json({
      message: '登录成功',
      token,
      user: {
        id: user.id,
        phone: user.phone,
        username: user.username,
        nickname: user.nickname,
        avatar: user.avatar,
        bio: user.bio,
        role: user.role,
        followerCount: user.followerCount,
        followingCount: user.followingCount,
        noteCount: user.noteCount,
      },
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const phoneLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone, code } = req.body;

    if (!phone) {
      res.status(400).json({ message: '请提供手机号' });
      return;
    }

    if (code !== '123456') {
      res.status(400).json({ message: '验证码错误' });
      return;
    }

    let user = await userRepository.findOne({ where: { phone } });

    if (!user) {
      user = userRepository.create({
        phone,
        nickname: `用户${Math.floor(Math.random() * 10000)}`,
        role: UserRole.USER,
      });
      await userRepository.save(user);
    }

    if (!user.isActive) {
      res.status(401).json({ message: '账号已被禁用' });
      return;
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any }
    );

    res.json({
      message: '登录成功',
      token,
      user: {
        id: user.id,
        phone: user.phone,
        username: user.username,
        nickname: user.nickname,
        avatar: user.avatar,
        bio: user.bio,
        role: user.role,
        followerCount: user.followerCount,
        followingCount: user.followingCount,
        noteCount: user.noteCount,
      },
    });
  } catch (error) {
    console.error('手机号登录错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    res.json({
      user: {
        id: req.user.id,
        phone: req.user.phone,
        username: req.user.username,
        nickname: req.user.nickname,
        avatar: req.user.avatar,
        bio: req.user.bio,
        role: req.user.role,
        followerCount: req.user.followerCount,
        followingCount: req.user.followingCount,
        noteCount: req.user.noteCount,
      },
    });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};
