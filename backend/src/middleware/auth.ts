import { Context, Next } from 'koa';
import jwt from 'jsonwebtoken';
import { db } from '../db';
import { User, UserRole } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key';

export interface AuthContext extends Context {
  state: {
    user: User;
  };
}

export const authMiddleware = async (ctx: AuthContext, next: Next) => {
  const authHeader = ctx.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    ctx.status = 401;
    ctx.body = { error: '未提供认证令牌' };
    return;
  }

  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(decoded.userId) as User | undefined;
    
    if (!user) {
      ctx.status = 401;
      ctx.body = { error: '用户不存在' };
      return;
    }

    ctx.state.user = user;
    await next();
  } catch (err) {
    ctx.status = 401;
    ctx.body = { error: '无效的认证令牌' };
  }
};

export const requireRole = (...roles: UserRole[]) => {
  return async (ctx: AuthContext, next: Next) => {
    if (!roles.includes(ctx.state.user.role)) {
      ctx.status = 403;
      ctx.body = { error: '权限不足' };
      return;
    }
    await next();
  };
};

export const generateToken = (userId: string) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};
