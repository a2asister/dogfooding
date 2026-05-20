import Router from 'koa-router';
import db from '../db';
import { success, error } from '../utils/response';
import { logOperation } from '../utils/logger';

const router = new Router({ prefix: '/api/departments' });

router.get('/tree', async (ctx) => {
  const departments = db.prepare('SELECT * FROM departments WHERE status = 1 ORDER BY sort_order, id').all() as any[];
  
  const buildTree = (parentId: number | string = 0): any[] => {
    return departments
      .filter(d => {
        if (parentId === 0) {
          return d.parent_id === 0 || d.parent_id === null || d.parent_id === '';
        }
        return d.parent_id === parentId;
      })
      .map(d => ({
        id: d.id,
        name: d.name,
        code: d.code,
        parentId: d.parent_id,
        leaderId: d.leader_id,
        description: d.description,
        sortOrder: d.sort_order,
        children: buildTree(d.id),
      }));
  };

  ctx.body = success(buildTree());
});

router.get('/', async (ctx) => {
  const { status } = ctx.query;
  
  let where = 'WHERE 1=1';
  const params: any[] = [];
  
  if (status !== undefined) {
    where += ' AND status = ?';
    params.push(status);
  }

  const departments = db.prepare(`
    SELECT d.*, u.real_name as leader_name,
    COUNT(e.id) as employee_count
    FROM departments d
    LEFT JOIN users u ON d.leader_id = u.id
    LEFT JOIN employees e ON d.id = e.department_id
    ${where}
    GROUP BY d.id
    ORDER BY d.sort_order, d.id
  `).all(...params) as any[];

  ctx.body = success(departments.map(d => ({
    id: d.id,
    name: d.name,
    code: d.code,
    parentId: d.parent_id,
    leaderId: d.leader_id,
    leaderName: d.leader_name,
    description: d.description,
    sortOrder: d.sort_order,
    status: d.status,
    employeeCount: d.employee_count,
    createdAt: d.created_at,
  })));
});

router.get('/:id', async (ctx) => {
  const { id } = ctx.params;
  const dept = db.prepare('SELECT * FROM departments WHERE id = ?').get(id) as any;

  if (!dept) {
    ctx.body = error('部门不存在');
    return;
  }

  ctx.body = success({
    id: dept.id,
    name: dept.name,
    code: dept.code,
    parentId: dept.parent_id,
    leaderId: dept.leader_id,
    description: dept.description,
    sortOrder: dept.sort_order,
    status: dept.status,
  });
});

router.post('/', async (ctx) => {
  const { name, code, parentId, leaderId, description, sortOrder } = ctx.request.body as any;

  if (code) {
    const exists = db.prepare('SELECT id FROM departments WHERE code = ?').get(code);
    if (exists) {
      ctx.body = error('部门编码已存在');
      return;
    }
  }

  const result = db.prepare(`
    INSERT INTO departments (name, code, parent_id, leader_id, description, sort_order)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(name, code, parentId || 0, leaderId, description, sortOrder || 0);

  logOperation({
    userId: ctx.user?.userId,
    username: ctx.user?.username,
    operation: '创建部门',
    module: '部门管理',
    details: `创建部门 ${name}`,
    ipAddress: ctx.ip,
  });

  ctx.body = success({ id: result.lastInsertRowid }, '创建成功');
});

router.put('/:id', async (ctx) => {
  const { id } = ctx.params;
  const { name, code, parentId, leaderId, description, sortOrder, status } = ctx.request.body as any;

  const dept = db.prepare('SELECT id FROM departments WHERE id = ?').get(id);
  if (!dept) {
    ctx.body = error('部门不存在');
    return;
  }

  if (code) {
    const exists = db.prepare('SELECT id FROM departments WHERE code = ? AND id != ?').get(code, id);
    if (exists) {
      ctx.body = error('部门编码已存在');
      return;
    }
  }

  db.prepare(`
    UPDATE departments SET name = ?, code = ?, parent_id = ?, leader_id = ?, description = ?, sort_order = ?, status = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(name, code, parentId || 0, leaderId, description, sortOrder || 0, status, id);

  logOperation({
    userId: ctx.user?.userId,
    username: ctx.user?.username,
    operation: '更新部门',
    module: '部门管理',
    details: `更新部门 ID:${id}`,
    ipAddress: ctx.ip,
  });

  ctx.body = success(null, '更新成功');
});

router.delete('/:id', async (ctx) => {
  const { id } = ctx.params;

  const childCount = db.prepare('SELECT COUNT(*) as count FROM departments WHERE parent_id = ?').get(id) as { count: number };
  if (childCount.count > 0) {
    ctx.body = error('该部门下还有子部门，无法删除');
    return;
  }

  const empCount = db.prepare('SELECT COUNT(*) as count FROM employees WHERE department_id = ?').get(id) as { count: number };
  if (empCount.count > 0) {
    ctx.body = error('该部门下还有员工，无法删除');
    return;
  }

  db.prepare('DELETE FROM departments WHERE id = ?').run(id);

  logOperation({
    userId: ctx.user?.userId,
    username: ctx.user?.username,
    operation: '删除部门',
    module: '部门管理',
    details: `删除部门 ID:${id}`,
    ipAddress: ctx.ip,
  });

  ctx.body = success(null, '删除成功');
});

export default router;
