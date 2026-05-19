import jwt from 'jsonwebtoken';
import { Context, Next } from 'koa';
import { UserRole, JwtPayload } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'auction-system-jwt-secret';

export function authMiddleware(requiredRoles?: UserRole[]): (ctx: Context, next: Next) => Promise<void> {
  return async (ctx: Context, next: Next): Promise<void> => {
    if (ctx.method === 'OPTIONS') {
      await next();
      return;
    }

    const authHeader = ctx.headers.authorization;
    
    if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
      ctx.status = 401;
      ctx.body = { code: 401, message: '未提供认证令牌' };
      return;
    }

    const token = authHeader.slice(7);
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
      ctx.state.user = decoded;

      if (requiredRoles && !requiredRoles.includes(decoded.role)) {
        ctx.status = 403;
        ctx.body = { code: 403, message: '权限不足' };
        return;
      }

      await next();
    } catch {
      ctx.status = 401;
      ctx.body = { code: 401, message: '认证令牌无效或已过期' };
    }
  };
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}
