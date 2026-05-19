import Router from 'koa-router';
import db from '../db.js';
import { auth, type AuthContext } from '../middleware.js';
import { addPoints, createNotification, parseTags, updateTags, checkBadges } from '../utils.js';
import { POINT_RULES } from '../types.js';

const router = new Router();

router.get('/', async (ctx) => {
  const { page = 1, limit = 20, tag, status, sort = 'latest' } = ctx.query as { page?: string; limit?: string; tag?: string; status?: string; sort?: string };
  
  const offset = (Number(page) - 1) * Number(limit);
  let whereClause = 'WHERE 1=1';
  const params: (string | number)[] = [];
  
  if (tag) {
    whereClause += ' AND p.tags LIKE ?';
    params.push(`%${tag}%`);
  }
  
  if (status) {
    whereClause += ' AND p.status = ?';
    params.push(status);
  }
  
  let orderBy = 'ORDER BY p.created_at DESC';
  if (sort === 'hot') {
    orderBy = 'ORDER BY (p.likes + p.views * 0.1 + p.favorites * 2) DESC';
  }
  
  const projects = db.prepare(`
    SELECT p.*, u.username, u.avatar, u.level,
           EXISTS(SELECT 1 FROM likes l WHERE l.user_id = ? AND l.target_type = 'project' AND l.target_id = p.id) as is_liked,
           EXISTS(SELECT 1 FROM favorites f WHERE f.user_id = ? AND f.target_type = 'project' AND f.target_id = p.id) as is_favorited
    FROM projects p
    LEFT JOIN users u ON p.user_id = u.id
    ${whereClause}
    ${orderBy}
    LIMIT ? OFFSET ?
  `).all(null, null, ...params, Number(limit), offset) as Array<Record<string, unknown>>;
  
  const total = db.prepare(`SELECT COUNT(*) as count FROM projects p ${whereClause}`).get(...params) as { count: number };
  
  ctx.body = { data: projects, total: total.count };
});

router.get('/:id', async (ctx) => {
  const project = db.prepare(`
    SELECT p.*, u.username, u.avatar, u.level
    FROM projects p
    LEFT JOIN users u ON p.user_id = u.id
    WHERE p.id = ?
  `).get(Number(ctx.params.id)) as Record<string, unknown> | undefined;
  
  if (!project) {
    ctx.status = 404;
    ctx.body = { error: '项目不存在' };
    return;
  }
  
  db.prepare('UPDATE projects SET views = views + 1 WHERE id = ?').run(Number(ctx.params.id));
  
  const members = db.prepare(`
    SELECT pm.*, u.username, u.avatar, u.level
    FROM project_members pm
    LEFT JOIN users u ON pm.user_id = u.id
    WHERE pm.project_id = ? AND pm.status = 'approved'
    ORDER BY pm.role = 'owner' DESC, pm.applied_at ASC
  `).all(Number(ctx.params.id)) as Array<Record<string, unknown>>;
  
  const resources = db.prepare(`
    SELECT r.*, u.username
    FROM resources r
    LEFT JOIN users u ON r.user_id = u.id
    WHERE r.project_id = ?
    ORDER BY r.created_at DESC
  `).all(Number(ctx.params.id)) as Array<Record<string, unknown>>;
  
  ctx.body = { ...project, views: (project.views as number) + 1, members, resources };
});

router.post('/', auth(), async (ctx: AuthContext) => {
  const { title, description, content, tags, team_size } = ctx.request.body as {
    title: string; description: string; content: string; tags?: string; team_size?: number;
  };
  
  if (!title || !description || !content) {
    ctx.status = 400;
    ctx.body = { error: '请填写完整信息' };
    return;
  }
  
  const userId = ctx.state.user!.id;
  const tagStr = tags ?? '';
  
  const result = db.prepare(`
    INSERT INTO projects (user_id, title, description, content, tags, team_size)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(userId, title, description, content, tagStr, team_size ?? 5);
  
  const projectId = result.lastInsertRowid as number;
  
  db.prepare("INSERT INTO project_members (project_id, user_id, role, status) VALUES (?, ?, 'owner', 'approved')").run(projectId, userId);
  
  const tagNames = parseTags(tagStr);
  if (tagNames.length > 0) updateTags(tagNames);
  
  addPoints(userId, 'publish_project', POINT_RULES.PUBLISH_PROJECT, '发布共建项目', projectId, 'project');
  checkBadges(userId);
  
  ctx.body = { id: projectId, success: true };
});

router.post('/:id/join', auth(), async (ctx: AuthContext) => {
  const projectId = Number(ctx.params.id);
  const userId = ctx.state.user!.id;
  
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId) as { status: string; current_members: number; team_size: number } | undefined;
  if (!project) {
    ctx.status = 404;
    ctx.body = { error: '项目不存在' };
    return;
  }
  
  if (project.status !== 'recruiting') {
    ctx.status = 400;
    ctx.body = { error: '该项目暂不招募成员' };
    return;
  }
  
  if (project.current_members >= project.team_size) {
    ctx.status = 400;
    ctx.body = { error: '项目成员已满' };
    return;
  }
  
  try {
    db.prepare("INSERT INTO project_members (project_id, user_id, role, status) VALUES (?, ?, 'member', 'pending')").run(projectId, userId);
    
    const owner = db.prepare("SELECT user_id FROM project_members WHERE project_id = ? AND role = 'owner'").get(projectId) as { user_id: number };
    createNotification(owner.user_id, 'project', `${ctx.state.user!.username} 申请加入你的项目`, projectId, 'project');
    
    ctx.body = { success: true };
  } catch {
    ctx.status = 400;
    ctx.body = { error: '已申请或已加入该项目' };
  }
});

router.post('/:id/members/:memberId/approve', auth(), async (ctx: AuthContext) => {
  const projectId = Number(ctx.params.id);
  const memberId = Number(ctx.params.memberId);
  const userId = ctx.state.user!.id;
  
  const membership = db.prepare("SELECT * FROM project_members WHERE project_id = ? AND user_id = ? AND role = 'owner' AND status = 'approved'").get(projectId, userId);
  if (!membership) {
    ctx.status = 403;
    ctx.body = { error: '无权限操作' };
    return;
  }
  
  db.prepare("UPDATE project_members SET status = 'approved', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(memberId);
  db.prepare('UPDATE projects SET current_members = current_members + 1 WHERE id = ?').run(projectId);
  
  const member = db.prepare('SELECT user_id FROM project_members WHERE id = ?').get(memberId) as { user_id: number };
  createNotification(member.user_id, 'project', '你已被批准加入项目！', projectId, 'project');
  
  ctx.body = { success: true };
});

router.post('/:id/resources', auth(), async (ctx: AuthContext) => {
  const projectId = Number(ctx.params.id);
  const { title, description, url, type } = ctx.request.body as { title: string; description?: string; url: string; type?: string };
  
  const member = db.prepare("SELECT * FROM project_members WHERE project_id = ? AND user_id = ? AND status = 'approved'").get(projectId, ctx.state.user!.id);
  if (!member) {
    ctx.status = 403;
    ctx.body = { error: '只有项目成员可以分享资源' };
    return;
  }
  
  const result = db.prepare('INSERT INTO resources (project_id, user_id, title, description, url, type) VALUES (?, ?, ?, ?, ?, ?)')
    .run(projectId, ctx.state.user!.id, title, description ?? null, url, type ?? 'other');
  
  checkBadges(ctx.state.user!.id);
  
  ctx.body = { id: result.lastInsertRowid, success: true };
});

router.put('/:id/progress', auth(), async (ctx: AuthContext) => {
  const projectId = Number(ctx.params.id);
  const { progress } = ctx.request.body as { progress: number };
  const userId = ctx.state.user!.id;
  
  const membership = db.prepare("SELECT * FROM project_members WHERE project_id = ? AND user_id = ? AND role = 'owner' AND status = 'approved'").get(projectId, userId);
  if (!membership) {
    ctx.status = 403;
    ctx.body = { error: '无权限操作' };
    return;
  }
  
  let status = 'in_progress';
  if (progress >= 100) status = 'completed';
  else if (progress <= 0) status = 'recruiting';
  
  db.prepare('UPDATE projects SET progress = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(progress, status, projectId);
  
  ctx.body = { success: true };
});

router.post('/:id/like', auth(), async (ctx: AuthContext) => {
  const id = Number(ctx.params.id);
  const userId = ctx.state.user!.id;
  
  const existing = db.prepare('SELECT id FROM likes WHERE user_id = ? AND target_type = ? AND target_id = ?').get(userId, 'project', id);
  
  if (existing) {
    db.prepare('DELETE FROM likes WHERE id = ?').run((existing as { id: number }).id);
    db.prepare('UPDATE projects SET likes = likes - 1 WHERE id = ?').run(id);
    ctx.body = { liked: false };
  } else {
    db.prepare('INSERT INTO likes (user_id, target_type, target_id) VALUES (?, ?, ?)').run(userId, 'project', id);
    db.prepare('UPDATE projects SET likes = likes + 1 WHERE id = ?').run(id);
    
    const project = db.prepare('SELECT user_id, title FROM projects WHERE id = ?').get(id) as { user_id: number; title: string };
    if (project.user_id !== userId) {
      addPoints(project.user_id, 'content_liked', POINT_RULES.CONTENT_LIKED, '项目获点赞', id, 'project');
      createNotification(project.user_id, 'like', `${ctx.state.user!.username} 点赞了你的项目「${project.title}」`, id, 'project');
    }
    
    ctx.body = { liked: true };
  }
});

router.post('/:id/favorite', auth(), async (ctx: AuthContext) => {
  const id = Number(ctx.params.id);
  const userId = ctx.state.user!.id;
  
  const existing = db.prepare('SELECT id FROM favorites WHERE user_id = ? AND target_type = ? AND target_id = ?').get(userId, 'project', id);
  
  if (existing) {
    db.prepare('DELETE FROM favorites WHERE id = ?').run((existing as { id: number }).id);
    db.prepare('UPDATE projects SET favorites = favorites - 1 WHERE id = ?').run(id);
    ctx.body = { favorited: false };
  } else {
    db.prepare('INSERT INTO favorites (user_id, target_type, target_id) VALUES (?, ?, ?)').run(userId, 'project', id);
    db.prepare('UPDATE projects SET favorites = favorites + 1 WHERE id = ?').run(id);
    
    const project = db.prepare('SELECT user_id, title FROM projects WHERE id = ?').get(id) as { user_id: number; title: string };
    if (project.user_id !== userId) {
      addPoints(project.user_id, 'content_favorited', POINT_RULES.CONTENT_FAVORITED, '项目获收藏', id, 'project');
    }
    
    ctx.body = { favorited: true };
  }
});

export default router;
