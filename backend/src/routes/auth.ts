import Router from 'koa-router';
import db from '../db';
import { generateToken, comparePassword, error, success, parseDevice } from '../utils';
import { Role } from '../types';
import { authMiddleware } from '../middleware/auth';

const router = new Router({ prefix: '/api/auth' });

router.post('/login', async (ctx) => {
  const { username, password } = ctx.request.body as { username: string; password: string };

  const user = db.prepare('SELECT * FROM users WHERE username = ? OR email = ?').get(username, username) as any;

  const ip = ctx.ip || ctx.req.socket.remoteAddress || '';
  const userAgent = ctx.headers['user-agent'] || '';
  const device = parseDevice(userAgent);

  if (!user) {
    db.prepare(`
      INSERT INTO login_logs (username, ip, user_agent, device, status)
      VALUES (?, ?, ?, ?, 'failed')
    `).run(username, ip, userAgent, device);
    ctx.status = 401;
    ctx.body = error('用户名或密码错误');
    return;
  }

  if (user.status === 'disabled') {
    db.prepare(`
      INSERT INTO login_logs (username, ip, user_agent, device, status)
      VALUES (?, ?, ?, ?, 'failed')
    `).run(username, ip, userAgent, device);
    ctx.status = 401;
    ctx.body = error('账号已被禁用，请联系管理员');
    return;
  }

  if (!comparePassword(password, user.password)) {
    db.prepare(`
      INSERT INTO login_logs (user_id, username, ip, user_agent, device, status)
      VALUES (?, ?, ?, ?, ?, 'failed')
    `).run(user.id, username, ip, userAgent, device);
    ctx.status = 401;
    ctx.body = error('用户名或密码错误');
    return;
  }

  db.prepare(`
    INSERT INTO login_logs (user_id, username, ip, user_agent, device, status)
    VALUES (?, ?, ?, ?, ?, 'success')
  `).run(user.id, username, ip, userAgent, device);

  const token = generateToken({
    id: user.id,
    username: user.username,
    role: user.role
  });

  ctx.body = success({
    token,
    user: {
      id: user.id,
      username: user.username,
      nickname: user.nickname,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone,
      groupId: user.group_id
    }
  });
});

router.post('/logout', authMiddleware, async (ctx) => {
  ctx.body = success(null, '退出登录成功');
});

router.get('/profile', authMiddleware, async (ctx) => {
  const userId = ctx.state.user.id;
  const user = db.prepare(`
    SELECT id, username, nickname, email, avatar, phone, role, group_id, status, created_at, updated_at
    FROM users WHERE id = ?
  `).get(userId);
  ctx.body = success(user);
});

router.put('/profile', authMiddleware, async (ctx) => {
  const userId = ctx.state.user.id;
  const { nickname, email, phone, avatar } = ctx.request.body as any;

  const updateFields: string[] = [];
  const updateValues: unknown[] = [];

  if (nickname !== undefined) {
    updateFields.push('nickname = ?');
    updateValues.push(nickname);
  }
  if (email !== undefined) {
    updateFields.push('email = ?');
    updateValues.push(email);
  }
  if (phone !== undefined) {
    updateFields.push('phone = ?');
    updateValues.push(phone);
  }
  if (avatar !== undefined) {
    updateFields.push('avatar = ?');
    updateValues.push(avatar);
  }

  if (updateFields.length > 0) {
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(userId);
    db.prepare(`UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`).run(...updateValues);
  }

  ctx.body = success(null, '个人信息更新成功');
});

router.put('/password', authMiddleware, async (ctx) => {
  const userId = ctx.state.user.id;
  const { oldPassword, newPassword } = ctx.request.body as { oldPassword: string; newPassword: string };

  const user = db.prepare('SELECT password FROM users WHERE id = ?').get(userId) as any;
  if (!comparePassword(oldPassword, user.password)) {
    ctx.status = 400;
    ctx.body = error('原密码错误');
    return;
  }

  const { hashPassword } = await import('../utils');
  db.prepare('UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
    .run(hashPassword(newPassword), userId);

  ctx.body = success(null, '密码修改成功');
});

export default router;
