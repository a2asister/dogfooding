import { Context, Next } from 'koa';
import { verifyToken } from '../utils/auth';
import { error } from '../utils/response';

export async function authMiddleware(ctx: Context, next: Next) {
  const publicPaths = ['/api/auth/login', '/api/auth/register', '/api/health'];
  if (publicPaths.includes(ctx.path)) {
    return next();
  }

  const authHeader = ctx.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    ctx.status = 401;
    ctx.body = error('未提供认证令牌');
    return;
  }

  const token = authHeader.slice(7);
  const payload = verifyToken(token);
  if (!payload) {
    ctx.status = 401;
    ctx.body = error('认证令牌无效或已过期');
    return;
  }

  ctx.user = payload;
  return next();
}
