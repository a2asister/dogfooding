import Router from 'koa-router';
import db from '../db';
import { error, success } from '../utils';
import { authMiddleware, roleMiddleware } from '../middleware/auth';
import { Role, ProjectStatus } from '../types';

const router = new Router({ prefix: '/api/projects' });

router.use(authMiddleware);

function checkProjectAccess(projectId: number, userId: number, userRole: string, userGroupId?: number): boolean {
  if (userRole === Role.SUPER_ADMIN) return true;

  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId) as any;
  if (!project) return false;

  if (userRole === Role.GROUP_ADMIN && userGroupId === project.group_id) return true;

  const member = db.prepare('SELECT * FROM project_members WHERE project_id = ? AND user_id = ?').get(projectId, userId);
  return !!member;
}

router.get('/', async (ctx) => {
  const currentUser = ctx.state.user;
  const { groupId, page = 1, pageSize = 20, keyword } = ctx.query as any;

  let where = 'WHERE 1=1';
  const params: unknown[] = [];

  if (currentUser.role === Role.SUPER_ADMIN) {
  } else if (currentUser.role === Role.GROUP_ADMIN) {
    where += ' AND p.group_id = ?';
    params.push(currentUser.groupId);
  } else {
    where += ' AND (p.leader_id = ? OR pm.user_id IS NOT NULL)';
    params.push(currentUser.id);
  }

  if (groupId) {
    where += ' AND p.group_id = ?';
    params.push(groupId);
  }

  if (keyword) {
    where += ' AND p.name LIKE ?';
    params.push(`%${keyword}%`);
  }

  const total = (db.prepare(`
    SELECT COUNT(DISTINCT p.id) as count 
    FROM projects p
    LEFT JOIN project_members pm ON p.id = pm.project_id AND pm.user_id = ?
    ${where}
  `).get(currentUser.id, ...params) as { count: number }).count;

  const offset = (page - 1) * pageSize;

  const projects = db.prepare(`
    SELECT DISTINCT p.*, g.name as group_name, u.nickname as leader_name
    FROM projects p
    LEFT JOIN groups g ON p.group_id = g.id
    LEFT JOIN users u ON p.leader_id = u.id
    LEFT JOIN project_members pm ON p.id = pm.project_id AND pm.user_id = ?
    ${where}
    ORDER BY p.created_at DESC
    LIMIT ? OFFSET ?
  `).all(currentUser.id, ...params, pageSize, offset);

  ctx.body = success({
    list: projects,
    total,
    page: Number(page),
    pageSize: Number(pageSize)
  });
});

router.get('/:id', async (ctx) => {
  const projectId = Number(ctx.params.id);
  const currentUser = ctx.state.user;

  if (!checkProjectAccess(projectId, currentUser.id, currentUser.role, currentUser.groupId)) {
    ctx.status = 403;
    ctx.body = error('无权访问该项目');
    return;
  }

  const project = db.prepare(`
    SELECT p.*, g.name as group_name, u.nickname as leader_name
    FROM projects p
    LEFT JOIN groups g ON p.group_id = g.id
    LEFT JOIN users u ON p.leader_id = u.id
    WHERE p.id = ?
  `).get(projectId);

  ctx.body = success(project);
});

router.post('/', roleMiddleware(Role.SUPER_ADMIN, Role.GROUP_ADMIN), async (ctx) => {
  const { name, description, leaderId, groupId, baseUrl, status, globalHeaders, globalParams, timeout, responseFormat } = ctx.request.body as any;
  const currentUser = ctx.state.user;

  if (currentUser.role === Role.GROUP_ADMIN && groupId !== currentUser.groupId) {
    ctx.status = 403;
    ctx.body = error('只能在自己管理的分组下创建项目');
    return;
  }

  const info = db.prepare(`
    INSERT INTO projects (name, description, leader_id, group_id, base_url, status, global_headers, global_params, timeout, response_format)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    name,
    description || '',
    leaderId || currentUser.id,
    groupId,
    baseUrl || '',
    status || ProjectStatus.ACTIVE,
    globalHeaders ? (typeof globalHeaders === 'string' ? globalHeaders : JSON.stringify(globalHeaders)) : null,
    globalParams ? (typeof globalParams === 'string' ? globalParams : JSON.stringify(globalParams)) : null,
    timeout || 30000,
    responseFormat || 'json'
  );

  db.prepare(`
    INSERT INTO project_members (project_id, user_id, role)
    VALUES (?, ?, ?)
  `).run(info.lastInsertRowid, leaderId || currentUser.id, Role.PROJECT_ADMIN);

  ctx.body = success({ id: info.lastInsertRowid }, '项目创建成功');
});

router.put('/:id', async (ctx) => {
  const projectId = Number(ctx.params.id);
  const currentUser = ctx.state.user;
  const { name, description, leaderId, groupId, baseUrl, status, globalHeaders, globalParams, timeout, responseFormat } = ctx.request.body as any;

  if (!checkProjectAccess(projectId, currentUser.id, currentUser.role, currentUser.groupId)) {
    ctx.status = 403;
    ctx.body = error('无权修改该项目');
    return;
  }

  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId) as any;
  if (!project) {
    ctx.status = 404;
    ctx.body = error('项目不存在');
    return;
  }

  const isProjectAdmin = db.prepare(
    'SELECT 1 FROM project_members WHERE project_id = ? AND user_id = ? AND role = ?'
  ).get(projectId, currentUser.id, Role.PROJECT_ADMIN);

  if (currentUser.role !== Role.SUPER_ADMIN && currentUser.role !== Role.GROUP_ADMIN && !isProjectAdmin) {
    ctx.status = 403;
    ctx.body = error('只有项目管理员可以编辑项目');
    return;
  }

  const updateFields: string[] = [];
  const updateValues: unknown[] = [];

  if (name !== undefined) { updateFields.push('name = ?'); updateValues.push(name); }
  if (description !== undefined) { updateFields.push('description = ?'); updateValues.push(description); }
  if (leaderId !== undefined) { updateFields.push('leader_id = ?'); updateValues.push(leaderId); }
  if (groupId !== undefined && (currentUser.role === Role.SUPER_ADMIN || currentUser.role === Role.GROUP_ADMIN)) {
    updateFields.push('group_id = ?');
    updateValues.push(groupId);
  }
  if (baseUrl !== undefined) { updateFields.push('base_url = ?'); updateValues.push(baseUrl); }
  if (status !== undefined) { updateFields.push('status = ?'); updateValues.push(status); }
  if (globalHeaders !== undefined) { updateFields.push('global_headers = ?'); updateValues.push(globalHeaders ? (typeof globalHeaders === 'string' ? globalHeaders : JSON.stringify(globalHeaders)) : null); }
  if (globalParams !== undefined) { updateFields.push('global_params = ?'); updateValues.push(globalParams ? (typeof globalParams === 'string' ? globalParams : JSON.stringify(globalParams)) : null); }
  if (timeout !== undefined) { updateFields.push('timeout = ?'); updateValues.push(timeout); }
  if (responseFormat !== undefined) { updateFields.push('response_format = ?'); updateValues.push(responseFormat); }

  if (updateFields.length > 0) {
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(projectId);
    db.prepare(`UPDATE projects SET ${updateFields.join(', ')} WHERE id = ?`).run(...updateValues);
  }

  ctx.body = success(null, '项目更新成功');
});

router.delete('/:id', roleMiddleware(Role.SUPER_ADMIN, Role.GROUP_ADMIN), async (ctx) => {
  const projectId = Number(ctx.params.id);
  const currentUser = ctx.state.user;

  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId) as any;
  if (!project) {
    ctx.status = 404;
    ctx.body = error('项目不存在');
    return;
  }

  if (currentUser.role === Role.GROUP_ADMIN && project.group_id !== currentUser.groupId) {
    ctx.status = 403;
    ctx.body = error('无权删除其他分组的项目');
    return;
  }

  db.prepare('DELETE FROM projects WHERE id = ?').run(projectId);
  ctx.body = success(null, '项目删除成功');
});

router.get('/:id/members', async (ctx) => {
  const projectId = Number(ctx.params.id);
  const currentUser = ctx.state.user;

  if (!checkProjectAccess(projectId, currentUser.id, currentUser.role, currentUser.groupId)) {
    ctx.status = 403;
    ctx.body = error('无权访问该项目');
    return;
  }

  const members = db.prepare(`
    SELECT pm.id, pm.project_id, pm.user_id, pm.role, pm.created_at,
           u.username, u.nickname, u.email, u.avatar, u.status
    FROM project_members pm
    JOIN users u ON pm.user_id = u.id
    WHERE pm.project_id = ?
    ORDER BY pm.created_at DESC
  `).all(projectId);

  ctx.body = success(members);
});

router.post('/:id/members', async (ctx) => {
  const projectId = Number(ctx.params.id);
  const currentUser = ctx.state.user;
  const { userIds, role } = ctx.request.body as { userIds: number[]; role: Role };

  if (!checkProjectAccess(projectId, currentUser.id, currentUser.role, currentUser.groupId)) {
    ctx.status = 403;
    ctx.body = error('无权操作该项目');
    return;
  }

  const isProjectAdmin = db.prepare(
    'SELECT 1 FROM project_members WHERE project_id = ? AND user_id = ? AND role = ?'
  ).get(projectId, currentUser.id, Role.PROJECT_ADMIN);

  if (currentUser.role !== Role.SUPER_ADMIN && currentUser.role !== Role.GROUP_ADMIN && !isProjectAdmin) {
    ctx.status = 403;
    ctx.body = error('只有项目管理员可以管理成员');
    return;
  }

  const stmt = db.prepare(`
    INSERT OR IGNORE INTO project_members (project_id, user_id, role)
    VALUES (?, ?, ?)
  `);

  const insertMany = db.transaction((ids: number[]) => {
    for (const id of ids) {
      stmt.run(projectId, id, role || Role.MEMBER);
    }
  });

  insertMany(userIds);
  ctx.body = success(null, '成员添加成功');
});

router.delete('/:id/members/:userId', async (ctx) => {
  const projectId = Number(ctx.params.id);
  const userId = Number(ctx.params.userId);
  const currentUser = ctx.state.user;

  if (!checkProjectAccess(projectId, currentUser.id, currentUser.role, currentUser.groupId)) {
    ctx.status = 403;
    ctx.body = error('无权操作该项目');
    return;
  }

  const isProjectAdmin = db.prepare(
    'SELECT 1 FROM project_members WHERE project_id = ? AND user_id = ? AND role = ?'
  ).get(projectId, currentUser.id, Role.PROJECT_ADMIN);

  if (currentUser.role !== Role.SUPER_ADMIN && currentUser.role !== Role.GROUP_ADMIN && !isProjectAdmin) {
    ctx.status = 403;
    ctx.body = error('只有项目管理员可以移除成员');
    return;
  }

  db.prepare('DELETE FROM project_members WHERE project_id = ? AND user_id = ?').run(projectId, userId);
  ctx.body = success(null, '成员移除成功');
});

export default router;
