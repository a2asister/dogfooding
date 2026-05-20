import Router from 'koa-router';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import db from '../db';
import { signToken } from '../middleware/auth';
import { LoginRequest, RegisterRequest, User } from '../types';
import { successResponse, errorResponse } from '../utils/response';

const router = new Router({ prefix: '/api/auth' });

router.post('/register', async (ctx) => {
  const { username, email, password, realName } = ctx.request.body as RegisterRequest;

  if (!username || !email || !password || !realName) {
    ctx.status = 400;
    ctx.body = errorResponse('请填写完整的注册信息', 400);
    return;
  }

  const existingUser = db
    .prepare('SELECT id FROM users WHERE username = ? OR email = ?')
    .get(username, email) as User | undefined;

  if (existingUser) {
    ctx.status = 400;
    ctx.body = errorResponse('用户名或邮箱已存在', 400);
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const now = new Date().toISOString();
  const id = uuidv4();

  db.prepare(`
    INSERT INTO users (id, username, email, password, realName, role, status, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, 'developer', 'active', ?, ?)
  `).run(id, username, email, hashedPassword, realName, now, now);

  const user = db.prepare('SELECT id, username, email, realName, role, avatar, phone, departmentId, status, createdAt, updatedAt FROM users WHERE id = ?').get(id) as Omit<User, 'password'>;
  const token = signToken({ userId: user.id, username: user.username, role: user.role });

  ctx.body = successResponse({ token, user });
});

router.post('/login', async (ctx) => {
  const { username, password } = ctx.request.body as LoginRequest;

  if (!username || !password) {
    ctx.status = 400;
    ctx.body = errorResponse('请输入用户名和密码', 400);
    return;
  }

  const user = db
    .prepare('SELECT * FROM users WHERE username = ? OR email = ?')
    .get(username, username) as User | undefined;

  if (!user) {
    ctx.status = 401;
    ctx.body = errorResponse('用户不存在', 401);
    return;
  }

  if (user.status === 'inactive') {
    ctx.status = 403;
    ctx.body = errorResponse('账号已被禁用', 403);
    return;
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    ctx.status = 401;
    ctx.body = errorResponse('密码错误', 401);
    return;
  }

  const { password: _, ...userWithoutPassword } = user;
  const token = signToken({ userId: user.id, username: user.username, role: user.role });

  ctx.body = successResponse({ token, user: userWithoutPassword });
});

export default router;
