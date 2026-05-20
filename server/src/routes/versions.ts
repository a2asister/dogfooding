import Router from 'koa-router';
import { v4 as uuidv4 } from 'uuid';
import db from '../db';
import { authMiddleware } from '../middleware/auth';
import { Version, Task } from '../types';
import { successResponse, errorResponse } from '../utils/response';

const router = new Router({ prefix: '/api/versions' });

router.use(authMiddleware);

router.get('/', async (ctx) => {
  const { projectId, type, status } = ctx.query;
  
  let sql = 'SELECT * FROM versions WHERE 1=1';
  const params: unknown[] = [];

  if (projectId) {
    sql += ' AND projectId = ?';
    params.push(projectId);
  }

  if (type) {
    sql += ' AND type = ?';
    params.push(type);
  }

  if (status) {
    sql += ' AND status = ?';
    params.push(status);
  }

  sql += ' ORDER BY createdAt DESC';

  const versions = db.prepare(sql).all(...params) as Version[];
  ctx.body = successResponse(versions);
});

router.get('/:id', async (ctx) => {
  const { id } = ctx.params;
  const version = db.prepare('SELECT * FROM versions WHERE id = ?').get(id) as Version | undefined;

  if (!version) {
    ctx.body = errorResponse('版本不存在', 404);
    return;
  }

  const tasks = db.prepare('SELECT * FROM tasks WHERE versionId = ?').all(id) as Task[];
  const taskStats = {
    total: tasks.length,
    done: tasks.filter(t => t.status === 'done' || t.status === 'closed').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    todo: tasks.filter(t => t.status === 'todo').length,
    bugs: tasks.filter(t => t.type === 'bug').length,
  };

  ctx.body = successResponse({
    ...version,
    tasks,
    taskStats,
  });
});

router.post('/', async (ctx) => {
  const { projectId, name, type = 'release', description = '', releaseDate = null } = ctx.request.body as Partial<Version>;

  if (!projectId || !name) {
    ctx.body = errorResponse('请填写必填信息', 400);
    return;
  }

  const now = new Date().toISOString();
  const id = uuidv4();

  db.prepare(`
    INSERT INTO versions (id, projectId, name, type, status, releaseDate, description, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, 'planning', ?, ?, ?, ?)
  `).run(id, projectId, name, type, releaseDate, description, now, now);

  const version = db.prepare('SELECT * FROM versions WHERE id = ?').get(id) as Version;
  ctx.body = successResponse(version);
});

router.put('/:id', async (ctx) => {
  const { id } = ctx.params;
  const { name, type, status, releaseDate, description } = ctx.request.body as Partial<Version>;

  const version = db.prepare('SELECT id FROM versions WHERE id = ?').get(id) as Version | undefined;
  if (!version) {
    ctx.body = errorResponse('版本不存在', 404);
    return;
  }

  const now = new Date().toISOString();
  db.prepare(`
    UPDATE versions SET name = COALESCE(?, name), type = COALESCE(?, type), status = COALESCE(?, status), releaseDate = ?, description = COALESCE(?, description), updatedAt = ?
    WHERE id = ?
  `).run(name, type, status, releaseDate ?? null, description, now, id);

  const updatedVersion = db.prepare('SELECT * FROM versions WHERE id = ?').get(id) as Version;
  ctx.body = successResponse(updatedVersion);
});

router.delete('/:id', async (ctx) => {
  const { id } = ctx.params;

  const version = db.prepare('SELECT id FROM versions WHERE id = ?').get(id) as Version | undefined;
  if (!version) {
    ctx.body = errorResponse('版本不存在', 404);
    return;
  }

  db.prepare('UPDATE tasks SET versionId = NULL WHERE versionId = ?').run(id);
  db.prepare('DELETE FROM versions WHERE id = ?').run(id);

  ctx.body = successResponse(null, '删除成功');
});

router.post('/:id/tasks', async (ctx) => {
  const { id } = ctx.params;
  const { taskIds } = ctx.request.body as { taskIds: string[] };

  const stmt = db.prepare('UPDATE tasks SET versionId = ?, updatedAt = ? WHERE id = ?');
  const now = new Date().toISOString();
  const transaction = db.transaction((ids: string[]) => {
    for (const taskId of ids) {
      stmt.run(id, now, taskId);
    }
  });
  transaction(taskIds);

  ctx.body = successResponse(null, '任务已关联到版本');
});

router.delete('/:id/tasks', async (ctx) => {
  const { id } = ctx.params;
  const { taskIds } = ctx.request.body as { taskIds: string[] };

  const stmt = db.prepare('UPDATE tasks SET versionId = NULL, updatedAt = ? WHERE id = ? AND versionId = ?');
  const now = new Date().toISOString();
  const transaction = db.transaction((ids: string[]) => {
    for (const taskId of ids) {
      stmt.run(now, taskId, id);
    }
  });
  transaction(taskIds);

  ctx.body = successResponse(null, '任务已从版本中移除');
});

export default router;
