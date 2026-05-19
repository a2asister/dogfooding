import Router from 'koa-router';
import db from '../db';
import { error, success } from '../utils';
import { authMiddleware, roleMiddleware } from '../middleware/auth';
import { Role } from '../types';

const router = new Router({ prefix: '/api/groups' });

router.use(authMiddleware);

router.get('/', async (ctx) => {
  const currentUser = ctx.state.user;

  let where = 'WHERE status = ?';
  const params: unknown[] = ['active'];

  if (currentUser.role === Role.GROUP_ADMIN) {
    where += ' AND id = ?';
    params.push(currentUser.groupId);
  } else if (currentUser.role === Role.MEMBER || currentUser.role === Role.PROJECT_ADMIN) {
    where += ' AND id = ?';
    params.push(currentUser.groupId);
  }

  const groups = db.prepare(`
    SELECT g.*, u.nickname as leader_name
    FROM groups g
    LEFT JOIN users u ON g.leader_id = u.id
    ${where}
    ORDER BY g.created_at DESC
  `).all(...params);

  ctx.body = success(groups);
});

router.get('/all', roleMiddleware(Role.SUPER_ADMIN, Role.GROUP_ADMIN), async (ctx) => {
  const currentUser = ctx.state.user;
  let where = 'WHERE 1=1';
  const params: unknown[] = [];

  if (currentUser.role === Role.GROUP_ADMIN) {
    where += ' AND id = ?';
    params.push(currentUser.groupId);
  }

  const groups = db.prepare(`
    SELECT g.*, u.nickname as leader_name
    FROM groups g
    LEFT JOIN users u ON g.leader_id = u.id
    ${where}
    ORDER BY g.created_at DESC
  `).all(...params);

  ctx.body = success(groups);
});

router.get('/:id', async (ctx) => {
  const groupId = Number(ctx.params.id);
  const group = db.prepare(`
    SELECT g.*, u.nickname as leader_name
    FROM groups g
    LEFT JOIN users u ON g.leader_id = u.id
    WHERE g.id = ?
  `).get(groupId);

  if (!group) {
    ctx.status = 404;
    ctx.body = error('分组不存在');
    return;
  }

  ctx.body = success(group);
});

router.post('/', roleMiddleware(Role.SUPER_ADMIN), async (ctx) => {
  const { name, description, leaderId } = ctx.request.body as any;

  const existing = db.prepare('SELECT id FROM groups WHERE name = ?').get(name);
  if (existing) {
    ctx.status = 400;
    ctx.body = error('分组名称已存在');
    return;
  }

  const info = db.prepare(`
    INSERT INTO groups (name, description, leader_id)
    VALUES (?, ?, ?)
  `).run(name, description || '', leaderId || null);

  ctx.body = success({ id: info.lastInsertRowid }, '分组创建成功');
});

router.put('/:id', roleMiddleware(Role.SUPER_ADMIN, Role.GROUP_ADMIN), async (ctx) => {
  const groupId = Number(ctx.params.id);
  const currentUser = ctx.state.user;
  const { name, description, leaderId, status } = ctx.request.body as any;

  const group = db.prepare('SELECT * FROM groups WHERE id = ?').get(groupId) as any;
  if (!group) {
    ctx.status = 404;
    ctx.body = error('分组不存在');
    return;
  }

  if (currentUser.role === Role.GROUP_ADMIN && groupId !== currentUser.groupId) {
    ctx.status = 403;
    ctx.body = error('无权修改其他分组');
    return;
  }

  const updateFields: string[] = [];
  const updateValues: unknown[] = [];

  if (name !== undefined) {
    const existing = db.prepare('SELECT id FROM groups WHERE name = ? AND id != ?').get(name, groupId);
    if (existing) {
      ctx.status = 400;
      ctx.body = error('分组名称已存在');
      return;
    }
    updateFields.push('name = ?');
    updateValues.push(name);
  }
  if (description !== undefined) { updateFields.push('description = ?'); updateValues.push(description); }
  if (leaderId !== undefined && currentUser.role === Role.SUPER_ADMIN) {
    updateFields.push('leader_id = ?');
    updateValues.push(leaderId);
  }
  if (status !== undefined) { updateFields.push('status = ?'); updateValues.push(status); }

  if (updateFields.length > 0) {
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(groupId);
    db.prepare(`UPDATE groups SET ${updateFields.join(', ')} WHERE id = ?`).run(...updateValues);
  }

  ctx.body = success(null, '分组更新成功');
});

router.delete('/:id', roleMiddleware(Role.SUPER_ADMIN), async (ctx) => {
  const groupId = Number(ctx.params.id);

  const projectCount = (db.prepare('SELECT COUNT(*) as count FROM projects WHERE group_id = ?').get(groupId) as { count: number }).count;
  if (projectCount > 0) {
    ctx.status = 400;
    ctx.body = error('该分组下还有项目，无法删除');
    return;
  }

  db.prepare('UPDATE users SET group_id = NULL WHERE group_id = ?').run(groupId);
  db.prepare('DELETE FROM groups WHERE id = ?').run(groupId);
  ctx.body = success(null, '分组删除成功');
});

router.post('/:id/archive', roleMiddleware(Role.SUPER_ADMIN, Role.GROUP_ADMIN), async (ctx) => {
  const groupId = Number(ctx.params.id);
  const currentUser = ctx.state.user;

  if (currentUser.role === Role.GROUP_ADMIN && groupId !== currentUser.groupId) {
    ctx.status = 403;
    ctx.body = error('无权操作其他分组');
    return;
  }

  db.prepare("UPDATE groups SET status = 'archived', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(groupId);
  ctx.body = success(null, '分组已归档');
});

router.post('/:id/unarchive', roleMiddleware(Role.SUPER_ADMIN, Role.GROUP_ADMIN), async (ctx) => {
  const groupId = Number(ctx.params.id);
  const currentUser = ctx.state.user;

  if (currentUser.role === Role.GROUP_ADMIN && groupId !== currentUser.groupId) {
    ctx.status = 403;
    ctx.body = error('无权操作其他分组');
    return;
  }

  db.prepare("UPDATE groups SET status = 'active', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(groupId);
  ctx.body = success(null, '分组已恢复');
});

router.get('/:id/members', roleMiddleware(Role.SUPER_ADMIN, Role.GROUP_ADMIN), async (ctx) => {
  const groupId = Number(ctx.params.id);
  const members = db.prepare(`
    SELECT id, username, nickname, email, role, status
    FROM users WHERE group_id = ? ORDER BY created_at DESC
  `).all(groupId);

  ctx.body = success(members);
});

export default router;
