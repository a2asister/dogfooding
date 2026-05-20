import Router from 'koa-router';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import { db } from '../db';
import { authMiddleware, AuthContext, requireRole } from '../middleware/auth';
import { User, UserRole } from '../types';

const router = new Router({ prefix: '/api/admin' });

router.get('/users', authMiddleware, requireRole('admin'), async (ctx: AuthContext) => {
  const { role, page = 1, pageSize = 20 } = ctx.query as { role?: string; page?: string; pageSize?: string };
  
  const offset = (parseInt(page) - 1) * parseInt(pageSize);
  let query = 'SELECT id, username, nickname, role, avatar, email, phone, createdAt FROM users WHERE 1=1';
  const params: string[] = [];

  if (role) {
    query += ' AND role = ?';
    params.push(role);
  }

  query += ' ORDER BY createdAt DESC LIMIT ? OFFSET ?';
  params.push(pageSize, offset.toString());

  const users = db.prepare(query).all(...params);
  const total = db.prepare('SELECT COUNT(*) as count FROM users' + (role ? ' WHERE role = ?' : ''))
    .get(...(role ? [role] : [])) as { count: number };

  ctx.body = { users, total: total.count, page: parseInt(page), pageSize: parseInt(pageSize) };
});

router.post('/users', authMiddleware, requireRole('admin'), async (ctx: AuthContext) => {
  const { username, password, nickname, role, email, phone } = ctx.request.body as {
    username: string;
    password: string;
    nickname: string;
    role: UserRole;
    email?: string;
    phone?: string;
  };

  if (!username || !password || !nickname || !role) {
    ctx.status = 400;
    ctx.body = { error: '请填写完整信息' };
    return;
  }

  const existingUser = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as User | undefined;
  if (existingUser) {
    ctx.status = 400;
    ctx.body = { error: '用户名已存在' };
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const userId = uuidv4();
  const now = dayjs().toISOString();

  const tx = db.transaction(() => {
    db.prepare(`
      INSERT INTO users (id, username, password, nickname, role, email, phone, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(userId, username, hashedPassword, nickname, role, email || null, phone || null, now, now);

    if (role === 'student') {
      db.prepare('INSERT INTO student_profiles (id, userId, points, level) VALUES (?, ?, 0, 1)')
        .run(uuidv4(), userId);
    } else if (role === 'teacher') {
      db.prepare('INSERT INTO teacher_profiles (id, userId) VALUES (?, ?)')
        .run(uuidv4(), userId);
    } else if (role === 'parent') {
      db.prepare('INSERT INTO parent_profiles (id, userId, childrenIds) VALUES (?, ?, ?)')
        .run(uuidv4(), userId, '[]');
    }
  });

  tx();
  ctx.body = { message: '创建成功', userId };
});

router.put('/users/:id', authMiddleware, requireRole('admin'), async (ctx: AuthContext) => {
  const userId = ctx.params.id;
  const { nickname, role, email, phone, password } = ctx.request.body as {
    nickname?: string;
    role?: UserRole;
    email?: string;
    phone?: string;
    password?: string;
  };

  const now = dayjs().toISOString();
  let hashedPassword: string | undefined;
  if (password) {
    hashedPassword = await bcrypt.hash(password, 10);
  }

  db.prepare(`
    UPDATE users
    SET nickname = COALESCE(?, nickname),
        role = COALESCE(?, role),
        email = COALESCE(?, email),
        phone = COALESCE(?, phone),
        password = COALESCE(?, password),
        updatedAt = ?
    WHERE id = ?
  `).run(nickname || null, role || null, email || null, phone || null, hashedPassword || null, now, userId);

  ctx.body = { message: '更新成功' };
});

router.delete('/users/:id', authMiddleware, requireRole('admin'), async (ctx: AuthContext) => {
  const userId = ctx.params.id;
  if (userId === ctx.state.user.id) {
    ctx.status = 400;
    ctx.body = { error: '不能删除自己' };
    return;
  }
  db.prepare('DELETE FROM users WHERE id = ?').run(userId);
  ctx.body = { message: '删除成功' };
});

router.get('/badges', authMiddleware, requireRole('admin'), async (_ctx: AuthContext) => {
  const badges = db.prepare('SELECT * FROM badges ORDER BY createdAt DESC').all();
  ctx.body = { badges };
});

router.post('/badges', authMiddleware, requireRole('admin'), async (ctx: AuthContext) => {
  const { name, description, icon, condition } = ctx.request.body as {
    name: string;
    description: string;
    icon: string;
    condition: string;
  };

  if (!name || !description || !icon || !condition) {
    ctx.status = 400;
    ctx.body = { error: '请填写完整信息' };
    return;
  }

  const badgeId = uuidv4();
  const now = dayjs().toISOString();

  db.prepare(`
    INSERT INTO badges (id, name, description, icon, condition, createdAt)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(badgeId, name, description, icon, condition, now);

  ctx.body = { message: '创建成功', badgeId };
});

router.put('/badges/:id', authMiddleware, requireRole('admin'), async (ctx: AuthContext) => {
  const badgeId = ctx.params.id;
  const { name, description, icon, condition } = ctx.request.body as {
    name?: string;
    description?: string;
    icon?: string;
    condition?: string;
  };

  db.prepare(`
    UPDATE badges
    SET name = COALESCE(?, name),
        description = COALESCE(?, description),
        icon = COALESCE(?, icon),
        condition = COALESCE(?, condition)
    WHERE id = ?
  `).run(name || null, description || null, icon || null, condition || null, badgeId);

  ctx.body = { message: '更新成功' };
});

router.delete('/badges/:id', authMiddleware, requireRole('admin'), async (ctx: AuthContext) => {
  db.prepare('DELETE FROM badges WHERE id = ?').run(ctx.params.id);
  ctx.body = { message: '删除成功' };
});

router.get('/system-config', authMiddleware, requireRole('admin'), async (_ctx: AuthContext) => {
  const config = {
    siteName: '少儿编程平台',
    allowRegistration: true,
    maxUploadSize: '10MB',
    defaultStudentLevel: 1,
    challengePoints: {
      easy: 10,
      medium: 20,
      hard: 50,
    },
  };
  ctx.body = { config };
});

router.post('/init-data', authMiddleware, requireRole('admin'), async (_ctx: AuthContext) => {
  const now = dayjs().toISOString();
  
  const initBadges = db.transaction(() => {
    const badges = [
      { name: '编程小白', description: '完成第一个编程作品', icon: '🌟', condition: 'create_first_project' },
      { name: '学习达人', description: '完成5门课程', icon: '📚', condition: 'complete_5_courses' },
      { name: '闯关高手', description: '完成30道闯关题', icon: '🏆', condition: 'complete_30_challenges' },
      { name: '创意之星', description: '发布10个公开作品', icon: '✨', condition: 'publish_10_projects' },
      { name: '满分学霸', description: '作业平均分数达到90分以上', icon: '🎯', condition: 'homework_avg_90' },
      { name: '坚持不懈', description: '连续学习7天', icon: '💪', condition: 'study_7_days_streak' },
    ];

    for (const badge of badges) {
      const existing = db.prepare('SELECT * FROM badges WHERE name = ?').get(badge.name);
      if (!existing) {
        db.prepare('INSERT INTO badges (id, name, description, icon, condition, createdAt) VALUES (?, ?, ?, ?, ?, ?)')
          .run(uuidv4(), badge.name, badge.description, badge.icon, badge.condition, now);
      }
    }
  });

  initBadges();
  ctx.body = { message: '初始化数据完成' };
});

export default router;
