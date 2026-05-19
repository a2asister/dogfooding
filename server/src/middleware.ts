import type { Context, Next } from 'koa';
import jwt from 'jsonwebtoken';
import db from './db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';

export interface AuthContext extends Context {
  state: {
    user?: {
      id: number;
      username: string;
      role: string;
    };
  };
}

export function auth(): (ctx: AuthContext, next: Next) => Promise<void> {
  return async (ctx: AuthContext, next: Next) => {
    const authHeader = ctx.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      ctx.status = 401;
      ctx.body = { error: '未提供认证令牌' };
      return;
    }

    const token = authHeader.slice(7);
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: number; username: string; role: string };
      const user = db.prepare('SELECT id, username, role, status FROM users WHERE id = ?').get(decoded.id) as { id: number; username: string; role: string; status: string } | undefined;
      
      if (!user || user.status === 'banned') {
        ctx.status = 401;
        ctx.body = { error: '账号不存在或已被封禁' };
        return;
      }

      ctx.state.user = { id: user.id, username: user.username, role: user.role };
      await next();
    } catch {
      ctx.status = 401;
      ctx.body = { error: '无效的认证令牌' };
    }
  };
}

export function admin(): (ctx: AuthContext, next: Next) => Promise<void> {
  return async (ctx: AuthContext, next: Next) => {
    if (!ctx.state.user || ctx.state.user.role !== 'admin') {
      ctx.status = 403;
      ctx.body = { error: '需要管理员权限' };
      return;
    }
    await next();
  };
}

export function generateToken(user: { id: number; username: string; role: string }): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
}
