import Router from 'koa-router';
import db from '../db';
import { v4 as uuidv4 } from 'uuid';
import { success, error } from '../utils/response';
import type { Project, ProjectType, ProjectStatus } from '../types';

const router = new Router({ prefix: '/api/projects' });

router.get('/', async (ctx) => {
  const { status, type } = ctx.query;
  let sql = 'SELECT * FROM projects WHERE 1=1';
  const params: string[] = [];

  if (status) {
    sql += ' AND status = ?';
    params.push(status as string);
  }
  if (type) {
    sql += ' AND type = ?';
    params.push(type as string);
  }
  sql += ' ORDER BY createdAt DESC';

  const projects = db.prepare(sql).all(...params) as Project[];
  ctx.body = success(projects);
});

router.get('/:id', async (ctx) => {
  const { id } = ctx.params;
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(id) as Project | undefined;

  if (!project) {
    ctx.status = 404;
    ctx.body = error('项目不存在');
    return;
  }

  ctx.body = success(project);
});

router.post('/', async (ctx) => {
  const { name, type, manager, startDate, endDate, description } = ctx.request.body as {
    name: string;
    type: ProjectType;
    manager: string;
    startDate: string;
    endDate: string;
    description?: string;
  };

  if (!name || !type || !manager || !startDate || !endDate) {
    ctx.status = 400;
    ctx.body = error('缺少必要参数');
    return;
  }

  const id = uuidv4();
  const now = new Date().toISOString();

  db.prepare(
    'INSERT INTO projects (id, name, type, manager, startDate, endDate, description, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(id, name, type, manager, startDate, endDate, description || '', 'active', now, now);

  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(id) as Project;
  ctx.body = success(project, '项目创建成功');
});

router.put('/:id', async (ctx) => {
  const { id } = ctx.params;
  const existing = db.prepare('SELECT * FROM projects WHERE id = ?').get(id) as Project | undefined;

  if (!existing) {
    ctx.status = 404;
    ctx.body = error('项目不存在');
    return;
  }

  const { name, type, manager, startDate, endDate, description, status } = ctx.request.body as {
    name?: string;
    type?: ProjectType;
    manager?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
    status?: ProjectStatus;
  };

  const now = new Date().toISOString();
  const fields: string[] = [];
  const params: string[] = [];

  if (name !== undefined) { fields.push('name = ?'); params.push(name); }
  if (type !== undefined) { fields.push('type = ?'); params.push(type); }
  if (manager !== undefined) { fields.push('manager = ?'); params.push(manager); }
  if (startDate !== undefined) { fields.push('startDate = ?'); params.push(startDate); }
  if (endDate !== undefined) { fields.push('endDate = ?'); params.push(endDate); }
  if (description !== undefined) { fields.push('description = ?'); params.push(description); }
  if (status !== undefined) { fields.push('status = ?'); params.push(status); }

  fields.push('updatedAt = ?');
  params.push(now, id);

  db.prepare(`UPDATE projects SET ${fields.join(', ')} WHERE id = ?`).run(...params);

  const updated = db.prepare('SELECT * FROM projects WHERE id = ?').get(id) as Project;
  ctx.body = success(updated, '项目更新成功');
});

router.delete('/:id', async (ctx) => {
  const { id } = ctx.params;
  const existing = db.prepare('SELECT * FROM projects WHERE id = ?').get(id) as Project | undefined;

  if (!existing) {
    ctx.status = 404;
    ctx.body = error('项目不存在');
    return;
  }

  db.prepare('DELETE FROM projects WHERE id = ?').run(id);
  ctx.body = success(null, '项目删除成功');
});

export default router;
