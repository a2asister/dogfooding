import Router from 'koa-router';
import db from '../db';
import { success, error } from '../utils/response';
import { logOperation } from '../utils/logger';

const router = new Router({ prefix: '/api/roles' });

router.get('/', async (ctx) => {
  const { status } = ctx.query;
  
  let where = 'WHERE 1=1';
  const params: any[] = [];
  
  if (status !== undefined) {
    where += ' AND status = ?';
    params.push(status);
  }

  const roles = db.prepare(`
    SELECT r.*, COUNT(u.id) as user_count
    FROM roles r
    LEFT JOIN users u ON r.id = u.role_id
    ${where}
    GROUP BY r.id
    ORDER BY r.created_at DESC
  `).all(...params) as any[];

  ctx.body = success(roles.map(r => ({
    id: r.id,
    name: r.name,
    code: r.code,
    description: r.description,
    permissions: r.permissions ? JSON.parse(r.permissions) : [],
    isSystem: r.is_system,
    status: r.status,
    userCount: r.user_count,
    createdAt: r.created_at,
  })));
});

router.get('/all', async (ctx) => {
  const roles = db.prepare('SELECT id, name, code FROM roles WHERE status = 1 ORDER BY sort_order').all() as any[];
  ctx.body = success(roles.map(r => ({
    id: r.id,
    name: r.name,
    code: r.code,
  })));
});

router.get('/:id', async (ctx) => {
  const { id } = ctx.params;
  const role = db.prepare('SELECT * FROM roles WHERE id = ?').get(id) as any;

  if (!role) {
    ctx.body = error('角色不存在');
    return;
  }

  ctx.body = success({
    id: role.id,
    name: role.name,
    code: role.code,
    description: role.description,
    permissions: role.permissions ? JSON.parse(role.permissions) : [],
    isSystem: role.is_system,
    status: role.status,
    createdAt: role.created_at,
  });
});

router.post('/', async (ctx) => {
  const { name, code, description, permissions } = ctx.request.body as any;

  const exists = db.prepare('SELECT id FROM roles WHERE code = ?').get(code);
  if (exists) {
    ctx.body = error('角色编码已存在');
    return;
  }

  const result = db.prepare(`
    INSERT INTO roles (name, code, description, permissions, is_system, status)
    VALUES (?, ?, ?, ?, 0, 1)
  `).run(name, code, description, JSON.stringify(permissions || []));

  logOperation({
    userId: ctx.user?.userId,
    username: ctx.user?.username,
    operation: '创建角色',
    module: '角色管理',
    details: `创建角色 ${name}`,
    ipAddress: ctx.ip,
  });

  ctx.body = success({ id: result.lastInsertRowid }, '创建成功');
});

router.put('/:id', async (ctx) => {
  const { id } = ctx.params;
  const { name, description, permissions, status } = ctx.request.body as any;

  const role = db.prepare('SELECT * FROM roles WHERE id = ?').get(id) as any;
  if (!role) {
    ctx.body = error('角色不存在');
    return;
  }

  if (role.is_system === 1) {
    ctx.body = error('系统预设角色不能修改');
    return;
  }

  db.prepare(`
    UPDATE roles SET name = ?, description = ?, permissions = ?, status = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(name, description, JSON.stringify(permissions || []), status, id);

  logOperation({
    userId: ctx.user?.userId,
    username: ctx.user?.username,
    operation: '更新角色',
    module: '角色管理',
    details: `更新角色 ID:${id}`,
    ipAddress: ctx.ip,
  });

  ctx.body = success(null, '更新成功');
});

router.delete('/:id', async (ctx) => {
  const { id } = ctx.params;

  const role = db.prepare('SELECT * FROM roles WHERE id = ?').get(id) as any;
  if (!role) {
    ctx.body = error('角色不存在');
    return;
  }

  if (role.is_system === 1) {
    ctx.body = error('系统预设角色不能删除');
    return;
  }

  const userCount = db.prepare('SELECT COUNT(*) as count FROM users WHERE role_id = ?').get(id) as { count: number };
  if (userCount.count > 0) {
    ctx.body = error('该角色下还有用户，无法删除');
    return;
  }

  db.prepare('DELETE FROM roles WHERE id = ?').run(id);

  logOperation({
    userId: ctx.user?.userId,
    username: ctx.user?.username,
    operation: '删除角色',
    module: '角色管理',
    details: `删除角色 ID:${id}`,
    ipAddress: ctx.ip,
  });

  ctx.body = success(null, '删除成功');
});

export default router;
