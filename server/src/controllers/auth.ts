import type { Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../database/init';
import { success, error } from '../utils/response';
import { signToken } from '../utils/jwt';
import type { AuthRequest } from '../middleware/auth';
import type { LoginRequest, RegisterRequest, User } from '../types';
import { logOperation } from '../utils/operationLog';

export async function login(req: AuthRequest, res: Response): Promise<void> {
  const { username, password } = req.body as LoginRequest;

  const user = db
    .prepare('SELECT * FROM users WHERE username = ? OR phone = ?')
    .get(username, username) as User | undefined;

  if (!user) {
    res.json(error('用户名或密码错误'));
    return;
  }

  if (!user.is_active) {
    res.json(error('账号已被禁用'));
    return;
  }

  const isValid = bcrypt.compareSync(password, user.password_hash);
  if (!isValid) {
    res.json(error('用户名或密码错误'));
    return;
  }

  const token = signToken({
    userId: user.id,
    role: user.role,
    username: user.username,
  });

  const { password_hash: _pass, ...userWithoutPassword } = user;

  logOperation(user.id, '登录', 'auth', req.ip);

  res.json(
    success({
      token,
      user: userWithoutPassword,
    })
  );
}

export async function register(req: AuthRequest, res: Response): Promise<void> {
  const { phone, password, real_name, id_card } = req.body as RegisterRequest;

  const existingUser = db.prepare('SELECT id FROM users WHERE phone = ?').get(phone);
  if (existingUser) {
    res.json(error('该手机号已注册'));
    return;
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const username = `patient_${Date.now()}`;

  const result = db
    .prepare(
      'INSERT INTO users (username, password_hash, phone, real_name, id_card, role, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)'
    )
    .run(username, passwordHash, phone, real_name, id_card, 'patient', 1);

  const userId = result.lastInsertRowid as number;

  const token = signToken({
    userId,
    role: 'patient',
    username,
  });

  const user = db
    .prepare(
      'SELECT id, username, phone, real_name, id_card, role, is_active, created_at FROM users WHERE id = ?'
    )
    .get(userId);

  logOperation(userId, '注册', 'auth', req.ip);

  res.json(
    success({
      token,
      user,
    })
  );
}

export async function getProfile(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.json(error('未授权'));
    return;
  }

  const user = db
    .prepare(
      'SELECT u.*, d.name as department_name FROM users u LEFT JOIN departments d ON u.department_id = d.id WHERE u.id = ?'
    )
    .get(req.user.userId);

  if (!user) {
    res.json(error('用户不存在'));
    return;
  }

  const { password_hash: _pass, ...userWithoutPassword } = user as User;
  res.json(success(userWithoutPassword));
}

export async function updatePassword(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.json(error('未授权'));
    return;
  }

  const { oldPassword, newPassword } = req.body as { oldPassword: string; newPassword: string };

  const user = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(req.user.userId) as {
    password_hash: string;
  };

  const isValid = bcrypt.compareSync(oldPassword, user.password_hash);
  if (!isValid) {
    res.json(error('原密码错误'));
    return;
  }

  const passwordHash = bcrypt.hashSync(newPassword, 10);
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(passwordHash, req.user.userId);

  logOperation(req.user.userId, '修改密码', 'auth', req.ip);

  res.json(success(null, '密码修改成功'));
}

export async function updateProfile(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.json(error('未授权'));
    return;
  }

  const { real_name, phone, avatar } = req.body as Partial<User>;

  db.prepare(
    `UPDATE users SET 
      real_name = COALESCE(?, real_name),
      phone = COALESCE(?, phone),
      avatar = COALESCE(?, avatar)
     WHERE id = ?`
  ).run(real_name, phone, avatar, req.user.userId);

  const user = db
    .prepare('SELECT id, username, phone, real_name, avatar, role, created_at FROM users WHERE id = ?')
    .get(req.user.userId);

  logOperation(req.user.userId, '更新个人信息', 'auth', req.ip);

  res.json(success(user));
}
