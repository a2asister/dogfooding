import Router from 'koa-router';
import bcrypt from 'bcryptjs';
import db from '../db.js';
import { generateToken, auth, type AuthContext } from '../middleware.js';
import { addPoints, checkBadges } from '../utils.js';
import { POINT_RULES } from '../types.js';

const router = new Router();

router.post('/register', async (ctx) => {
  const { username, email, password } = ctx.request.body as { username: string; email: string; password: string };
  
  if (!username || !email || !password) {
    ctx.status = 400;
    ctx.body = { error: '请填写完整信息' };
    return;
  }

  const existing = db.prepare('SELECT id FROM users WHERE username = ? OR email = ?').get(username, email);
  if (existing) {
    ctx.status = 400;
    ctx.body = { error: '用户名或邮箱已存在' };
    return;
  }

  const hashed = await bcrypt.hash(password, 10);
  const result = db.prepare('INSERT INTO users (username, email, password) VALUES (?, ?, ?)').run(username, email, hashed);
  
  const user = { id: result.lastInsertRowid as number, username, role: 'user' };
  const token = generateToken(user);
  
  ctx.body = { token, user: { id: user.id, username, email, points: 0, level: 1, avatar: null, bio: null, role: 'user' } };
});

router.post('/login', async (ctx) => {
  const { username, password } = ctx.request.body as { username: string; password: string };
  
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as { id: number; username: string; email: string; password: string; avatar?: string; bio?: string; points: number; level: number; role: string; status: string } | undefined;
  
  if (!user || user.status === 'banned') {
    ctx.status = 401;
    ctx.body = { error: '账号不存在或已被封禁' };
    return;
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    ctx.status = 401;
    ctx.body = { error: '密码错误' };
    return;
  }

  const token = generateToken({ id: user.id, username: user.username, role: user.role });
  
  ctx.body = {
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      avatar: user.avatar ?? null,
      bio: user.bio ?? null,
      points: user.points,
      level: user.level,
      role: user.role,
    },
  };
});

router.get('/profile', auth(), async (ctx: AuthContext) => {
  const user = db.prepare('SELECT id, username, email, avatar, bio, points, level, role, created_at FROM users WHERE id = ?').get(ctx.state.user!.id) as { id: number; username: string; email: string; avatar?: string; bio?: string; points: number; level: number; role: string; created_at: string };
  
  const today = new Date().toISOString().split('T')[0];
  const checkIn = db.prepare('SELECT id FROM daily_check_ins WHERE user_id = ? AND check_in_date = ?').get(ctx.state.user!.id, today);
  
  ctx.body = { ...user, hasCheckedIn: !!checkIn };
});

router.put('/profile', auth(), async (ctx: AuthContext) => {
  const { avatar, bio } = ctx.request.body as { avatar?: string; bio?: string };
  db.prepare('UPDATE users SET avatar = ?, bio = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(avatar ?? null, bio ?? null, ctx.state.user!.id);
  ctx.body = { success: true };
});

router.post('/checkin', auth(), async (ctx: AuthContext) => {
  const userId = ctx.state.user!.id;
  const today = new Date().toISOString().split('T')[0];
  
  const existing = db.prepare('SELECT id FROM daily_check_ins WHERE user_id = ? AND check_in_date = ?').get(userId, today);
  if (existing) {
    ctx.status = 400;
    ctx.body = { error: '今日已签到' };
    return;
  }

  db.prepare('INSERT INTO daily_check_ins (user_id, check_in_date) VALUES (?, ?)').run(userId, today);
  addPoints(userId, 'daily_checkin', POINT_RULES.DAILY_LOGIN, '每日登录签到');
  checkBadges(userId);
  
  ctx.body = { success: true, points: POINT_RULES.DAILY_LOGIN };
});

export default router;
