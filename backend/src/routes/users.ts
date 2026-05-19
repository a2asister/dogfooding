import Router from 'koa-router';
import db from '../db';
import { error, success, hashPassword } from '../utils';
import { authMiddleware, roleMiddleware } from '../middleware/auth';
import { Role } from '../types';

const router = new Router({ prefix: '/api/users' });

router.use(authMiddleware);

router.get('/', roleMiddleware(Role.SUPER_ADMIN, Role.GROUP_ADMIN), async (ctx) => {
  const { page = 1, pageSize = 20, keyword, role, status } = ctx.query as any;
  const currentUser = ctx.state.user;

  let where = 'WHERE 1=1';
  const params: unknown[] = [];

  if (keyword) {
    where += ' AND (username LIKE ? OR nickname LIKE ? OR email LIKE ?)';
    params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
  }

  if (role) {
    where += ' AND u.role = ?';
    params.push(role);
  }

  if (status) {
    where += ' AND u.status = ?';
    params.push(status);
  }

  if (currentUser.role === Role.GROUP_ADMIN && currentUser.groupId) {
    where += ' AND (u.group_id = ? OR u.role IN (?, ?))';
    params.push(currentUser.groupId, Role.PROJECT_ADMIN, Role.MEMBER);
  }

  const total = (db.prepare(`SELECT COUNT(*) as count FROM users ${where}`).get(...params) as { count: number }).count;
  const offset = (page - 1) * pageSize;

  const users = db.prepare(`
    SELECT u.id, u.username, u.nickname, u.email, u.avatar, u.phone, u.role, 
           u.group_id, u.status, u.created_at, u.updated_at,
           g.name as group_name
    FROM users u
    LEFT JOIN groups g ON u.group_id = g.id
    ${where}
    ORDER BY u.created_at DESC
    LIMIT ? OFFSET ?
  `).all(...params, pageSize, offset);

  ctx.body = success({
    list: users,
    total,
    page: Number(page),
    pageSize: Number(pageSize)
  });
});

router.post('/', roleMiddleware(Role.SUPER_ADMIN), async (ctx) => {
  const { username, email, password, nickname, role, groupId } = ctx.request.body as any;

  const existing = db.prepare('SELECT id FROM users WHERE username = ? OR email = ?').get(username, email);
  if (existing) {
    ctx.status = 400;
    ctx.body = error('用户名或邮箱已存在');
    return;
  }

  const info = db.prepare(`
    INSERT INTO users (username, email, password, nickname, role, group_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(username, email, hashPassword(password || '123456'), nickname || username, role || Role.MEMBER, groupId || null);

  ctx.body = success({ id: info.lastInsertRowid }, '用户创建成功');
});

router.put('/:id', roleMiddleware(Role.SUPER_ADMIN, Role.GROUP_ADMIN), async (ctx) => {
  const userId = Number(ctx.params.id);
  const currentUser = ctx.state.user;
  const { nickname, email, phone, role, groupId, status } = ctx.request.body as any;

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;
  if (!user) {
    ctx.status = 404;
    ctx.body = error('用户不存在');
    return;
  }

  if (currentUser.role === Role.GROUP_ADMIN && user.role === Role.SUPER_ADMIN) {
    ctx.status = 403;
    ctx.body = error('无权修改超级管理员');
    return;
  }

  const updateFields: string[] = [];
  const updateValues: unknown[] = [];

  if (nickname !== undefined) { updateFields.push('nickname = ?'); updateValues.push(nickname); }
  if (email !== undefined) { updateFields.push('email = ?'); updateValues.push(email); }
  if (phone !== undefined) { updateFields.push('phone = ?'); updateValues.push(phone); }
  if (role !== undefined && currentUser.role === Role.SUPER_ADMIN) {
    updateFields.push('role = ?');
    updateValues.push(role);
  }
  if (groupId !== undefined) { updateFields.push('group_id = ?'); updateValues.push(groupId); }
  if (status !== undefined) { updateFields.push('status = ?'); updateValues.push(status); }

  if (updateFields.length > 0) {
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(userId);
    db.prepare(`UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`).run(...updateValues);
  }

  ctx.body = success(null, '用户更新成功');
});

router.post('/batch-action', roleMiddleware(Role.SUPER_ADMIN, Role.GROUP_ADMIN), async (ctx) => {
  const { ids, action } = ctx.request.body as { ids: number[]; action: string };
  const currentUser = ctx.state.user;

  if (!ids || ids.length === 0) {
    ctx.status = 400;
    ctx.body = error('请选择用户');
    return;
  }

  const placeholders = ids.map(() => '?').join(',');

  if (currentUser.role === Role.GROUP_ADMIN) {
    const users = db.prepare(`SELECT role FROM users WHERE id IN (${placeholders})`).all(...ids) as any[];
    if (users.some(u => u.role === Role.SUPER_ADMIN)) {
      ctx.status = 403;
      ctx.body = error('无权操作超级管理员');
      return;
    }
  }

  if (action === 'disable') {
    db.prepare(`UPDATE users SET status = 'disabled', updated_at = CURRENT_TIMESTAMP WHERE id IN (${placeholders})`).run(...ids);
  } else if (action === 'enable') {
    db.prepare(`UPDATE users SET status = 'active', updated_at = CURRENT_TIMESTAMP WHERE id IN (${placeholders})`).run(...ids);
  } else if (action === 'freeze') {
    db.prepare(`UPDATE users SET status = 'disabled', updated_at = CURRENT_TIMESTAMP WHERE id IN (${placeholders})`).run(...ids);
  } else {
    ctx.status = 400;
    ctx.body = error('无效的操作');
    return;
  }

  ctx.body = success(null, '批量操作成功');
});

router.delete('/:id', roleMiddleware(Role.SUPER_ADMIN), async (ctx) => {
  const userId = Number(ctx.params.id);
  const currentUser = ctx.state.user;

  if (userId === currentUser.userId) {
    ctx.status = 400;
    ctx.body = error('不能删除自己');
    return;
  }

  db.prepare('DELETE FROM users WHERE id = ?').run(userId);
  ctx.body = success(null, '用户删除成功');
});

export default router;
