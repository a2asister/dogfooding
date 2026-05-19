import Router from 'koa-router';
import db from '../db';
import { authMiddleware } from '../middleware/auth';

const router = new Router({ prefix: '/api/message' });

router.get('/list', authMiddleware(), async (ctx) => {
  const { userId } = ctx.state.user;
  const { page = 1, pageSize = 20, type, isRead } = ctx.query;
  const offset = (Number(page) - 1) * Number(pageSize);

  let whereClause = 'WHERE userId = ?';
  const params: unknown[] = [userId];

  if (type) {
    whereClause += ' AND type = ?';
    params.push(type);
  }

  if (isRead !== undefined) {
    whereClause += ' AND isRead = ?';
    params.push(isRead === 'true' ? 1 : 0);
  }

  const messages = db.prepare(`
    SELECT * FROM messages ${whereClause}
    ORDER BY createdAt DESC LIMIT ? OFFSET ?
  `).all(...params, Number(pageSize), offset);

  const total = db.prepare(`SELECT COUNT(*) as count FROM messages ${whereClause}`).get(...params) as { count: number };

  const unreadCount = db.prepare(`
    SELECT COUNT(*) as count FROM messages WHERE userId = ? AND isRead = 0
  `).get(userId) as { count: number };

  ctx.body = { code: 200, data: { messages, total: total.count, unreadCount: unreadCount.count } };
});

router.get('/unread', authMiddleware(), async (ctx) => {
  const { userId } = ctx.state.user;
  
  const result = db.prepare(`
    SELECT COUNT(*) as count FROM messages WHERE userId = ? AND isRead = 0
  `).get(userId) as { count: number };

  ctx.body = { code: 200, data: { unreadCount: result.count } };
});

router.post('/read/:id', authMiddleware(), async (ctx) => {
  const { userId } = ctx.state.user;
  const messageId = Number(ctx.params.id);

  db.prepare(`
    UPDATE messages SET isRead = 1 WHERE id = ? AND userId = ?
  `).run(messageId, userId);

  ctx.body = { code: 200, message: '标记已读成功' };
});

router.post('/read-all', authMiddleware(), async (ctx) => {
  const { userId } = ctx.state.user;

  db.prepare(`
    UPDATE messages SET isRead = 1 WHERE userId = ?
  `).run(userId);

  ctx.body = { code: 200, message: '全部标记已读成功' };
});

export default router;
