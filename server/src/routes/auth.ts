import Router from 'koa-router';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import db from '../db';
import { signToken } from '../middleware/auth';
import { UserRole, AuthStatus, User } from '../types';

const router = new Router({ prefix: '/api/auth' });

const registerSchema = z.object({
  phone: z.string().regex(/^1[3-9]\d{9}$/, '手机号格式不正确'),
  password: z.string().min(6, '密码至少6位'),
  nickname: z.string().min(2, '昵称至少2位'),
  role: z.enum([UserRole.USER, UserRole.MERCHANT]).default(UserRole.USER)
});

const loginSchema = z.object({
  phone: z.string().regex(/^1[3-9]\d{9}$/, '手机号格式不正确'),
  password: z.string().min(1, '密码不能为空')
});

router.post('/register', async (ctx) => {
  const body = registerSchema.safeParse(ctx.request.body);
  
  if (!body.success) {
    ctx.status = 400;
    ctx.body = { code: 400, message: body.error.issues[0]?.message || '参数错误' };
    return;
  }

  const { phone, password, nickname, role } = body.data;

  const existingUser = db.prepare('SELECT id FROM users WHERE phone = ?').get(phone);
  if (existingUser) {
    ctx.status = 400;
    ctx.body = { code: 400, message: '该手机号已注册' };
    return;
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const insertUser = db.prepare(`
    INSERT INTO users (phone, password, nickname, role, authStatus)
    VALUES (?, ?, ?, ?, ?)
  `);

  const result = insertUser.run(phone, hashedPassword, nickname, role, AuthStatus.UNVERIFIED);
  const userId = result.lastInsertRowid as number;

  const token = signToken({ userId, role, phone });

  ctx.body = {
    code: 200,
    message: '注册成功',
    data: {
      token,
      user: {
        id: userId,
        phone,
        nickname,
        role,
        authStatus: AuthStatus.UNVERIFIED
      }
    }
  };
});

router.post('/login', async (ctx) => {
  const body = loginSchema.safeParse(ctx.request.body);
  
  if (!body.success) {
    ctx.status = 400;
    ctx.body = { code: 400, message: body.error.issues[0]?.message || '参数错误' };
    return;
  }

  const { phone, password } = body.data;

  const user = db.prepare('SELECT * FROM users WHERE phone = ?').get(phone) as User | undefined;
  
  if (!user) {
    ctx.status = 400;
    ctx.body = { code: 400, message: '手机号或密码错误' };
    return;
  }

  const isValidPassword = bcrypt.compareSync(password, user.password);
  if (!isValidPassword) {
    ctx.status = 400;
    ctx.body = { code: 400, message: '手机号或密码错误' };
    return;
  }

  const token = signToken({ userId: user.id, role: user.role, phone: user.phone });

  ctx.body = {
    code: 200,
    message: '登录成功',
    data: {
      token,
      user: {
        id: user.id,
        phone: user.phone,
        nickname: user.nickname,
        role: user.role,
        authStatus: user.authStatus,
        realName: user.realName,
        balance: user.balance,
        frozenBalance: user.frozenBalance
      }
    }
  };
});

export default router;
