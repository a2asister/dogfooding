import { Context, Next } from 'koa';
import { verifyToken } from '../utils/auth';
import { errorResponse } from '../utils/auth';

export async function authMiddleware(ctx: Context, next: Next): Promise<void> {
  const token = ctx.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    ctx.status = 401;
    ctx.body = errorResponse('未提供认证令牌');
    return;
  }

  const payload = verifyToken(token);
  if (!payload) {
    ctx.status = 401;
    ctx.body = errorResponse('认证令牌无效或已过期');
    return;
  }

  ctx.state.user = payload;
  await next();
}

export function roleMiddleware(roles: string[]): (ctx: Context, next: Next) => Promise<void> {
  return async (ctx: Context, next: Next): Promise<void> => {
    const user = ctx.state.user;
    if (!user || !roles.includes(user.role)) {
      ctx.status = 403;
      ctx.body = errorResponse('权限不足');
      return;
    }
    await next();
  };
}

export async function loggerMiddleware(ctx: Context, next: Next): Promise<void> {
  const start = Date.now();
  await next();
  const duration = Date.now() - start;
  console.log(`${ctx.method} ${ctx.url} ${ctx.status} - ${duration}ms`);
}
