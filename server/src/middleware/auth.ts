import { Context, Next } from 'koa';
import * as jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'monitor_platform_secret_key_2024';

export interface UserPayload {
  id: number;
  username: string;
  role: string;
}

export function authMiddleware(ctx: Context, next: Next) {
  const token = ctx.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    ctx.status = 401;
    ctx.body = { code: 401, message: '未授权访问', data: null };
    return;
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as UserPayload;
    ctx.state.user = decoded;
    return next();
  } catch {
    ctx.status = 401;
    ctx.body = { code: 401, message: 'Token 无效或已过期', data: null };
    return;
  }
}

export function adminMiddleware(ctx: Context, next: Next) {
  const user = ctx.state.user as UserPayload;
  if (!user || user.role !== 'admin') {
    ctx.status = 403;
    ctx.body = { code: 403, message: '需要管理员权限', data: null };
    return;
  }
  return next();
}
