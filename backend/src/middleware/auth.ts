import { Context, Next } from 'koa';
import { verifyToken, error } from '../utils';
import { Role, TokenPayload } from '../types';
import db from '../db';

export function authMiddleware(ctx: Context, next: Next): Promise<unknown> | void {
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

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(payload.id) as any;
  if (!user || user.status === 'disabled') {
    ctx.status = 401;
    ctx.body = error('用户不存在或已被禁用');
    return;
  }

  ctx.state.user = {
    id: user.id,
    username: user.username,
    nickname: user.nickname,
    role: user.role,
    groupId: user.group_id
  } as unknown as TokenPayload & { nickname: string; groupId?: number };

  return next();
}

export function roleMiddleware(...allowedRoles: Role[]) {
  return (ctx: Context, next: Next): Promise<unknown> | void => {
    const userRole = ctx.state.user?.role;
    if (!userRole || !allowedRoles.includes(userRole)) {
      ctx.status = 403;
      ctx.body = error('权限不足');
      return;
    }
    return next();
  };
}
