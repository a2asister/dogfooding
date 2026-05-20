import Router from 'koa-router';
import db from '../db';
import { v4 as uuidv4 } from 'uuid';
import { success, error } from '../utils/response';
import type { Task, TaskStatus, TaskType, TaskPriority, TaskLog, TaskLogAction } from '../types';

const router = new Router({ prefix: '/api/projects/:projectId/tasks' });

function addTaskLog(
  taskId: string,
  action: TaskLogAction,
  oldValue: string | null,
  newValue: string | null,
  operator: string
): void {
  const id = uuidv4();
  const now = new Date().toISOString();
  db.prepare(
    'INSERT INTO task_logs (id, taskId, action, oldValue, newValue, operator, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(id, taskId, action, oldValue, newValue, operator, now);
}

router.get('/', async (ctx) => {
  const { projectId } = ctx.params;
  const { status, type, assignee, includeArchived } = ctx.query;

  let sql = 'SELECT * FROM tasks WHERE projectId = ?';
  const params: (string | number)[] = [projectId];

  if (status) {
    sql += ' AND status = ?';
    params.push(status as string);
  }
  if (type) {
    sql += ' AND type = ?';
    params.push(type as string);
  }
  if (assignee) {
    sql += ' AND assignee = ?';
    params.push(assignee as string);
  }
  if (includeArchived !== 'true') {
    sql += ' AND isArchived = 0';
  }
  sql += ' ORDER BY isPinned DESC, createdAt DESC';

  const tasks = db.prepare(sql).all(...params) as Task[];
  ctx.body = success(tasks);
});

router.get('/:id', async (ctx) => {
  const { projectId, id } = ctx.params;
  const task = db.prepare('SELECT * FROM tasks WHERE id = ? AND projectId = ?').get(id, projectId) as Task | undefined;

  if (!task) {
    ctx.status = 404;
    ctx.body = error('任务不存在');
    return;
  }

  ctx.body = success(task);
});

router.get('/:id/logs', async (ctx) => {
  const { projectId, id } = ctx.params;
  const task = db.prepare('SELECT * FROM tasks WHERE id = ? AND projectId = ?').get(id, projectId) as Task | undefined;

  if (!task) {
    ctx.status = 404;
    ctx.body = error('任务不存在');
    return;
  }

  const logs = db.prepare('SELECT * FROM task_logs WHERE taskId = ? ORDER BY createdAt DESC').all(id) as TaskLog[];
  ctx.body = success(logs);
});

router.post('/', async (ctx) => {
  const { projectId } = ctx.params;
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId);

  if (!project) {
    ctx.status = 404;
    ctx.body = error('项目不存在');
    return;
  }

  const {
    title,
    type = 'task',
    status = 'todo',
    priority = 'medium',
    description = '',
    assignee,
    reporter,
    dueDate,
    iteration = '',
    parentId = null,
  } = ctx.request.body as {
    title: string;
    type?: TaskType;
    status?: TaskStatus;
    priority?: TaskPriority;
    description?: string;
    assignee: string;
    reporter: string;
    dueDate?: string;
    iteration?: string;
    parentId?: string | null;
  };

  if (!title || !assignee || !reporter) {
    ctx.status = 400;
    ctx.body = error('缺少必要参数');
    return;
  }

  const id = uuidv4();
  const now = new Date().toISOString();

  db.prepare(
    `INSERT INTO tasks (
      id, projectId, title, type, status, priority, description,
      assignee, reporter, dueDate, iteration, parentId,
      isPinned, isArchived, createdAt, updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?, ?)`
  ).run(
    id, projectId, title, type, status, priority, description,
    assignee, reporter, dueDate || null, iteration, parentId,
    now, now
  );

  addTaskLog(id, 'create', null, JSON.stringify({ title, type, status, priority, assignee, reporter }), reporter);

  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as Task;
  ctx.body = success(task, '任务创建成功');
});

router.put('/:id', async (ctx) => {
  const { projectId, id } = ctx.params;
  const existing = db.prepare('SELECT * FROM tasks WHERE id = ? AND projectId = ?').get(id, projectId) as Task | undefined;

  if (!existing) {
    ctx.status = 404;
    ctx.body = error('任务不存在');
    return;
  }

  const {
    title,
    type,
    status,
    priority,
    description,
    assignee,
    dueDate,
    iteration,
    parentId,
  } = ctx.request.body as {
    title?: string;
    type?: TaskType;
    status?: TaskStatus;
    priority?: TaskPriority;
    description?: string;
    assignee?: string;
    dueDate?: string | null;
    iteration?: string;
    parentId?: string | null;
  };

  const operator = (ctx.request.body as { operator?: string }).operator || 'system';
  const now = new Date().toISOString();
  const fields: string[] = [];
  const params: (string | number | null)[] = [];

  if (title !== undefined) { fields.push('title = ?'); params.push(title); }
  if (type !== undefined) { fields.push('type = ?'); params.push(type); }
  if (status !== undefined && status !== existing.status) {
    fields.push('status = ?'); params.push(status);
    addTaskLog(id, 'status_change', existing.status, status, operator);
  }
  if (priority !== undefined) { fields.push('priority = ?'); params.push(priority); }
  if (description !== undefined) { fields.push('description = ?'); params.push(description); }
  if (assignee !== undefined && assignee !== existing.assignee) {
    fields.push('assignee = ?'); params.push(assignee);
    addTaskLog(id, 'assign', existing.assignee, assignee, operator);
  }
  if (dueDate !== undefined) { fields.push('dueDate = ?'); params.push(dueDate); }
  if (iteration !== undefined) { fields.push('iteration = ?'); params.push(iteration); }
  if (parentId !== undefined) { fields.push('parentId = ?'); params.push(parentId); }

  if (fields.length === 0) {
    ctx.body = success(existing);
    return;
  }

  fields.push('updatedAt = ?');
  params.push(now, id);

  db.prepare(`UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`).run(...params);
  addTaskLog(id, 'update', null, '字段更新', operator);

  const updated = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as Task;
  ctx.body = success(updated, '任务更新成功');
});

router.post('/:id/pin', async (ctx) => {
  const { projectId, id } = ctx.params;
  const existing = db.prepare('SELECT * FROM tasks WHERE id = ? AND projectId = ?').get(id, projectId) as Task | undefined;

  if (!existing) {
    ctx.status = 404;
    ctx.body = error('任务不存在');
    return;
  }

  const operator = (ctx.request.body as { operator?: string }).operator || 'system';
  db.prepare('UPDATE tasks SET isPinned = 1, updatedAt = ? WHERE id = ?').run(new Date().toISOString(), id);
  addTaskLog(id, 'pin', null, null, operator);

  const updated = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as Task;
  ctx.body = success(updated, '任务已置顶');
});

router.post('/:id/unpin', async (ctx) => {
  const { projectId, id } = ctx.params;
  const existing = db.prepare('SELECT * FROM tasks WHERE id = ? AND projectId = ?').get(id, projectId) as Task | undefined;

  if (!existing) {
    ctx.status = 404;
    ctx.body = error('任务不存在');
    return;
  }

  const operator = (ctx.request.body as { operator?: string }).operator || 'system';
  db.prepare('UPDATE tasks SET isPinned = 0, updatedAt = ? WHERE id = ?').run(new Date().toISOString(), id);
  addTaskLog(id, 'unpin', null, null, operator);

  const updated = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as Task;
  ctx.body = success(updated, '已取消置顶');
});

router.post('/:id/archive', async (ctx) => {
  const { projectId, id } = ctx.params;
  const existing = db.prepare('SELECT * FROM tasks WHERE id = ? AND projectId = ?').get(id, projectId) as Task | undefined;

  if (!existing) {
    ctx.status = 404;
    ctx.body = error('任务不存在');
    return;
  }

  const operator = (ctx.request.body as { operator?: string }).operator || 'system';
  db.prepare('UPDATE tasks SET isArchived = 1, updatedAt = ? WHERE id = ?').run(new Date().toISOString(), id);
  addTaskLog(id, 'archive', null, null, operator);

  const updated = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as Task;
  ctx.body = success(updated, '任务已归档');
});

router.post('/:id/unarchive', async (ctx) => {
  const { projectId, id } = ctx.params;
  const existing = db.prepare('SELECT * FROM tasks WHERE id = ? AND projectId = ?').get(id, projectId) as Task | undefined;

  if (!existing) {
    ctx.status = 404;
    ctx.body = error('任务不存在');
    return;
  }

  const operator = (ctx.request.body as { operator?: string }).operator || 'system';
  db.prepare('UPDATE tasks SET isArchived = 0, updatedAt = ? WHERE id = ?').run(new Date().toISOString(), id);
  addTaskLog(id, 'unarchive', null, null, operator);

  const updated = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as Task;
  ctx.body = success(updated, '已取消归档');
});

router.delete('/:id', async (ctx) => {
  const { projectId, id } = ctx.params;
  const existing = db.prepare('SELECT * FROM tasks WHERE id = ? AND projectId = ?').get(id, projectId) as Task | undefined;

  if (!existing) {
    ctx.status = 404;
    ctx.body = error('任务不存在');
    return;
  }

  const operator = (ctx.request.body as { operator?: string }).operator || 'system';
  addTaskLog(id, 'delete', null, null, operator);
  db.prepare('DELETE FROM tasks WHERE id = ?').run(id);

  ctx.body = success(null, '任务删除成功');
});

export default router;
