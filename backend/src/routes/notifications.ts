import Router from 'koa-router';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import { db } from '../db';
import { authMiddleware, AuthContext } from '../middleware/auth';

const router = new Router({ prefix: '/api/notifications' });

router.get('/', authMiddleware, async (ctx: AuthContext) => {
  const userId = ctx.state.user.id;
  const { unread } = ctx.query as { unread?: string };

  let query = 'SELECT * FROM notifications WHERE userId = ?';
  const params: string[] = [userId];

  if (unread === 'true') {
    query += ' AND read = 0';
  }

  query += ' ORDER BY createdAt DESC LIMIT 50';
  const notifications = db.prepare(query).all(...params);

  ctx.body = { notifications };
});

router.get('/unread-count', authMiddleware, async (ctx: AuthContext) => {
  const userId = ctx.state.user.id;
  const count = db.prepare('SELECT COUNT(*) as count FROM notifications WHERE userId = ? AND read = 0')
    .get(userId) as { count: number };

  ctx.body = { count: count.count };
});

router.put('/:id/read', authMiddleware, async (ctx: AuthContext) => {
  const notificationId = ctx.params.id;
  const userId = ctx.state.user.id;

  const notification = db.prepare('SELECT * FROM notifications WHERE id = ? AND userId = ?')
    .get(notificationId, userId);
  if (!notification) {
    ctx.status = 404;
    ctx.body = { error: '通知不存在' };
    return;
  }

  db.prepare('UPDATE notifications SET read = 1 WHERE id = ?').run(notificationId);
  ctx.body = { message: '已标记为已读' };
});

router.put('/read-all', authMiddleware, async (ctx: AuthContext) => {
  const userId = ctx.state.user.id;
  db.prepare('UPDATE notifications SET read = 1 WHERE userId = ?').run(userId);
  ctx.body = { message: '已全部标记为已读' };
});

export const createNotification = (userId: string, type: 'course' | 'homework' | 'system', title: string, content: string) => {
  const notificationId = uuidv4();
  const now = dayjs().toISOString();
  db.prepare(`
    INSERT INTO notifications (id, userId, type, title, content, read, createdAt)
    VALUES (?, ?, ?, ?, ?, 0, ?)
  `).run(notificationId, userId, type, title, content, now);
};

export default router;
