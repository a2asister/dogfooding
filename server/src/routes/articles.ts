import Router from 'koa-router';
import db from '../db.js';
import { auth, type AuthContext } from '../middleware.js';
import { addPoints, createNotification, parseTags, updateTags, checkBadges } from '../utils.js';
import { POINT_RULES } from '../types.js';

const router = new Router();

router.get('/', async (ctx) => {
  const { page = 1, limit = 20, tag, topic, sort = 'latest' } = ctx.query as { page?: string; limit?: string; tag?: string; topic?: string; sort?: string };
  
  const offset = (Number(page) - 1) * Number(limit);
  let whereClause = "WHERE a.status = 'approved'";
  const params: (string | number)[] = [];
  
  if (tag) {
    whereClause += ' AND a.tags LIKE ?';
    params.push(`%${tag}%`);
  }
  
  if (topic) {
    whereClause += ' AND a.topic_id = ?';
    params.push(Number(topic));
  }
  
  let orderBy = 'ORDER BY a.is_pinned DESC, a.created_at DESC';
  if (sort === 'hot') {
    orderBy = 'ORDER BY a.is_pinned DESC, (a.likes + a.views * 0.1 + a.favorites * 2) DESC';
  }
  
  const articles = db.prepare(`
    SELECT a.*, u.username, u.avatar, u.level,
           EXISTS(SELECT 1 FROM likes l WHERE l.user_id = ? AND l.target_type = 'article' AND l.target_id = a.id) as is_liked,
           EXISTS(SELECT 1 FROM favorites f WHERE f.user_id = ? AND f.target_type = 'article' AND f.target_id = a.id) as is_favorited
    FROM articles a
    LEFT JOIN users u ON a.user_id = u.id
    ${whereClause}
    ${orderBy}
    LIMIT ? OFFSET ?
  `).all(null, null, ...params, Number(limit), offset) as Array<Record<string, unknown>>;
  
  const total = db.prepare(`SELECT COUNT(*) as count FROM articles a ${whereClause}`).get(...params) as { count: number };
  
  ctx.body = { data: articles, total: total.count };
});

router.get('/:id', async (ctx) => {
  const article = db.prepare(`
    SELECT a.*, u.username, u.avatar, u.level
    FROM articles a
    LEFT JOIN users u ON a.user_id = u.id
    WHERE a.id = ?
  `).get(Number(ctx.params.id)) as Record<string, unknown> | undefined;
  
  if (!article) {
    ctx.status = 404;
    ctx.body = { error: '文章不存在' };
    return;
  }
  
  db.prepare('UPDATE articles SET views = views + 1 WHERE id = ?').run(Number(ctx.params.id));
  
  ctx.body = { ...article, views: (article.views as number) + 1 };
});

router.post('/', auth(), async (ctx: AuthContext) => {
  const { title, content, summary, tags, topic_id, collection_id } = ctx.request.body as {
    title: string; content: string; summary?: string; tags?: string; topic_id?: number; collection_id?: number;
  };
  
  if (!title || !content) {
    ctx.status = 400;
    ctx.body = { error: '标题和内容不能为空' };
    return;
  }
  
  const userId = ctx.state.user!.id;
  const tagStr = tags ?? '';
  
  const result = db.prepare(`
    INSERT INTO articles (user_id, title, content, summary, tags, topic_id, collection_id, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'approved')
  `).run(userId, title, content, summary ?? null, tagStr, topic_id ?? null, collection_id ?? null);
  
  const tagNames = parseTags(tagStr);
  if (tagNames.length > 0) updateTags(tagNames);
  
  addPoints(userId, 'publish_article', POINT_RULES.PUBLISH_ARTICLE, '发布文章', result.lastInsertRowid as number, 'article');
  checkBadges(userId);
  
  ctx.body = { id: result.lastInsertRowid, success: true };
});

router.put('/:id', auth(), async (ctx: AuthContext) => {
  const { title, content, summary, tags } = ctx.request.body as { title: string; content: string; summary?: string; tags?: string };
  const id = Number(ctx.params.id);
  const userId = ctx.state.user!.id;
  
  const article = db.prepare('SELECT user_id FROM articles WHERE id = ?').get(id) as { user_id: number } | undefined;
  if (!article || article.user_id !== userId) {
    ctx.status = 403;
    ctx.body = { error: '无权限编辑' };
    return;
  }
  
  db.prepare('UPDATE articles SET title = ?, content = ?, summary = ?, tags = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
    .run(title, content, summary ?? null, tags ?? '', id);
  
  ctx.body = { success: true };
});

router.delete('/:id', auth(), async (ctx: AuthContext) => {
  const id = Number(ctx.params.id);
  const userId = ctx.state.user!.id;
  
  const article = db.prepare('SELECT user_id, status FROM articles WHERE id = ?').get(id) as { user_id: number; status: string } | undefined;
  if (!article) {
    ctx.status = 404;
    ctx.body = { error: '文章不存在' };
    return;
  }
  
  if (article.user_id !== userId && ctx.state.user!.role !== 'admin') {
    ctx.status = 403;
    ctx.body = { error: '无权限删除' };
    return;
  }
  
  db.prepare('DELETE FROM articles WHERE id = ?').run(id);
  
  if (article.status === 'approved') {
    addPoints(article.user_id, 'delete_article', POINT_RULES.CONTENT_DELETED, '文章被删除', id, 'article');
  }
  
  ctx.body = { success: true };
});

router.post('/:id/like', auth(), async (ctx: AuthContext) => {
  const id = Number(ctx.params.id);
  const userId = ctx.state.user!.id;
  
  const existing = db.prepare('SELECT id FROM likes WHERE user_id = ? AND target_type = ? AND target_id = ?').get(userId, 'article', id);
  
  if (existing) {
    db.prepare('DELETE FROM likes WHERE id = ?').run((existing as { id: number }).id);
    const likes = (await getLikes(id)) - 1;
    db.prepare('UPDATE articles SET likes = ? WHERE id = ?').run(likes, id);
    ctx.body = { liked: false, likes };
  } else {
    db.prepare('INSERT INTO likes (user_id, target_type, target_id) VALUES (?, ?, ?)').run(userId, 'article', id);
    const likes = (await getLikes(id)) + 1;
    db.prepare('UPDATE articles SET likes = ? WHERE id = ?').run(likes, id);
    
    const article = db.prepare('SELECT user_id, title FROM articles WHERE id = ?').get(id) as { user_id: number; title: string };
    if (article.user_id !== userId) {
      addPoints(article.user_id, 'content_liked', POINT_RULES.CONTENT_LIKED, '文章获点赞', id, 'article');
      createNotification(article.user_id, 'like', `${ctx.state.user!.username} 点赞了你的文章「${article.title}」`, id, 'article');
    }
    checkBadges(article.user_id);
    
    ctx.body = { liked: true, likes };
  }
});

router.post('/:id/favorite', auth(), async (ctx: AuthContext) => {
  const id = Number(ctx.params.id);
  const userId = ctx.state.user!.id;
  
  const existing = db.prepare('SELECT id FROM favorites WHERE user_id = ? AND target_type = ? AND target_id = ?').get(userId, 'article', id);
  
  if (existing) {
    db.prepare('DELETE FROM favorites WHERE id = ?').run((existing as { id: number }).id);
    const favorites = (await getFavorites(id)) - 1;
    db.prepare('UPDATE articles SET favorites = ? WHERE id = ?').run(favorites, id);
    ctx.body = { favorited: false, favorites };
  } else {
    db.prepare('INSERT INTO favorites (user_id, target_type, target_id) VALUES (?, ?, ?)').run(userId, 'article', id);
    const favorites = (await getFavorites(id)) + 1;
    db.prepare('UPDATE articles SET favorites = ? WHERE id = ?').run(favorites, id);
    
    const article = db.prepare('SELECT user_id, title FROM articles WHERE id = ?').get(id) as { user_id: number; title: string };
    if (article.user_id !== userId) {
      addPoints(article.user_id, 'content_favorited', POINT_RULES.CONTENT_FAVORITED, '文章获收藏', id, 'article');
      createNotification(article.user_id, 'comment', `${ctx.state.user!.username} 收藏了你的文章「${article.title}」`, id, 'article');
    }
    
    ctx.body = { favorited: true, favorites };
  }
});

async function getLikes(id: number): Promise<number> {
  const result = db.prepare('SELECT likes FROM articles WHERE id = ?').get(id) as { likes: number };
  return result.likes;
}

async function getFavorites(id: number): Promise<number> {
  const result = db.prepare('SELECT favorites FROM articles WHERE id = ?').get(id) as { favorites: number };
  return result.favorites;
}

export default router;
