import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import db from '../db';
import { validatePasswordStrength, hashPassword, comparePassword } from '../utils/password';
import { authenticateToken } from '../middleware/auth';

const router = Router();

const registerSchema = z.object({
  username: z.string().min(3, '用户名至少3个字符').max(50),
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string(),
});

const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

router.post('/register', async (req: Request, res: Response) => {
  try {
    const validated = registerSchema.parse(req.body);

    const passwordCheck = validatePasswordStrength(validated.password);
    if (!passwordCheck.valid) {
      return res.status(400).json({ error: passwordCheck.message });
    }

    const existingUser = db.prepare('SELECT id FROM users WHERE username = ? OR email = ?').get(
      validated.username,
      validated.email
    );

    if (existingUser) {
      return res.status(400).json({ error: '用户名或邮箱已存在' });
    }

    const hashedPassword = await hashPassword(validated.password);

    const result = db
      .prepare('INSERT INTO users (username, email, password) VALUES (?, ?, ?)')
      .run(validated.username, validated.email, hashedPassword);

    const secret = process.env.JWT_SECRET || 'fallback-secret';
    const token = jwt.sign(
      { userId: result.lastInsertRowid, username: validated.username },
      secret,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: '注册成功',
      token,
      user: {
        id: result.lastInsertRowid,
        username: validated.username,
        email: validated.email,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Registration error:', error);
    res.status(500).json({ error: '注册失败，请稍后重试' });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const validated = loginSchema.parse(req.body);

    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(validated.username) as any;

    if (!user) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    const passwordMatch = await comparePassword(validated.password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    const secret = process.env.JWT_SECRET || 'fallback-secret';
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      secret,
      { expiresIn: '7d' }
    );

    res.json({
      message: '登录成功',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Login error:', error);
    res.status(500).json({ error: '登录失败，请稍后重试' });
  }
});

router.get('/me', authenticateToken, (req: Request, res: Response) => {
  try {
    const user = db
      .prepare('SELECT id, username, email, created_at FROM users WHERE id = ?')
      .get(req.user!.userId) as any;

    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: '获取用户信息失败' });
  }
});

export default router;
