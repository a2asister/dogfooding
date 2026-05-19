import Router from 'koa-router';
import db from '../db';
import { success } from '../utils';
import { authMiddleware, roleMiddleware } from '../middleware/auth';
import { Role } from '../types';

const router = new Router({ prefix: '/api/logs' });

router.use(authMiddleware);

router.get('/login', roleMiddleware(Role.SUPER_ADMIN), async (ctx) => {
  const { page = 1, pageSize = 20, username, status, startDate, endDate } = ctx.query as any;

  let where = 'WHERE 1=1';
  const params: unknown[] = [];

  if (username) {
    where += ' AND username LIKE ?';
    params.push(`%${username}%`);
  }

  if (status) {
    where += ' AND status = ?';
    params.push(status);
  }

  if (startDate) {
    where += ' AND login_time >= ?';
    params.push(startDate);
  }

  if (endDate) {
    where += ' AND login_time <= ?';
    params.push(endDate + ' 23:59:59');
  }

  const total = (db.prepare(`SELECT COUNT(*) as count FROM login_logs ${where}`).get(...params) as { count: number }).count;
  const offset = (page - 1) * pageSize;

  const logs = db.prepare(`
    SELECT * FROM login_logs
    ${where}
    ORDER BY login_time DESC
    LIMIT ? OFFSET ?
  `).all(...params, pageSize, offset);

  ctx.body = success({
    list: logs,
    total,
    page: Number(page),
    pageSize: Number(pageSize)
  });
});

router.get('/login/mine', async (ctx) => {
  const userId = ctx.state.user.id;
  const { page = 1, pageSize = 20 } = ctx.query as any;

  const total = (db.prepare('SELECT COUNT(*) as count FROM login_logs WHERE user_id = ?').get(userId) as { count: number }).count;
  const offset = (page - 1) * pageSize;

  const logs = db.prepare(`
    SELECT * FROM login_logs
    WHERE user_id = ?
    ORDER BY login_time DESC
    LIMIT ? OFFSET ?
  `).all(userId, pageSize, offset);

  ctx.body = success({
    list: logs,
    total,
    page: Number(page),
    pageSize: Number(pageSize)
  });
});

router.get('/statistics', roleMiddleware(Role.SUPER_ADMIN), async (ctx) => {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  const totalUsers = (db.prepare("SELECT COUNT(*) as count FROM users WHERE status = 'active'").get() as { count: number }).count;
  const totalGroups = (db.prepare("SELECT COUNT(*) as count FROM groups WHERE status = 'active'").get() as { count: number }).count;
  const totalProjects = (db.prepare("SELECT COUNT(*) as count FROM projects WHERE status = 'active'").get() as { count: number }).count;
  const totalApis = (db.prepare('SELECT COUNT(*) as count FROM apis').get() as { count: number }).count;

  const todayLogins = (db.prepare('SELECT COUNT(*) as count FROM login_logs WHERE DATE(login_time) = ? AND status = ?').get(today, 'success') as { count: number }).count;
  const yesterdayLogins = (db.prepare('SELECT COUNT(*) as count FROM login_logs WHERE DATE(login_time) = ? AND status = ?').get(yesterday, 'success') as { count: number }).count;

  const loginTrend = db.prepare(`
    SELECT DATE(login_time) as date, COUNT(*) as count
    FROM login_logs
    WHERE login_time >= DATE('now', '-7 days') AND status = 'success'
    GROUP BY DATE(login_time)
    ORDER BY date DESC
  `).all();

  ctx.body = success({
    totalUsers,
    totalGroups,
    totalProjects,
    totalApis,
    todayLogins,
    yesterdayLogins,
    loginTrend
  });
});

export default router;
