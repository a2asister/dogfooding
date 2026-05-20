import Router from 'koa-router';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import db from '../db';
import { authMiddleware } from '../middleware/auth';
import { User, UserRole } from '../types';
import { successResponse, errorResponse } from '../utils/response';

const router = new Router({ prefix: '/api/users' });

router.use(authMiddleware);

router.get('/', async (ctx) => {
  const { page = 1, pageSize = 20, keyword = '', role, departmentId, status } = ctx.query;
  
  let sql = 'SELECT id, username, email, realName, role, avatar, phone, departmentId, status, createdAt, updatedAt FROM users WHERE 1=1';
  const params: unknown[] = [];

  if (keyword) {
    sql += ' AND (username LIKE ? OR realName LIKE ? OR email LIKE ?)';
    const search = `%${keyword}%`;
    params.push(search, search, search);
  }

  if (role) {
    sql += ' AND role = ?';
    params.push(role);
  }

  if (departmentId) {
    sql += ' AND departmentId = ?';
    params.push(departmentId);
  }

  if (status) {
    sql += ' AND status = ?';
    params.push(status);
  }

  sql += ' ORDER BY createdAt DESC LIMIT ? OFFSET ?';
  params.push(Number(pageSize), (Number(page) - 1) * Number(pageSize));

  const users = db.prepare(sql).all(...params) as Omit<User, 'password'>[];
  
  const countSql = sql.replace('SELECT id, username, email, realName, role, avatar, phone, departmentId, status, createdAt, updatedAt', 'SELECT COUNT(*) as count').replace(' ORDER BY createdAt DESC LIMIT ? OFFSET ?', '');
  const countParams = params.slice(0, -2);
  const { count } = db.prepare(countSql).get(...countParams) as { count: number };

  ctx.body = successResponse({
    items: users,
    total: count,
    page: Number(page),
    pageSize: Number(pageSize),
  });
});

router.get('/all', async (ctx) => {
  const users = db.prepare('SELECT id, username, realName, role, avatar, departmentId FROM users WHERE status = \'active\' ORDER BY realName').all() as Omit<User, 'password'>[];
  ctx.body = successResponse(users);
});

router.get('/:id', async (ctx) => {
  const { id } = ctx.params;
  const user = db.prepare('SELECT id, username, email, realName, role, avatar, phone, departmentId, status, createdAt, updatedAt FROM users WHERE id = ?').get(id) as Omit<User, 'password'> | undefined;

  if (!user) {
    ctx.status = 404;
    ctx.body = errorResponse('用户不存在', 404);
    return;
  }

  ctx.body = successResponse(user);
});

router.post('/', async (ctx) => {
  const { username, email, password, realName, role = 'developer', phone, departmentId } = ctx.request.body as Partial<User> & { password?: string };

  if (!username || !email || !password || !realName) {
    ctx.status = 400;
    ctx.body = errorResponse('请填写必填信息', 400);
    return;
  }

  const existingUser = db.prepare('SELECT id FROM users WHERE username = ? OR email = ?').get(username, email) as User | undefined;
  if (existingUser) {
    ctx.status = 400;
    ctx.body = errorResponse('用户名或邮箱已存在', 400);
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const now = new Date().toISOString();
  const id = uuidv4();

  db.prepare(`
    INSERT INTO users (id, username, email, password, realName, role, phone, departmentId, status, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)
  `).run(id, username, email, hashedPassword, realName, role, phone || null, departmentId || null, now, now);

  const user = db.prepare('SELECT id, username, email, realName, role, avatar, phone, departmentId, status, createdAt, updatedAt FROM users WHERE id = ?').get(id) as Omit<User, 'password'>;
  ctx.body = successResponse(user);
});

router.put('/:id', async (ctx) => {
  const { id } = ctx.params;
  const { realName, role, phone, departmentId, status } = ctx.request.body as Partial<User>;

  const user = db.prepare('SELECT id FROM users WHERE id = ?').get(id) as User | undefined;
  if (!user) {
    ctx.status = 404;
    ctx.body = errorResponse('用户不存在', 404);
    return;
  }

  const now = new Date().toISOString();
  db.prepare(`
    UPDATE users SET realName = COALESCE(?, realName), role = COALESCE(?, role), phone = ?, departmentId = ?, status = COALESCE(?, status), updatedAt = ?
    WHERE id = ?
  `).run(realName, role, phone || null, departmentId || null, status, now, id);

  const updatedUser = db.prepare('SELECT id, username, email, realName, role, avatar, phone, departmentId, status, createdAt, updatedAt FROM users WHERE id = ?').get(id) as Omit<User, 'password'>;
  ctx.body = successResponse(updatedUser);
});

router.delete('/:id', async (ctx) => {
  const { id } = ctx.params;
  
  const user = db.prepare('SELECT id FROM users WHERE id = ?').get(id) as User | undefined;
  if (!user) {
    ctx.status = 404;
    ctx.body = errorResponse('用户不存在', 404);
    return;
  }

  db.prepare('UPDATE users SET status = \'inactive\', updatedAt = ? WHERE id = ?').run(new Date().toISOString(), id);
  ctx.body = successResponse(null, '用户已禁用');
});

router.put('/:id/password', async (ctx) => {
  const { id } = ctx.params;
  const { oldPassword, newPassword } = ctx.request.body as { oldPassword: string; newPassword: string };

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as User | undefined;
  if (!user) {
    ctx.status = 404;
    ctx.body = errorResponse('用户不存在', 404);
    return;
  }

  if (oldPassword && newPassword) {
    const isValid = await bcrypt.compare(oldPassword, user.password);
    if (!isValid) {
      ctx.status = 400;
      ctx.body = errorResponse('原密码错误', 400);
      return;
    }
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  db.prepare('UPDATE users SET password = ?, updatedAt = ? WHERE id = ?').run(hashedPassword, new Date().toISOString(), id);

  ctx.body = successResponse(null, '密码修改成功');
});

export default router;
