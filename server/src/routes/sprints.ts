import Router from 'koa-router';
import { v4 as uuidv4 } from 'uuid';
import db from '../db';
import { authMiddleware } from '../middleware/auth';
import { Sprint, Task } from '../types';
import { successResponse, errorResponse } from '../utils/response';

const router = new Router({ prefix: '/api/sprints' });

router.use(authMiddleware);

router.get('/', async (ctx) => {
  const { projectId, status } = ctx.query;
  
  let sql = 'SELECT * FROM sprints WHERE 1=1';
  const params: unknown[] = [];

  if (projectId) {
    sql += ' AND projectId = ?';
    params.push(projectId);
  }

  if (status) {
    sql += ' AND status = ?';
    params.push(status);
  }

  sql += ' ORDER BY createdAt DESC';

  const sprints = db.prepare(sql).all(...params) as Sprint[];
  ctx.body = successResponse(sprints);
});

router.get('/:id', async (ctx) => {
  const { id } = ctx.params;
  const sprint = db.prepare('SELECT * FROM sprints WHERE id = ?').get(id) as Sprint | undefined;

  if (!sprint) {
    ctx.body = errorResponse('迭代不存在', 404);
    return;
  }

  const tasks = db.prepare('SELECT * FROM tasks WHERE sprintId = ?').all(id) as Task[];
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'done' || t.status === 'closed').length;
  const totalStoryPoints = tasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);

  ctx.body = successResponse({
    ...sprint,
    tasks,
    stats: {
      totalTasks,
      completedTasks,
      remainingTasks: totalTasks - completedTasks,
      totalStoryPoints,
    },
  });
});

router.post('/', async (ctx) => {
  const { projectId, name, goal = '', startDate, endDate } = ctx.request.body as Partial<Sprint>;

  if (!projectId || !name || !startDate || !endDate) {
    ctx.body = errorResponse('请填写必填信息', 400);
    return;
  }

  const now = new Date().toISOString();
  const id = uuidv4();

  db.prepare(`
    INSERT INTO sprints (id, projectId, name, goal, startDate, endDate, status, velocity, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, 'planning', 0, ?, ?)
  `).run(id, projectId, name, goal, startDate, endDate, now, now);

  const sprint = db.prepare('SELECT * FROM sprints WHERE id = ?').get(id) as Sprint;
  ctx.body = successResponse(sprint);
});

router.put('/:id', async (ctx) => {
  const { id } = ctx.params;
  const { name, goal, startDate, endDate, status, velocity } = ctx.request.body as Partial<Sprint>;

  const sprint = db.prepare('SELECT id FROM sprints WHERE id = ?').get(id) as Sprint | undefined;
  if (!sprint) {
    ctx.body = errorResponse('迭代不存在', 404);
    return;
  }

  const now = new Date().toISOString();
  db.prepare(`
    UPDATE sprints SET name = COALESCE(?, name), goal = COALESCE(?, goal), startDate = COALESCE(?, startDate), endDate = COALESCE(?, endDate), status = COALESCE(?, status), velocity = COALESCE(?, velocity), updatedAt = ?
    WHERE id = ?
  `).run(name, goal, startDate, endDate, status, velocity, now, id);

  const updatedSprint = db.prepare('SELECT * FROM sprints WHERE id = ?').get(id) as Sprint;
  ctx.body = successResponse(updatedSprint);
});

router.delete('/:id', async (ctx) => {
  const { id } = ctx.params;

  const sprint = db.prepare('SELECT id FROM sprints WHERE id = ?').get(id) as Sprint | undefined;
  if (!sprint) {
    ctx.body = errorResponse('迭代不存在', 404);
    return;
  }

  db.prepare('UPDATE tasks SET sprintId = NULL WHERE sprintId = ?').run(id);
  db.prepare('UPDATE backlog_items SET sprintId = NULL, status = \'backlog\' WHERE sprintId = ?').run(id);
  db.prepare('DELETE FROM sprints WHERE id = ?').run(id);

  ctx.body = successResponse(null, '删除成功');
});

router.post('/:id/tasks', async (ctx) => {
  const { id } = ctx.params;
  const { taskIds } = ctx.request.body as { taskIds: string[] };

  const sprint = db.prepare('SELECT id, status FROM sprints WHERE id = ?').get(id) as Sprint | undefined;
  if (!sprint) {
    ctx.body = errorResponse('迭代不存在', 404);
    return;
  }

  if (sprint.status === 'completed') {
    ctx.body = errorResponse('已完成的迭代不能添加任务', 400);
    return;
  }

  const stmt = db.prepare('UPDATE tasks SET sprintId = ?, updatedAt = ? WHERE id = ?');
  const transaction = db.transaction((ids: string[]) => {
    for (const taskId of ids) {
      stmt.run(id, new Date().toISOString(), taskId);
    }
  });
  transaction(taskIds);

  ctx.body = successResponse(null, '任务已添加到迭代');
});

router.delete('/:id/tasks', async (ctx) => {
  const { id } = ctx.params;
  const { taskIds } = ctx.request.body as { taskIds: string[] };

  const stmt = db.prepare('UPDATE tasks SET sprintId = NULL, updatedAt = ? WHERE id = ?');
  const transaction = db.transaction((ids: string[]) => {
    for (const taskId of ids) {
      stmt.run(new Date().toISOString(), taskId);
    }
  });
  transaction(taskIds);

  ctx.body = successResponse(null, '任务已从迭代中移除');
});

router.post('/:id/start', async (ctx) => {
  const { id } = ctx.params;

  const sprint = db.prepare('SELECT id, status FROM sprints WHERE id = ?').get(id) as Sprint | undefined;
  if (!sprint) {
    ctx.body = errorResponse('迭代不存在', 404);
    return;
  }

  if (sprint.status !== 'planning') {
    ctx.body = errorResponse('只能开启规划中的迭代', 400);
    return;
  }

  db.prepare('UPDATE sprints SET status = \'active\', updatedAt = ? WHERE id = ?').run(new Date().toISOString(), id);
  ctx.body = successResponse(null, '迭代已开启');
});

router.post('/:id/pause', async (ctx) => {
  const { id } = ctx.params;

  const sprint = db.prepare('SELECT id, status FROM sprints WHERE id = ?').get(id) as Sprint | undefined;
  if (!sprint) {
    ctx.body = errorResponse('迭代不存在', 404);
    return;
  }

  if (sprint.status !== 'active') {
    ctx.body = errorResponse('只能暂停进行中的迭代', 400);
    return;
  }

  db.prepare('UPDATE sprints SET status = \'paused\', updatedAt = ? WHERE id = ?').run(new Date().toISOString(), id);
  ctx.body = successResponse(null, '迭代已暂停');
});

router.post('/:id/resume', async (ctx) => {
  const { id } = ctx.params;

  const sprint = db.prepare('SELECT id, status FROM sprints WHERE id = ?').get(id) as Sprint | undefined;
  if (!sprint) {
    ctx.body = errorResponse('迭代不存在', 404);
    return;
  }

  if (sprint.status !== 'paused') {
    ctx.body = errorResponse('只能恢复已暂停的迭代', 400);
    return;
  }

  db.prepare('UPDATE sprints SET status = \'active\', updatedAt = ? WHERE id = ?').run(new Date().toISOString(), id);
  ctx.body = successResponse(null, '迭代已恢复');
});

router.post('/:id/complete', async (ctx) => {
  const { id } = ctx.params;

  const sprint = db.prepare('SELECT id, status FROM sprints WHERE id = ?').get(id) as Sprint | undefined;
  if (!sprint) {
    ctx.body = errorResponse('迭代不存在', 404);
    return;
  }

  if (sprint.status !== 'active' && sprint.status !== 'paused') {
    ctx.body = errorResponse('只能结束进行中或已暂停的迭代', 400);
    return;
  }

  db.prepare('UPDATE sprints SET status = \'completed\', updatedAt = ? WHERE id = ?').run(new Date().toISOString(), id);
  ctx.body = successResponse(null, '迭代已结束');
});

export default router;
