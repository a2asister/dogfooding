import Router from 'koa-router';
import { v4 as uuidv4 } from 'uuid';
import db from '../db';
import { authMiddleware } from '../middleware/auth';
import { Organization } from '../types';
import { successResponse, errorResponse } from '../utils/response';

const router = new Router({ prefix: '/api/organizations' });

router.use(authMiddleware);

router.get('/', async (ctx) => {
  const orgs = db.prepare('SELECT * FROM organizations ORDER BY sort, createdAt').all() as Organization[];
  ctx.body = successResponse(orgs);
});

router.get('/tree', async (ctx) => {
  const orgs = db.prepare('SELECT * FROM organizations ORDER BY sort, createdAt').all() as Organization[];
  
  const buildTree = (parentId: string | null): (Organization & { children?: Organization[] })[] => {
    return orgs
      .filter((org) => org.parentId === parentId)
      .map((org) => ({
        ...org,
        children: buildTree(org.id),
      }));
  };

  const tree = buildTree(null);
  ctx.body = successResponse(tree);
});

router.get('/:id', async (ctx) => {
  const { id } = ctx.params;
  const org = db.prepare('SELECT * FROM organizations WHERE id = ?').get(id) as Organization | undefined;

  if (!org) {
    ctx.body = errorResponse('组织不存在', 404);
    return;
  }

  ctx.body = successResponse(org);
});

router.get('/:id/users', async (ctx) => {
  const { id } = ctx.params;
  const users = db.prepare('SELECT id, username, realName, role, avatar FROM users WHERE departmentId = ? AND status = \'active\'').all(id);
  ctx.body = successResponse(users);
});

router.post('/', async (ctx) => {
  const { name, parentId = null, type = 'department', leaderId = null, description = '', sort = 0 } = ctx.request.body as Partial<Organization>;

  if (!name) {
    ctx.body = errorResponse('请填写组织名称', 400);
    return;
  }

  const now = new Date().toISOString();
  const id = uuidv4();

  db.prepare(`
    INSERT INTO organizations (id, name, parentId, type, leaderId, description, sort, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, name, parentId, type, leaderId, description, sort, now, now);

  const org = db.prepare('SELECT * FROM organizations WHERE id = ?').get(id) as Organization;
  ctx.body = successResponse(org);
});

router.put('/:id', async (ctx) => {
  const { id } = ctx.params;
  const { name, parentId, type, leaderId, description, sort } = ctx.request.body as Partial<Organization>;

  const org = db.prepare('SELECT id FROM organizations WHERE id = ?').get(id) as Organization | undefined;
  if (!org) {
    ctx.body = errorResponse('组织不存在', 404);
    return;
  }

  const now = new Date().toISOString();
  db.prepare(`
    UPDATE organizations SET name = COALESCE(?, name), parentId = ?, type = COALESCE(?, type), leaderId = ?, description = COALESCE(?, description), sort = COALESCE(?, sort), updatedAt = ?
    WHERE id = ?
  `).run(name, parentId ?? null, type, leaderId ?? null, description, sort, now, id);

  const updatedOrg = db.prepare('SELECT * FROM organizations WHERE id = ?').get(id) as Organization;
  ctx.body = successResponse(updatedOrg);
});

router.delete('/:id', async (ctx) => {
  const { id } = ctx.params;

  const org = db.prepare('SELECT id FROM organizations WHERE id = ?').get(id) as Organization | undefined;
  if (!org) {
    ctx.body = errorResponse('组织不存在', 404);
    return;
  }

  const childCount = db.prepare('SELECT COUNT(*) as count FROM organizations WHERE parentId = ?').get(id) as { count: number };
  if (childCount.count > 0) {
    ctx.body = errorResponse('请先删除子组织', 400);
    return;
  }

  const userCount = db.prepare('SELECT COUNT(*) as count FROM users WHERE departmentId = ?').get(id) as { count: number };
  if (userCount.count > 0) {
    ctx.body = errorResponse('请先移出组织内的用户', 400);
    return;
  }

  db.prepare('DELETE FROM organizations WHERE id = ?').run(id);
  ctx.body = successResponse(null, '删除成功');
});

export default router;
