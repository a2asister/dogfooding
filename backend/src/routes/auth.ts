import Router from 'koa-router';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import { db } from '../db';
import { User, UserRole } from '../types';
import { authMiddleware, generateToken, AuthContext } from '../middleware/auth';

const router = new Router({ prefix: '/api/auth' });

router.post('/register', async (ctx) => {
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

  const insertUser = db.prepare(`
    INSERT INTO users (id, username, password, nickname, role, email, phone, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const tx = db.transaction(() => {
    insertUser.run(userId, username, hashedPassword, nickname, role, email || null, phone || null, now, now);

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

  try {
    tx();
    const token = generateToken(userId);
    ctx.body = {
      token,
      user: {
        id: userId,
        username,
        nickname,
        role,
        email,
        phone,
        createdAt: now,
      },
    };
  } catch (err) {
    ctx.status = 500;
    ctx.body = { error: '注册失败' };
  }
});

router.post('/login', async (ctx) => {
  const { username, password } = ctx.request.body as { username: string; password: string };

  if (!username || !password) {
    ctx.status = 400;
    ctx.body = { error: '请输入用户名和密码' };
    return;
  }

  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as User | undefined;
  if (!user) {
    ctx.status = 400;
    ctx.body = { error: '用户名或密码错误' };
    return;
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    ctx.status = 400;
    ctx.body = { error: '用户名或密码错误' };
    return;
  }

  const token = generateToken(user.id);
  ctx.body = {
    token,
    user: {
      id: user.id,
      username: user.username,
      nickname: user.nickname,
      role: user.role,
      avatar: user.avatar,
      email: user.email,
      phone: user.phone,
      createdAt: user.createdAt,
    },
  };
});

router.get('/profile', authMiddleware, async (ctx: AuthContext) => {
  const user = ctx.state.user;
  
  let profile: Record<string, unknown> = {};
  if (user.role === 'student') {
    profile = db.prepare('SELECT * FROM student_profiles WHERE userId = ?').get(user.id) || {};
  } else if (user.role === 'teacher') {
    profile = db.prepare('SELECT * FROM teacher_profiles WHERE userId = ?').get(user.id) || {};
  } else if (user.role === 'parent') {
    profile = db.prepare('SELECT * FROM parent_profiles WHERE userId = ?').get(user.id) || {};
  }

  ctx.body = {
    user: {
      id: user.id,
      username: user.username,
      nickname: user.nickname,
      role: user.role,
      avatar: user.avatar,
      email: user.email,
      phone: user.phone,
      createdAt: user.createdAt,
    },
    profile,
  };
});

router.put('/profile', authMiddleware, async (ctx: AuthContext) => {
  const { nickname, avatar, email, phone } = ctx.request.body as {
    nickname?: string;
    avatar?: string;
    email?: string;
    phone?: string;
  };

  const userId = ctx.state.user.id;
  const now = dayjs().toISOString();

  db.prepare(`
    UPDATE users 
    SET nickname = COALESCE(?, nickname),
        avatar = COALESCE(?, avatar),
        email = COALESCE(?, email),
        phone = COALESCE(?, phone),
        updatedAt = ?
    WHERE id = ?
  `).run(nickname || null, avatar || null, email || null, phone || null, now, userId);

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as User;
  ctx.body = {
    user: {
      id: user.id,
      username: user.username,
      nickname: user.nickname,
      role: user.role,
      avatar: user.avatar,
      email: user.email,
      phone: user.phone,
    },
  };
});

export default router;
