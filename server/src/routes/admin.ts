import Router from 'koa-router';
import db from '../db.js';
import { auth, admin, type AuthContext } from '../middleware.js';
import { addPoints } from '../utils.js';
import { POINT_RULES } from '../types.js';

const router = new Router();

router.get('/articles/pending', auth(), admin(), async (ctx: AuthContext) => {
  const articles = db.prepare(`
    SELECT a.*, u.username
    FROM articles a
    LEFT JOIN users u ON a.user_id = u.id
    WHERE a.status = 'pending'
    ORDER BY a.created_at DESC
  `).all() as Array<Record<string, unknown>>;
  ctx.body = { data: articles };
});

router.post('/articles/:id/approve', auth(), admin(), async (ctx: AuthContext) => {
  const id = Number(ctx.params.id);
  db.prepare("UPDATE articles SET status = 'approved', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(id);
  
  const article = db.prepare('SELECT user_id FROM articles WHERE id = ?').get(id) as { user_id: number };
  if (article) {
    createNotification(article.user_id, 'system', '🎉 你的文章已通过审核！', id, 'article');
  }
  
  ctx.body = { success: true };
});

router.post('/articles/:id/reject', auth(), admin(), async (ctx: AuthContext) => {
  const id = Number(ctx.params.id);
  const { reason } = ctx.request.body as { reason?: string };
  
  db.prepare("UPDATE articles SET status = 'rejected', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(id);
  
  const article = db.prepare('SELECT user_id, title FROM articles WHERE id = ?').get(id) as { user_id: number; title: string };
  if (article) {
    addPoints(article.user_id, 'article_rejected', POINT_RULES.CONTENT_DELETED, '文章审核未通过', id, 'article');
    createNotification(article.user_id, 'system', `你的文章「${article.title}」未通过审核${reason ? `：${reason}` : ''}`, id, 'article');
  }
  
  ctx.body = { success: true };
});

router.post('/articles/:id/pin', auth(), admin(), async (ctx: AuthContext) => {
  const id = Number(ctx.params.id);
  const { pinned } = ctx.request.body as { pinned: boolean };
  db.prepare('UPDATE articles SET is_pinned = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(pinned ? 1 : 0, id);
  ctx.body = { success: true };
});

router.post('/articles/:id/feature', auth(), admin(), async (ctx: AuthContext) => {
  const id = Number(ctx.params.id);
  const { featured } = ctx.request.body as { featured: boolean };
  db.prepare('UPDATE articles SET is_featured = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(featured ? 1 : 0, id);
  ctx.body = { success: true };
});

router.get('/questions/pending', auth(), admin(), async (ctx: AuthContext) => {
  const questions = db.prepare(`
    SELECT q.*, u.username
    FROM questions q
    LEFT JOIN users u ON q.user_id = u.id
    WHERE q.status = 'pending'
    ORDER BY q.created_at DESC
  `).all() as Array<Record<string, unknown>>;
  ctx.body = { data: questions };
});

router.post('/questions/:id/approve', auth(), admin(), async (ctx: AuthContext) => {
  const id = Number(ctx.params.id);
  db.prepare("UPDATE questions SET status = 'approved', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(id);
  ctx.body = { success: true };
});

router.post('/questions/:id/reject', auth(), admin(), async (ctx: AuthContext) => {
  const id = Number(ctx.params.id);
  db.prepare("UPDATE questions SET status = 'rejected', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(id);
  ctx.body = { success: true };
});

router.get('/users', auth(), admin(), async (ctx: AuthContext) => {
  const { page = 1, limit = 20 } = ctx.query as { page?: string; limit?: string };
  const offset = (Number(page) - 1) * Number(limit);
  
  const users = db.prepare('SELECT id, username, email, points, level, role, status, created_at FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?')
    .all(Number(limit), offset) as Array<Record<string, unknown>>;
  
  const total = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  
  ctx.body = { data: users, total: total.count };
});

router.post('/users/:id/ban', auth(), admin(), async (ctx: AuthContext) => {
  const id = Number(ctx.params.id);
  const { banned } = ctx.request.body as { banned: boolean };
  
  db.prepare('UPDATE users SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(banned ? 'banned' : 'active', id);
  
  if (banned) {
    addPoints(id, 'account_banned', POINT_RULES.CHEAT, '账号被封禁', id, 'user');
  }
  
  ctx.body = { success: true };
});

router.post('/users/:id/role', auth(), admin(), async (ctx: AuthContext) => {
  const id = Number(ctx.params.id);
  const { role } = ctx.request.body as { role: 'user' | 'admin' };
  db.prepare('UPDATE users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(role, id);
  ctx.body = { success: true };
});

router.post('/topics', auth(), admin(), async (ctx: AuthContext) => {
  const { title, description, cover } = ctx.request.body as { title: string; description?: string; cover?: string };
  const result = db.prepare('INSERT INTO topics (title, description, cover) VALUES (?, ?, ?)').run(title, description ?? null, cover ?? null);
  ctx.body = { id: result.lastInsertRowid, success: true };
});

router.put('/topics/:id', auth(), admin(), async (ctx: AuthContext) => {
  const id = Number(ctx.params.id);
  const { title, description, cover, is_active } = ctx.request.body as { title?: string; description?: string; cover?: string; is_active?: boolean };
  
  db.prepare('UPDATE topics SET title = COALESCE(?, title), description = COALESCE(?, description), cover = COALESCE(?, cover), is_active = COALESCE(?, is_active) WHERE id = ?')
    .run(title ?? null, description ?? null, cover ?? null, is_active !== undefined ? (is_active ? 1 : 0) : null, id);
  
  ctx.body = { success: true };
});

router.delete('/topics/:id', auth(), admin(), async (ctx: AuthContext) => {
  const id = Number(ctx.params.id);
  db.prepare('DELETE FROM topics WHERE id = ?').run(id);
  ctx.body = { success: true };
});

router.get('/stats', auth(), admin(), async (ctx: AuthContext) => {    
  const stats = db.prepare(`
    SELECT
      (SELECT COUNT(*) FROM users) as total_users,
      (SELECT COUNT(*) FROM articles WHERE status = 'approved') as total_articles,
      (SELECT COUNT(*) FROM questions WHERE status IN ('approved', 'resolved')) as total_questions,
      (SELECT COUNT(*) FROM projects) as total_projects,
      (SELECT COUNT(*) FROM articles WHERE status = 'pending') as pending_articles,
      (SELECT COUNT(*) FROM questions WHERE status = 'pending') as pending_questions
  `).get() as Record<string, number>;
  
  ctx.body = { data: stats };
});

function createNotification(userId: number, type: string, content: string, relatedId?: number, relatedType?: string): void {
  db.prepare('INSERT INTO notifications (user_id, type, content, related_id, related_type) VALUES (?, ?, ?, ?, ?)')
    .run(userId, type, content, relatedId ?? null, relatedType ?? null);
}

export default router;
