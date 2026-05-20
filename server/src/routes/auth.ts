import Router from 'koa-router';
import bcrypt from 'bcryptjs';
import db from '../db';
import { success, error } from '../utils/response';
import { generateToken } from '../utils/auth';
import { logOperation } from '../utils/logger';

const router = new Router({ prefix: '/api/auth' });

router.post('/login', async (ctx) => {
  const { username, password } = ctx.request.body as { username: string; password: string };

  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as any;
  if (!user) {
    ctx.body = error('用户不存在');
    return;
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    ctx.body = error('密码错误');
    return;
  }

  if (user.status !== 1) {
    ctx.body = error('账号已被禁用');
    return;
  }

  const token = generateToken({
    userId: user.id,
    username: user.username,
    roleId: user.role_id,
  });

  logOperation({
    userId: user.id,
    username: user.username,
    operation: '用户登录',
    module: '认证',
    details: `用户 ${user.username} 登录系统`,
    ipAddress: ctx.ip,
  });

  ctx.body = success({
    token,
    user: {
      id: user.id,
      username: user.username,
      realName: user.real_name,
      email: user.email,
      roleId: user.role_id,
      departmentId: user.department_id,
    },
  }, '登录成功');
});

router.post('/logout', async (ctx) => {
  const userId = (ctx as any).user?.userId;
  const username = (ctx as any).user?.username;
  
  logOperation({
    userId,
    username,
    operation: '用户登出',
    module: '认证',
    details: `用户 ${username} 登出系统`,
    ipAddress: ctx.ip,
  });

  ctx.body = success(null, '登出成功');
});

router.get('/current', async (ctx) => {
  const userId = (ctx as any).user?.userId;
  if (!userId) {
    ctx.body = error('未登录');
    return;
  }

  const user = db.prepare(`
    SELECT u.*, r.name as role_name, r.code as role_code, r.permissions, d.name as department_name
    FROM users u
    LEFT JOIN roles r ON u.role_id = r.id
    LEFT JOIN departments d ON u.department_id = d.id
    WHERE u.id = ?
  `).get(userId) as any;

  if (!user) {
    ctx.body = error('用户不存在');
    return;
  }

  ctx.body = success({
    id: user.id,
    username: user.username,
    realName: user.real_name,
    email: user.email,
    phone: user.phone,
    avatar: user.avatar,
    roleId: user.role_id,
    roleName: user.role_name,
    roleCode: user.role_code,
    permissions: user.permissions ? JSON.parse(user.permissions) : [],
    departmentId: user.department_id,
    departmentName: user.department_name,
    position: user.position,
  });
});

export default router;
