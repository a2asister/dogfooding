import Router from 'koa-router';
import { v4 as uuidv4 } from 'uuid';
import db from '../db';
import { authMiddleware } from '../middleware/auth';
import { BacklogItem } from '../types';
import { successResponse, errorResponse } from '../utils/response';

const router = new Router({ prefix: '/api/backlog' });

router.use(authMiddleware);

router.get('/', async (ctx) => {
  const { projectId, status, type, priority, assignee } = ctx.query;
  
  let sql = 'SELECT * FROM backlog_items WHERE 1=1';
  const params: unknown[] = [];

  if (projectId) {
    sql += ' AND projectId = ?';
    params.push(projectId);
  }

  if (status) {
    sql += ' AND status = ?';
    params.push(status);
  }

  if (type) {
    sql += ' AND type = ?';
    params.push(type);
  }

  if (priority) {
    sql += ' AND priority = ?';
    params.push(priority);
  }

  if (assignee) {
    sql += ' AND assignee = ?';
    params.push(assignee);
  }

  sql += ' ORDER BY sort ASC, createdAt DESC';

  const items = db.prepare(sql).all(...params) as BacklogItem[];
  ctx.body = successResponse(items);
});

router.get('/:id', async (ctx) => {
  const { id } = ctx.params;
  const item = db.prepare('SELECT * FROM backlog_items WHERE id = ?').get(id) as BacklogItem | undefined;

  if (!item) {
    ctx.body = errorResponse('待办项不存在', 404);
    return;
  }

  ctx.body = successResponse(item);
});

router.post('/', async (ctx) => {
  const { projectId, title, description = '', type = 'feature', priority = 'medium', storyPoints = 0, assignee = null, reporter } = ctx.request.body as Partial<BacklogItem>;

  if (!projectId || !title || !reporter) {
    ctx.body = errorResponse('请填写必填信息', 400);
    return;
  }

  const maxSort = db.prepare('SELECT MAX(sort) as maxSort FROM backlog_items WHERE projectId = ?').get(projectId) as { maxSort: number | null };
  const sort = (maxSort.maxSort || 0) + 1;

  const now = new Date().toISOString();
  const id = uuidv4();

  db.prepare(`
    INSERT INTO backlog_items (id, projectId, title, description, type, priority, storyPoints, status, assignee, reporter, sprintId, sort, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'backlog', ?, ?, NULL, ?, ?, ?)
  `).run(id, projectId, title, description, type, priority, storyPoints, assignee, reporter, sort, now, now);

  const item = db.prepare('SELECT * FROM backlog_items WHERE id = ?').get(id) as BacklogItem;
  ctx.body = successResponse(item);
});

router.put('/:id', async (ctx) => {
  const { id } = ctx.params;
  const { title, description, type, priority, storyPoints, status, assignee, sprintId, sort } = ctx.request.body as Partial<BacklogItem>;

  const item = db.prepare('SELECT id FROM backlog_items WHERE id = ?').get(id) as BacklogItem | undefined;
  if (!item) {
    ctx.body = errorResponse('待办项不存在', 404);
    return;
  }

  const now = new Date().toISOString();
  db.prepare(`
    UPDATE backlog_items SET title = COALESCE(?, title), description = COALESCE(?, description), type = COALESCE(?, type), priority = COALESCE(?, priority), storyPoints = COALESCE(?, storyPoints), status = COALESCE(?, status), assignee = ?, sprintId = ?, sort = COALESCE(?, sort), updatedAt = ?
    WHERE id = ?
  `).run(title, description, type, priority, storyPoints, status, assignee ?? null, sprintId ?? null, sort, now, id);

  const updatedItem = db.prepare('SELECT * FROM backlog_items WHERE id = ?').get(id) as BacklogItem;
  ctx.body = successResponse(updatedItem);
});

router.delete('/:id', async (ctx) => {
  const { id } = ctx.params;

  const item = db.prepare('SELECT id FROM backlog_items WHERE id = ?').get(id) as BacklogItem | undefined;
  if (!item) {
    ctx.body = errorResponse('待办项不存在', 404);
    return;
  }

  db.prepare('DELETE FROM backlog_items WHERE id = ?').run(id);
  ctx.body = successResponse(null, '删除成功');
});

router.post('/batch/delete', async (ctx) => {
  const { ids } = ctx.request.body as { ids: string[] };

  const stmt = db.prepare('DELETE FROM backlog_items WHERE id = ?');
  const transaction = db.transaction((idsList: string[]) => {
    for (const id of idsList) {
      stmt.run(id);
    }
  });
  transaction(ids);

  ctx.body = successResponse(null, '批量删除成功');
});

router.post('/batch/update-status', async (ctx) => {
  const { ids, status } = ctx.request.body as { ids: string[]; status: BacklogItem['status'] };

  const stmt = db.prepare('UPDATE backlog_items SET status = ?, updatedAt = ? WHERE id = ?');
  const now = new Date().toISOString();
  const transaction = db.transaction((idsList: string[]) => {
    for (const id of idsList) {
      stmt.run(status, now, id);
    }
  });
  transaction(ids);

  ctx.body = successResponse(null, '批量更新成功');
});

router.post('/:id/add-to-sprint', async (ctx) => {
  const { id } = ctx.params;
  const { sprintId } = ctx.request.body as { sprintId: string };

  const item = db.prepare('SELECT id FROM backlog_items WHERE id = ?').get(id) as BacklogItem | undefined;
  if (!item) {
    ctx.body = errorResponse('待办项不存在', 404);
    return;
  }

  db.prepare('UPDATE backlog_items SET sprintId = ?, status = \'in_sprint\', updatedAt = ? WHERE id = ?').run(sprintId, new Date().toISOString(), id);
  ctx.body = successResponse(null, '已添加到迭代');
});

router.post('/:id/remove-from-sprint', async (ctx) => {
  const { id } = ctx.params;

  db.prepare('UPDATE backlog_items SET sprintId = NULL, status = \'backlog\', updatedAt = ? WHERE id = ?').run(new Date().toISOString(), id);
  ctx.body = successResponse(null, '已从迭代中移除');
});

router.post('/:id/convert-to-task', async (ctx) => {
  const { id } = ctx.params;

  const item = db.prepare('SELECT * FROM backlog_items WHERE id = ?').get(id) as BacklogItem | undefined;
  if (!item) {
    ctx.body = errorResponse('待办项不存在', 404);
    return;
  }

  const taskId = uuidv4();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO tasks (id, projectId, title, type, status, priority, description, assignee, reporter, dueDate, sprintId, versionId, parentId, storyPoints, isPinned, isArchived, createdAt, updatedAt)
    VALUES (?, ?, ?, 'requirement', 'todo', ?, ?, ?, ?, NULL, ?, NULL, NULL, ?, 0, 0, ?, ?)
  `).run(taskId, item.projectId, item.title, item.priority, item.description, item.assignee || '', item.reporter, item.sprintId, item.storyPoints, now, now);

  db.prepare('UPDATE backlog_items SET status = \'done\', updatedAt = ? WHERE id = ?').run(now, id);

  ctx.body = successResponse({ taskId }, '已转换为任务');
});

export default router;
