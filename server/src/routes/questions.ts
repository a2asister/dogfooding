import Router from 'koa-router';
import db from '../db.js';
import { auth, type AuthContext } from '../middleware.js';
import { addPoints, createNotification, parseTags, updateTags, checkBadges } from '../utils.js';
import { POINT_RULES } from '../types.js';

const router = new Router();

router.get('/', async (ctx) => {
  const { page = 1, limit = 20, tag, status, sort = 'latest' } = ctx.query as { page?: string; limit?: string; tag?: string; status?: string; sort?: string };
  
  const offset = (Number(page) - 1) * Number(limit);
  let whereClause = "WHERE q.status IN ('approved', 'resolved')";
  const params: (string | number)[] = [];
  
  if (tag) {
    whereClause += ' AND q.tags LIKE ?';
    params.push(`%${tag}%`);
  }
  
  if (status) {
    whereClause += ' AND q.status = ?';
    params.push(status);
  }
  
  let orderBy = 'ORDER BY q.created_at DESC';
  if (sort === 'hot') {
    orderBy = 'ORDER BY (q.likes + q.views * 0.1) DESC';
  } else if (sort === 'unanswered') {
    whereClause += " AND q.accepted_answer_id IS NULL";
  }
  
  const questions = db.prepare(`
    SELECT q.*, u.username, u.avatar, u.level,
           (SELECT COUNT(*) FROM answers a WHERE a.question_id = q.id) as answer_count
    FROM questions q
    LEFT JOIN users u ON q.user_id = u.id
    ${whereClause}
    ${orderBy}
    LIMIT ? OFFSET ?
  `).all(...params, Number(limit), offset) as Array<Record<string, unknown>>;
  
  const total = db.prepare(`SELECT COUNT(*) as count FROM questions q ${whereClause}`).get(...params) as { count: number };
  
  ctx.body = { data: questions, total: total.count };
});

router.get('/:id', async (ctx) => {
  const question = db.prepare(`
    SELECT q.*, u.username, u.avatar, u.level
    FROM questions q
    LEFT JOIN users u ON q.user_id = u.id
    WHERE q.id = ?
  `).get(Number(ctx.params.id)) as Record<string, unknown> | undefined;
  
  if (!question) {
    ctx.status = 404;
    ctx.body = { error: '问题不存在' };
    return;
  }
  
  db.prepare('UPDATE questions SET views = views + 1 WHERE id = ?').run(Number(ctx.params.id));
  
  const answers = db.prepare(`
    SELECT a.*, u.username, u.avatar, u.level,
           EXISTS(SELECT 1 FROM likes l WHERE l.user_id = ? AND l.target_type = 'answer' AND l.target_id = a.id) as is_liked
    FROM answers a
    LEFT JOIN users u ON a.user_id = u.id
    WHERE a.question_id = ?
    ORDER BY a.is_accepted DESC, a.likes DESC, a.created_at ASC
  `).all(null, Number(ctx.params.id)) as Array<Record<string, unknown>>;
  
  ctx.body = { ...question, views: (question.views as number) + 1, answers };
});

router.post('/', auth(), async (ctx: AuthContext) => {
  const { title, content, tags } = ctx.request.body as { title: string; content: string; tags?: string };
  
  if (!title || !content) {
    ctx.status = 400;
    ctx.body = { error: '标题和内容不能为空' };
    return;
  }
  
  const userId = ctx.state.user!.id;
  const tagStr = tags ?? '';
  
  const result = db.prepare('INSERT INTO questions (user_id, title, content, tags, status) VALUES (?, ?, ?, ?, \'approved\')').run(userId, title, content, tagStr);
  
  const tagNames = parseTags(tagStr);
  if (tagNames.length > 0) updateTags(tagNames);
  
  addPoints(userId, 'publish_question', POINT_RULES.PUBLISH_QUESTION, '发布问答', result.lastInsertRowid as number, 'question');
  checkBadges(userId);
  
  ctx.body = { id: result.lastInsertRowid, success: true };
});

router.post('/:id/answers', auth(), async (ctx: AuthContext) => {
  const { content } = ctx.request.body as { content: string };
  const questionId = Number(ctx.params.id);
  const userId = ctx.state.user!.id;
  
  if (!content) {
    ctx.status = 400;
    ctx.body = { error: '回答内容不能为空' };
    return;
  }
  
  const question = db.prepare('SELECT user_id, title FROM questions WHERE id = ?').get(questionId) as { user_id: number; title: string } | undefined;
  if (!question) {
    ctx.status = 404;
    ctx.body = { error: '问题不存在' };
    return;
  }
  
  const result = db.prepare('INSERT INTO answers (question_id, user_id, content) VALUES (?, ?, ?)').run(questionId, userId, content);
  
  if (question.user_id !== userId) {
    createNotification(question.user_id, 'answer', `${ctx.state.user!.username} 回答了你的问题「${question.title}」`, questionId, 'question');
  }
  
  ctx.body = { id: result.lastInsertRowid, success: true };
});

router.post('/answers/:id/accept', auth(), async (ctx: AuthContext) => {
  const answerId = Number(ctx.params.id);
  const userId = ctx.state.user!.id;
  
  const answer = db.prepare('SELECT a.*, q.user_id as question_user_id FROM answers a JOIN questions q ON a.question_id = q.id WHERE a.id = ?').get(answerId) as { question_id: number; user_id: number; question_user_id: number } | undefined;
  
  if (!answer || answer.question_user_id !== userId) {
    ctx.status = 403;
    ctx.body = { error: '无权限采纳' };
    return;
  }
  
  db.prepare('UPDATE answers SET is_accepted = 0 WHERE question_id = ?').run(answer.question_id);
  db.prepare('UPDATE answers SET is_accepted = 1 WHERE id = ?').run(answerId);
  db.prepare("UPDATE questions SET accepted_answer_id = ?, status = 'resolved' WHERE id = ?").run(answerId, answer.question_id);
  
  addPoints(answer.user_id, 'answer_accepted', POINT_RULES.ANSWER_ACCEPTED, '回答被采纳', answerId, 'answer');
  createNotification(answer.user_id, 'system', '🎉 你的回答被采纳了！', answer.question_id, 'question');
  checkBadges(answer.user_id);
  
  ctx.body = { success: true };
});

router.post('/answers/:id/like', auth(), async (ctx: AuthContext) => {
  const id = Number(ctx.params.id);
  const userId = ctx.state.user!.id;
  
  const existing = db.prepare('SELECT id FROM likes WHERE user_id = ? AND target_type = ? AND target_id = ?').get(userId, 'answer', id);
  
  if (existing) {
    db.prepare('DELETE FROM likes WHERE id = ?').run((existing as { id: number }).id);
    db.prepare('UPDATE answers SET likes = likes - 1 WHERE id = ?').run(id);
    ctx.body = { liked: false };
  } else {
    db.prepare('INSERT INTO likes (user_id, target_type, target_id) VALUES (?, ?, ?)').run(userId, 'answer', id);
    db.prepare('UPDATE answers SET likes = likes + 1 WHERE id = ?').run(id);
    
    const answer = db.prepare('SELECT user_id FROM answers WHERE id = ?').get(id) as { user_id: number };
    if (answer.user_id !== userId) {
      addPoints(answer.user_id, 'content_liked', POINT_RULES.CONTENT_LIKED, '回答获点赞', id, 'answer');
    }
    
    ctx.body = { liked: true };
  }
});

export default router;
