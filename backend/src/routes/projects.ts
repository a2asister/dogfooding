import Router from 'koa-router';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import { db } from '../db';
import { authMiddleware, AuthContext, requireRole } from '../middleware/auth';
import { Project } from '../types';

const router = new Router({ prefix: '/api/projects' });

router.get('/', authMiddleware, async (ctx: AuthContext) => {
  const { isPublic, category, studentId } = ctx.query as {
    isPublic?: string;
    category?: string;
    studentId?: string;
  };

  let query = `
    SELECT p.*, u.nickname as authorName, u.avatar as authorAvatar
    FROM projects p
    JOIN users u ON p.studentId = u.id
    WHERE 1=1
  `;
  const params: string[] = [];

  if (isPublic === 'true') {
    query += ' AND p.isPublic = 1';
  } else if (ctx.state.user.role === 'student' && !studentId) {
    query += ' AND p.studentId = ?';
    params.push(ctx.state.user.id);
  } else if (studentId) {
    query += ' AND p.studentId = ?';
    params.push(studentId);
  }

  if (category) {
    query += ' AND p.category = ?';
    params.push(category);
  }

  query += ' ORDER BY p.updatedAt DESC';
  const projects = db.prepare(query).all(...params);

  ctx.body = { projects };
});

router.get('/:id', authMiddleware, async (ctx: AuthContext) => {
  const project = db.prepare(`
    SELECT p.*, u.nickname as authorName, u.avatar as authorAvatar
    FROM projects p
    JOIN users u ON p.studentId = u.id
    WHERE p.id = ?
  `).get(ctx.params.id) as (Project & { authorName: string; authorAvatar: string }) | undefined;

  if (!project) {
    ctx.status = 404;
    ctx.body = { error: '作品不存在' };
    return;
  }

  if (!project.isPublic && project.studentId !== ctx.state.user.id && ctx.state.user.role !== 'admin') {
    ctx.status = 403;
    ctx.body = { error: '无权限查看此作品' };
    return;
  }

  db.prepare('UPDATE projects SET views = views + 1 WHERE id = ?').run(ctx.params.id);

  ctx.body = { project: { ...project, views: project.views + 1 } };
});

router.post('/', authMiddleware, requireRole('student'), async (ctx: AuthContext) => {
  const { title, description, code, blocksXml, isPublic, category } = ctx.request.body as {
    title: string;
    description?: string;
    code: string;
    blocksXml: string;
    isPublic?: boolean;
    category?: string;
  };

  if (!title || !code || !blocksXml) {
    ctx.status = 400;
    ctx.body = { error: '请填写完整信息' };
    return;
  }

  const projectId = uuidv4();
  const now = dayjs().toISOString();

  db.prepare(`
    INSERT INTO projects (id, title, description, studentId, code, blocksXml, isPublic, category, views, likes, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?, ?)
  `).run(projectId, title, description || null, ctx.state.user.id, code, blocksXml, 
         isPublic ? 1 : 0, category || null, now, now);

  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId) as Project;
  ctx.body = { project };
});

router.put('/:id', authMiddleware, requireRole('student', 'admin'), async (ctx: AuthContext) => {
  const projectId = ctx.params.id;
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId) as Project | undefined;

  if (!project) {
    ctx.status = 404;
    ctx.body = { error: '作品不存在' };
    return;
  }

  if (ctx.state.user.role !== 'admin' && project.studentId !== ctx.state.user.id) {
    ctx.status = 403;
    ctx.body = { error: '无权限修改此作品' };
    return;
  }

  const { title, description, code, blocksXml, isPublic, category } = ctx.request.body as {
    title?: string;
    description?: string;
    code?: string;
    blocksXml?: string;
    isPublic?: boolean;
    category?: string;
  };
  const now = dayjs().toISOString();

  db.prepare(`
    UPDATE projects
    SET title = COALESCE(?, title),
        description = COALESCE(?, description),
        code = COALESCE(?, code),
        blocksXml = COALESCE(?, blocksXml),
        isPublic = COALESCE(?, isPublic),
        category = COALESCE(?, category),
        updatedAt = ?
    WHERE id = ?
  `).run(title || null, description || null, code || null, blocksXml || null,
         isPublic !== undefined ? (isPublic ? 1 : 0) : null, category || null, now, projectId);

  const updatedProject = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId) as Project;
  ctx.body = { project: updatedProject };
});

router.delete('/:id', authMiddleware, requireRole('student', 'admin'), async (ctx: AuthContext) => {
  const projectId = ctx.params.id;
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId) as Project | undefined;

  if (!project) {
    ctx.status = 404;
    ctx.body = { error: '作品不存在' };
    return;
  }

  if (ctx.state.user.role !== 'admin' && project.studentId !== ctx.state.user.id) {
    ctx.status = 403;
    ctx.body = { error: '无权限删除此作品' };
    return;
  }

  db.prepare('DELETE FROM projects WHERE id = ?').run(projectId);
  ctx.body = { message: '删除成功' };
});

router.post('/:id/like', authMiddleware, requireRole('student'), async (ctx: AuthContext) => {
  const projectId = ctx.params.id;
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId) as Project | undefined;

  if (!project) {
    ctx.status = 404;
    ctx.body = { error: '作品不存在' };
    return;
  }

  db.prepare('UPDATE projects SET likes = likes + 1 WHERE id = ?').run(projectId);
  ctx.body = { message: '点赞成功' };
});

export default router;
