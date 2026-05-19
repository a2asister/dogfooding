import Router from 'koa-router';
import db from '../db';
import { error, success } from '../utils';
import { authMiddleware } from '../middleware/auth';
import { Role } from '../types';

const router = new Router({ prefix: '/api/apis' });

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
  const { projectId, page = 1, pageSize = 20, keyword, method, status } = ctx.query as any;
  const currentUser = ctx.state.user;

  if (!projectId) {
    ctx.status = 400;
    ctx.body = error('请指定项目ID');
    return;
  }

  if (!checkProjectAccess(Number(projectId), currentUser.id, currentUser.role, currentUser.groupId)) {
    ctx.status = 403;
    ctx.body = error('无权访问该项目');
    return;
  }

  let where = 'WHERE a.project_id = ?';
  const params: unknown[] = [projectId];

  if (keyword) {
    where += ' AND (a.name LIKE ? OR a.path LIKE ?)';
    params.push(`%${keyword}%`, `%${keyword}%`);
  }

  if (method) {
    where += ' AND a.method = ?';
    params.push(method);
  }

  if (status) {
    where += ' AND a.status = ?';
    params.push(status);
  }

  const total = (db.prepare(`SELECT COUNT(*) as count FROM apis a ${where}`).get(...params) as { count: number }).count;
  const offset = (page - 1) * pageSize;

  const apis = db.prepare(`
    SELECT a.*, u.nickname as creator_name
    FROM apis a
    LEFT JOIN users u ON a.created_by = u.id
    ${where}
    ORDER BY a.created_at DESC
    LIMIT ? OFFSET ?
  `).all(...params, pageSize, offset);

  ctx.body = success({
    list: apis,
    total,
    page: Number(page),
    pageSize: Number(pageSize)
  });
});

router.get('/:id', async (ctx) => {
  const apiId = Number(ctx.params.id);
  const currentUser = ctx.state.user;

  const api = db.prepare('SELECT * FROM apis WHERE id = ?').get(apiId) as any;
  if (!api) {
    ctx.status = 404;
    ctx.body = error('接口不存在');
    return;
  }

  if (!checkProjectAccess(api.project_id, currentUser.id, currentUser.role, currentUser.groupId)) {
    ctx.status = 403;
    ctx.body = error('无权访问该接口');
    return;
  }

  ctx.body = success(api);
});

router.post('/', async (ctx) => {
  const currentUser = ctx.state.user;
  const { projectId, name, description, method, path, requestHeaders, requestParams, requestBody, responseBody, mockEnabled, mockData, status } = ctx.request.body as any;

  if (!checkProjectAccess(projectId, currentUser.id, currentUser.role, currentUser.groupId)) {
    ctx.status = 403;
    ctx.body = error('无权操作该项目');
    return;
  }

  const existing = db.prepare('SELECT id FROM apis WHERE project_id = ? AND method = ? AND path = ?').get(projectId, method, path);
  if (existing) {
    ctx.status = 400;
    ctx.body = error('该路径和方法的接口已存在');
    return;
  }

  const info = db.prepare(`
    INSERT INTO apis (project_id, name, description, method, path, request_headers, request_params, request_body, response_body, mock_enabled, mock_data, status, created_by, updated_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    projectId,
    name,
    description || '',
    method,
    path,
    requestHeaders ? (typeof requestHeaders === 'string' ? requestHeaders : JSON.stringify(requestHeaders)) : null,
    requestParams ? (typeof requestParams === 'string' ? requestParams : JSON.stringify(requestParams)) : null,
    requestBody ? (typeof requestBody === 'string' ? requestBody : JSON.stringify(requestBody)) : null,
    responseBody ? (typeof responseBody === 'string' ? responseBody : JSON.stringify(responseBody)) : null,
    mockEnabled !== undefined ? (typeof mockEnabled === 'boolean' ? (mockEnabled ? 1 : 0) : Number(mockEnabled)) : 1,
    mockData ? (typeof mockData === 'string' ? mockData : JSON.stringify(mockData)) : null,
    status || 'draft',
    currentUser.id,
    currentUser.id
  );

  ctx.body = success({ id: info.lastInsertRowid }, '接口创建成功');
});

router.put('/:id', async (ctx) => {
  const apiId = Number(ctx.params.id);
  const currentUser = ctx.state.user;
  const { name, description, method, path, requestHeaders, requestParams, requestBody, responseBody, mockEnabled, mockData, status } = ctx.request.body as any;

  const api = db.prepare('SELECT * FROM apis WHERE id = ?').get(apiId) as any;
  if (!api) {
    ctx.status = 404;
    ctx.body = error('接口不存在');
    return;
  }

  if (!checkProjectAccess(api.project_id, currentUser.id, currentUser.role, currentUser.groupId)) {
    ctx.status = 403;
    ctx.body = error('无权编辑该接口');
    return;
  }

  const updateFields: string[] = [];
  const updateValues: unknown[] = [];

  if (name !== undefined) { updateFields.push('name = ?'); updateValues.push(name); }
  if (description !== undefined) { updateFields.push('description = ?'); updateValues.push(description); }
  if (method !== undefined || path !== undefined) {
    const newMethod = method || api.method;
    const newPath = path || api.path;
    const existing = db.prepare('SELECT id FROM apis WHERE project_id = ? AND method = ? AND path = ? AND id != ?').get(api.project_id, newMethod, newPath, apiId);
    if (existing) {
      ctx.status = 400;
      ctx.body = error('该路径和方法的接口已存在');
      return;
    }
    if (method !== undefined) { updateFields.push('method = ?'); updateValues.push(method); }
    if (path !== undefined) { updateFields.push('path = ?'); updateValues.push(path); }
  }
  if (requestHeaders !== undefined) { updateFields.push('request_headers = ?'); updateValues.push(requestHeaders ? (typeof requestHeaders === 'string' ? requestHeaders : JSON.stringify(requestHeaders)) : null); }
  if (requestParams !== undefined) { updateFields.push('request_params = ?'); updateValues.push(requestParams ? (typeof requestParams === 'string' ? requestParams : JSON.stringify(requestParams)) : null); }
  if (requestBody !== undefined) { updateFields.push('request_body = ?'); updateValues.push(requestBody ? (typeof requestBody === 'string' ? requestBody : JSON.stringify(requestBody)) : null); }
  if (responseBody !== undefined) { updateFields.push('response_body = ?'); updateValues.push(responseBody ? (typeof responseBody === 'string' ? responseBody : JSON.stringify(responseBody)) : null); }
  if (mockEnabled !== undefined) { updateFields.push('mock_enabled = ?'); updateValues.push(typeof mockEnabled === 'boolean' ? (mockEnabled ? 1 : 0) : Number(mockEnabled)); }
  if (mockData !== undefined) { updateFields.push('mock_data = ?'); updateValues.push(mockData ? (typeof mockData === 'string' ? mockData : JSON.stringify(mockData)) : null); }
  if (status !== undefined) { updateFields.push('status = ?'); updateValues.push(status); }

  if (updateFields.length > 0) {
    updateFields.push('updated_by = ?');
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(currentUser.id);
    updateValues.push(apiId);
    db.prepare(`UPDATE apis SET ${updateFields.join(', ')} WHERE id = ?`).run(...updateValues);
  }

  ctx.body = success(null, '接口更新成功');
});

router.delete('/:id', async (ctx) => {
  const apiId = Number(ctx.params.id);
  const currentUser = ctx.state.user;

  const api = db.prepare('SELECT * FROM apis WHERE id = ?').get(apiId) as any;
  if (!api) {
    ctx.status = 404;
    ctx.body = error('接口不存在');
    return;
  }

  if (!checkProjectAccess(api.project_id, currentUser.id, currentUser.role, currentUser.groupId)) {
    ctx.status = 403;
    ctx.body = error('无权删除该接口');
    return;
  }

  const isProjectAdmin = db.prepare(
    'SELECT 1 FROM project_members WHERE project_id = ? AND user_id = ? AND role = ?'
  ).get(api.project_id, currentUser.id, Role.PROJECT_ADMIN);

  if (currentUser.role !== Role.SUPER_ADMIN && currentUser.role !== Role.GROUP_ADMIN && !isProjectAdmin) {
    ctx.status = 403;
    ctx.body = error('只有项目管理员可以删除接口');
    return;
  }

  db.prepare('DELETE FROM apis WHERE id = ?').run(apiId);
  ctx.body = success(null, '接口删除成功');
});

router.post('/batch-delete', async (ctx) => {
  const { ids } = ctx.request.body as { ids: number[] };
  const currentUser = ctx.state.user;

  if (!ids || ids.length === 0) {
    ctx.status = 400;
    ctx.body = error('请选择要删除的接口');
    return;
  }

  const apis = db.prepare(`SELECT * FROM apis WHERE id IN (${ids.map(() => '?').join(',')})`).all(...ids) as any[];

  for (const api of apis) {
    if (!checkProjectAccess(api.project_id, currentUser.id, currentUser.role, currentUser.groupId)) {
      ctx.status = 403;
      ctx.body = error('无权操作部分接口');
      return;
    }
  }

  const placeholders = ids.map(() => '?').join(',');
  db.prepare(`DELETE FROM apis WHERE id IN (${placeholders})`).run(...ids);
  ctx.body = success(null, '批量删除成功');
});

export default router;
