import Router from 'koa-router';
import db from '../db.js';
import { auth, type AuthContext } from '../middleware.js';
import { addPoints, createNotification } from '../utils.js';
import { POINT_RULES } from '../types.js';

const router = new Router();

router.get('/', async (ctx) => {
  const { target_type, target_id, page = 1, limit = 20 } = ctx.query as { target_type: string; target_id: string; page?: string; limit?: string };
  
  const offset = (Number(page) - 1) * Number(limit);
  
  const comments = db.prepare(`
    SELECT c.*, u.username, u.avatar, u.level,
           EXISTS(SELECT 1 FROM likes l WHERE l.user_id = ? AND l.target_type = 'comment' AND l.target_id = c.id) as is_liked,
           (SELECT COUNT(*) FROM comments WHERE parent_id = c.id) as reply_count
    FROM comments c
    LEFT JOIN users u ON c.user_id = u.id
    WHERE c.target_type = ? AND c.target_id = ? AND c.parent_id IS NULL AND c.status = 'approved'
    ORDER BY c.created_at DESC
    LIMIT ? OFFSET ?
  `).all(null, target_type, Number(target_id), Number(limit), offset) as Array<Record<string, unknown>>;
  
  const total = db.prepare('SELECT COUNT(*) as count FROM comments WHERE target_type = ? AND target_id = ? AND parent_id IS NULL AND status = ?')
    .get(target_type, Number(target_id), 'approved') as { count: number };
  
  ctx.body = { data: comments, total: total.count };
});

router.get('/:id/replies', async (ctx) => {
  const parentId = Number(ctx.params.id);
  
  const replies = db.prepare(`
    SELECT c.*, u.username, u.avatar, u.level,
           EXISTS(SELECT 1 FROM likes l WHERE l.user_id = ? AND l.target_type = 'comment' AND l.target_id = c.id) as is_liked
    FROM comments c
    LEFT JOIN users u ON c.user_id = u.id
    WHERE c.parent_id = ? AND c.status = 'approved'
    ORDER BY c.created_at ASC
  `).all(null, parentId) as Array<Record<string, unknown>>;
  
  ctx.body = { data: replies };
});

router.post('/', auth(), async (ctx: AuthContext) => {
  const { target_type, target_id, parent_id, content } = ctx.request.body as {
    target_type: 'article' | 'question' | 'answer' | 'project';
    target_id: number;
    parent_id?: number;
    content: string;
  };
  
  if (!content) {
    ctx.status = 400;
    ctx.body = { error: '评论内容不能为空' };
    return;
  }
  
  const userId = ctx.state.user!.id;
  
  const result = db.prepare(`
    INSERT INTO comments (target_type, target_id, parent_id, user_id, content)
    VALUES (?, ?, ?, ?, ?)
  `).run(target_type, target_id, parent_id ?? null, userId, content);
  
  const tableMap: Record<string, string> = {
    article: 'articles',
    question: 'questions',
    answer: 'answers',
    project: 'projects',
  };
  const table = tableMap[target_type];
  if (table) {
    db.prepare(`UPDATE ${table} SET comments = comments + 1 WHERE id = ?`).run(target_id);
  }
  
  const targetInfo = db.prepare(`SELECT user_id, title FROM ${table} WHERE id = ?`).get(target_id) as { user_id: number; title: string } | undefined;
  if (targetInfo && targetInfo.user_id !== userId) {
    const typeNames: Record<string, string> = {
      article: '文章',
      question: '问题',
      answer: '回答',
      project: '项目',
    };
    createNotification(
      targetInfo.user_id,
      'comment',
      `${ctx.state.user!.username} 评论了你的${typeNames[target_type]}「${targetInfo.title}」`,
      target_id,
      target_type
    );
  }
  
  if (parent_id) {
    const parent = db.prepare('SELECT user_id FROM comments WHERE id = ?').get(parent_id) as { user_id: number } | undefined;
    if (parent && parent.user_id !== userId) {
      createNotification(parent.user_id, 'comment', `${ctx.state.user!.username} 回复了你的评论`, parent_id, 'comment');
    }
  }
  
  ctx.body = { id: result.lastInsertRowid, success: true };
});

router.post('/:id/like', auth(), async (ctx: AuthContext) => {
  const id = Number(ctx.params.id);
  const userId = ctx.state.user!.id;
  
  const existing = db.prepare('SELECT id FROM likes WHERE user_id = ? AND target_type = ? AND target_id = ?').get(userId, 'comment', id);
  
  if (existing) {
    db.prepare('DELETE FROM likes WHERE id = ?').run((existing as { id: number }).id);
    db.prepare('UPDATE comments SET likes = likes - 1 WHERE id = ?').run(id);
    ctx.body = { liked: false };
  } else {
    db.prepare('INSERT INTO likes (user_id, target_type, target_id) VALUES (?, ?, ?)').run(userId, 'comment', id);
    db.prepare('UPDATE comments SET likes = likes + 1 WHERE id = ?').run(id);
    
    const comment = db.prepare('SELECT user_id FROM comments WHERE id = ?').get(id) as { user_id: number };
    if (comment.user_id !== userId) {
      addPoints(comment.user_id, 'content_liked', POINT_RULES.CONTENT_LIKED, '评论获点赞', id, 'comment');
    }
    
    ctx.body = { liked: true };
  }
});

router.delete('/:id', auth(), async (ctx: AuthContext) => {
  const id = Number(ctx.params.id);
  const userId = ctx.state.user!.id;
  
  const comment = db.prepare('SELECT user_id, target_type, target_id FROM comments WHERE id = ?').get(id) as { user_id: number; target_type: string; target_id: number } | undefined;
  
  if (!comment) {
    ctx.status = 404;
    ctx.body = { error: '评论不存在' };
    return;
  }
  
  if (comment.user_id !== userId && ctx.state.user!.role !== 'admin') {
    ctx.status = 403;
    ctx.body = { error: '无权限删除' };
    return;
  }
  
  db.prepare('DELETE FROM comments WHERE id = ?').run(id);
  
  const tableMap: Record<string, string> = {
    article: 'articles',
    question: 'questions',
    answer: 'answers',
    project: 'projects',
  };
  const table = tableMap[comment.target_type];
  if (table) {
    db.prepare(`UPDATE ${table} SET comments = MAX(comments - 1, 0) WHERE id = ?`).run(comment.target_id);
  }
  
  ctx.body = { success: true };
});

export default router;
