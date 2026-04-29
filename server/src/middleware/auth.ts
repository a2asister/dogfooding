import type { Context, Next } from 'koa';
import { verifyToken } from '../utils/jwt';
import type { UserRole } from '../types';

export const authMiddleware = async (ctx: Context, next: Next) => {
  const token = ctx.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    ctx.status = 401;
    ctx.body = { success: false, message: '未提供认证令牌' };
    return;
  }

  const payload = verifyToken(token);
  if (!payload) {
    ctx.status = 401;
    ctx.body = { success: false, message: '令牌无效或已过期' };
    return;
  }

  ctx.state.user = payload;
  await next();
};

export const roleMiddleware = (...requiredRoles: UserRole[]) => {
  return async (ctx: Context, next: Next) => {
    const user = ctx.state.user;

    if (!user) {
      ctx.status = 401;
      ctx.body = { success: false, message: '未认证' };
      return;
    }

    if (!requiredRoles.includes(user.role)) {
      ctx.status = 403;
      ctx.body = { success: false, message: '权限不足' };
      return;
    }

    await next();
  };
};
