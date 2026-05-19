import Router from 'koa-router';
import db from '../db.js';
import { auth, type AuthContext } from '../middleware.js';
import { LEVEL_CONFIG } from '../types.js';

const router = new Router();

router.get('/tags', async (ctx) => {
  const tags = db.prepare('SELECT * FROM tags ORDER BY usage_count DESC LIMIT 50').all() as Array<Record<string, unknown>>;
  ctx.body = { data: tags };
});

router.get('/topics', async (ctx) => {
  const topics = db.prepare('SELECT * FROM topics WHERE is_active = 1 ORDER BY article_count DESC').all() as Array<Record<string, unknown>>;
  ctx.body = { data: topics };
});

router.get('/collections', async (ctx) => {
  const collections = db.prepare(`
    SELECT c.*, u.username, u.avatar
    FROM collections c
    LEFT JOIN users u ON c.user_id = u.id
    WHERE c.is_public = 1
    ORDER BY c.article_count DESC
    LIMIT 20
  `).all() as Array<Record<string, unknown>>;
  ctx.body = { data: collections };
});

router.get('/badges', async (ctx) => {
  const badges = db.prepare('SELECT * FROM badges').all() as Array<Record<string, unknown>>;
  ctx.body = { data: badges };
});

router.get('/levels', async (ctx) => {
  ctx.body = { data: LEVEL_CONFIG };
});

router.get('/notifications', auth(), async (ctx: AuthContext) => {
  const { page = 1, limit = 20, unread } = ctx.query as { page?: string; limit?: string; unread?: string };
  
  const offset = (Number(page) - 1) * Number(limit);
  let whereClause = 'WHERE user_id = ?';
  const params: (number | string)[] = [ctx.state.user!.id];
  
  if (unread === 'true') {
    whereClause += ' AND is_read = 0';
  }
  
  const notifications = db.prepare(`
    SELECT * FROM notifications
    ${whereClause}
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `).all(...params, Number(limit), offset) as Array<Record<string, unknown>>;
  
  const total = db.prepare(`SELECT COUNT(*) as count FROM notifications ${whereClause}`).get(...params) as { count: number };
  
  ctx.body = { data: notifications, total: total.count };
});

router.get('/notifications/unread-count', auth(), async (ctx: AuthContext) => {
  const count = db.prepare('SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0')
    .get(ctx.state.user!.id) as { count: number };
  ctx.body = { count: count.count };
});

router.post('/notifications/read', auth(), async (ctx: AuthContext) => {
  const { ids } = ctx.request.body as { ids?: number[] };
  
  if (ids && ids.length > 0) {
    const placeholders = ids.map(() => '?').join(',');
    db.prepare(`UPDATE notifications SET is_read = 1 WHERE id IN (${placeholders}) AND user_id = ?`)
      .run(...ids, ctx.state.user!.id);
  } else {
    db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?').run(ctx.state.user!.id);
  }
  
  ctx.body = { success: true };
});

router.get('/users/:id', async (ctx) => {
  const userId = Number(ctx.params.id);
  
  const user = db.prepare('SELECT id, username, avatar, bio, points, level, role, created_at FROM users WHERE id = ?')
    .get(userId) as Record<string, unknown> | undefined;
  
  if (!user) {
    ctx.status = 404;
    ctx.body = { error: '用户不存在' };
    return;
  }
  
  const articles = db.prepare("SELECT id, title, summary, likes, views, created_at FROM articles WHERE user_id = ? AND status = 'approved' ORDER BY created_at DESC LIMIT 10")
    .all(userId) as Array<Record<string, unknown>>;
  
  const projects = db.prepare('SELECT id, title, description, status, progress, likes, created_at FROM projects WHERE user_id = ? ORDER BY created_at DESC LIMIT 10')
    .all(userId) as Array<Record<string, unknown>>;
  
  const badges = db.prepare(`
    SELECT b.*, ub.earned_at
    FROM user_badges ub
    JOIN badges b ON ub.badge_id = b.id
    WHERE ub.user_id = ?
    ORDER BY ub.earned_at DESC
  `).all(userId) as Array<Record<string, unknown>>;
  
  ctx.body = { ...user, articles, projects, badges };
});

router.get('/recommend', auth(), async (ctx: AuthContext) => {
  const userId = ctx.state.user!.id;
  
  const userTags = db.prepare(`
    SELECT DISTINCT t.name
    FROM tags t
    JOIN articles a ON a.tags LIKE '%' || t.name || '%'
    WHERE a.user_id = ? AND a.status = 'approved'
    LIMIT 10
  `).all(userId) as Array<{ name: string }>;
  
  let articles: Array<Record<string, unknown>>;
  
  if (userTags.length > 0) {
    const tagConditions = userTags.map(() => 'a.tags LIKE ?').join(' OR ');
    const tagParams = userTags.map(t => `%${t.name}%`);
    
    articles = db.prepare(`
      SELECT a.*, u.username, u.avatar, u.level
      FROM articles a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE a.status = 'approved' AND (${tagConditions})
      ORDER BY (a.likes + a.views * 0.1) DESC
      LIMIT 20
    `).all(...tagParams) as Array<Record<string, unknown>>;
  } else {
    articles = db.prepare(`
      SELECT a.*, u.username, u.avatar, u.level
      FROM articles a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE a.status = 'approved'
      ORDER BY (a.likes + a.views * 0.1) DESC
      LIMIT 20
    `).all() as Array<Record<string, unknown>>;
  }
  
  ctx.body = { data: articles };
});

router.get('/featured', async (ctx) => {
  const pinned = db.prepare(`
    SELECT a.*, u.username, u.avatar, u.level
    FROM articles a
    LEFT JOIN users u ON a.user_id = u.id
    WHERE a.status = 'approved' AND a.is_pinned = 1
    ORDER BY a.updated_at DESC
  `).all() as Array<Record<string, unknown>>;
  
  const featured = db.prepare(`
    SELECT a.*, u.username, u.avatar, u.level
    FROM articles a
    LEFT JOIN users u ON a.user_id = u.id
    WHERE a.status = 'approved' AND a.is_featured = 1 AND a.is_pinned = 0
    ORDER BY a.updated_at DESC
    LIMIT 10
  `).all() as Array<Record<string, unknown>>;
  
  ctx.body = { pinned, featured };
});

export default router;
