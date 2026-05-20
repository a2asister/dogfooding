import Router from 'koa-router';
import db from '../db';
import { success, PaginationResult } from '../utils/response';

const router = new Router({ prefix: '/api/notifications' });

router.get('/', async (ctx) => {
  const { page = 1, pageSize = 10, isRead, type } = ctx.query as any;
  const userId = ctx.user?.userId;

  if (!userId) {
    ctx.body = success({ list: [], total: 0, page: 1, pageSize: 10 });
    return;
  }

  let where = 'WHERE user_id = ?';
  const params: any[] = [userId];

  if (isRead !== undefined) {
    where += ' AND is_read = ?';
    params.push(isRead);
  }
  if (type) {
    where += ' AND type = ?';
    params.push(type);
  }

  const total = db.prepare(`SELECT COUNT(*) as count FROM notifications ${where}`).get(...params) as { count: number };
  
  const notifications = db.prepare(`
    SELECT * FROM notifications
    ${where}
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `).all(...params, pageSize, (page - 1) * pageSize) as any[];

  const result: PaginationResult<any> = {
    list: notifications.map(n => ({
      id: n.id,
      title: n.title,
      content: n.content,
      type: n.type,
      relatedId: n.related_id,
      relatedType: n.related_type,
      isRead: n.is_read,
      createdAt: n.created_at,
    })),
    total: total.count,
    page: Number(page),
    pageSize: Number(pageSize),
  };

  ctx.body = success(result);
});

router.get('/unread-count', async (ctx) => {
  const userId = ctx.user?.userId;

  if (!userId) {
    ctx.body = success({ count: 0 });
    return;
  }

  const result = db.prepare('SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0').get(userId) as { count: number };
  ctx.body = success({ count: result.count });
});

router.put('/:id/read', async (ctx) => {
  const { id } = ctx.params;
  const userId = ctx.user?.userId;

  db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?').run(id, userId);
  ctx.body = success(null, '标记已读成功');
});

router.put('/read-all', async (ctx) => {
  const userId = ctx.user?.userId;

  db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?').run(userId);
  ctx.body = success(null, '全部已读成功');
});

export function createNotification(userId: number, title: string, content: string, type: string, relatedId?: number, relatedType?: string) {
  db.prepare(`
    INSERT INTO notifications (user_id, title, content, type, related_id, related_type)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(userId, title, content, type, relatedId || null, relatedType || null);
}

export default router;
