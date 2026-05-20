import Router from 'koa-router';
import bcrypt from 'bcryptjs';
import db from '../db';
import { success, error, PaginationResult } from '../utils/response';
import { logOperation } from '../utils/logger';

const router = new Router({ prefix: '/api/users' });

router.get('/', async (ctx) => {
  const { page = 1, pageSize = 10, keyword, roleId, departmentId, status } = ctx.query as any;
  
  let where = 'WHERE 1=1';
  const params: any[] = [];

  if (keyword) {
    where += ' AND (username LIKE ? OR real_name LIKE ? OR email LIKE ?)';
    params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
  }
  if (roleId) {
    where += ' AND role_id = ?';
    params.push(roleId);
  }
  if (departmentId) {
    where += ' AND department_id = ?';
    params.push(departmentId);
  }
  if (status !== undefined) {
    where += ' AND status = ?';
    params.push(status);
  }

  const total = db.prepare(`SELECT COUNT(*) as count FROM users ${where}`).get(...params) as { count: number };
  
  const users = db.prepare(`
    SELECT u.*, r.name as role_name, d.name as department_name
    FROM users u
    LEFT JOIN roles r ON u.role_id = r.id
    LEFT JOIN departments d ON u.department_id = d.id
    ${where}
    ORDER BY u.created_at DESC
    LIMIT ? OFFSET ?
  `).all(...params, pageSize, (page - 1) * pageSize) as any[];

  const result: PaginationResult<any> = {
    list: users.map(u => ({
      id: u.id,
      username: u.username,
      realName: u.real_name,
      email: u.email,
      phone: u.phone,
      avatar: u.avatar,
      roleId: u.role_id,
      roleName: u.role_name,
      departmentId: u.department_id,
      departmentName: u.department_name,
      position: u.position,
      status: u.status,
      createdAt: u.created_at,
    })),
    total: total.count,
    page: Number(page),
    pageSize: Number(pageSize),
  };

  ctx.body = success(result);
});

router.get('/:id', async (ctx) => {
  const { id } = ctx.params;
  const user = db.prepare(`
    SELECT u.*, r.name as role_name, d.name as department_name
    FROM users u
    LEFT JOIN roles r ON u.role_id = r.id
    LEFT JOIN departments d ON u.department_id = d.id
    WHERE u.id = ?
  `).get(id) as any;

  if (!user) {
    ctx.body = error('用户不存在');
    return;
  }

  ctx.body = success({
    id: user.id,
    username: user.username,
    realName: user.real_name,
    email: user.email,
    phone: user.phone,
    avatar: user.avatar,
    roleId: user.role_id,
    roleName: user.role_name,
    departmentId: user.department_id,
    departmentName: user.department_name,
    position: user.position,
    status: user.status,
    createdAt: user.created_at,
  });
});

router.post('/', async (ctx) => {
  const { username, password, realName, email, phone, roleId, departmentId, position } = ctx.request.body as any;

  const exists = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (exists) {
    ctx.body = error('用户名已存在');
    return;
  }

  const hash = await bcrypt.hash(password || '123456', 10);

  const result = db.prepare(`
    INSERT INTO users (username, password, real_name, email, phone, role_id, department_id, position)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(username, hash, realName, email, phone, roleId, departmentId, position);

  logOperation({
    userId: ctx.user?.userId,
    username: ctx.user?.username,
    operation: '创建用户',
    module: '用户管理',
    details: `创建用户 ${username}`,
    ipAddress: ctx.ip,
  });

  ctx.body = success({ id: result.lastInsertRowid }, '创建成功');
});

router.put('/:id', async (ctx) => {
  const { id } = ctx.params;
  const { realName, email, phone, roleId, departmentId, position, status, password } = ctx.request.body as any;

  const user = db.prepare('SELECT id FROM users WHERE id = ?').get(id);
  if (!user) {
    ctx.body = error('用户不存在');
    return;
  }

  if (password) {
    const hash = await bcrypt.hash(password, 10);
    db.prepare(`
      UPDATE users SET real_name = ?, email = ?, phone = ?, role_id = ?, department_id = ?, position = ?, status = ?, password = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(realName, email, phone, roleId, departmentId, position, status, hash, id);
  } else {
    db.prepare(`
      UPDATE users SET real_name = ?, email = ?, phone = ?, role_id = ?, department_id = ?, position = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(realName, email, phone, roleId, departmentId, position, status, id);
  }

  logOperation({
    userId: ctx.user?.userId,
    username: ctx.user?.username,
    operation: '更新用户',
    module: '用户管理',
    details: `更新用户 ID:${id}`,
    ipAddress: ctx.ip,
  });

  ctx.body = success(null, '更新成功');
});

router.delete('/:id', async (ctx) => {
  const { id } = ctx.params;

  if (Number(id) === 1) {
    ctx.body = error('超级管理员不能删除');
    return;
  }

  db.prepare('DELETE FROM users WHERE id = ?').run(id);

  logOperation({
    userId: ctx.user?.userId,
    username: ctx.user?.username,
    operation: '删除用户',
    module: '用户管理',
    details: `删除用户 ID:${id}`,
    ipAddress: ctx.ip,
  });

  ctx.body = success(null, '删除成功');
});

router.put('/:id/status', async (ctx) => {
  const { id } = ctx.params;
  const { status } = ctx.request.body as { status: number };

  if (Number(id) === 1) {
    ctx.body = error('超级管理员不能禁用');
    return;
  }

  db.prepare('UPDATE users SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(status, id);

  ctx.body = success(null, status === 1 ? '启用成功' : '禁用成功');
});

export default router;
