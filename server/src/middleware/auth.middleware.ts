import type { Context, Next } from 'koa';
import { authService } from '../services/auth.service';
import type { UserRole } from '../types';

export function authMiddleware(ctx: Context, next: Next): Promise<void> | void {
  const authHeader = ctx.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    ctx.status = 401;
    ctx.body = { error: '未提供认证令牌' };
    return;
  }

  const token = authHeader.substring(7);
  const decoded = authService.verifyToken(token);
  if (!decoded) {
    ctx.status = 401;
    ctx.body = { error: '认证令牌无效或已过期' };
    return;
  }

  ctx.state.user = decoded;
  return next();
}

export function requirePermission(resource: string, action: string) {
  return function permissionMiddleware(ctx: Context, next: Next): Promise<void> | void {
    const userRole = ctx.state.user?.role as UserRole | undefined;
    if (!userRole) {
      ctx.status = 401;
      ctx.body = { error: '未授权' };
      return;
    }

    if (!authService.checkPermission(userRole, resource, action)) {
      ctx.status = 403;
      ctx.body = { error: '权限不足' };
      return;
    }

    return next();
  };
}

export function requireRole(...roles: UserRole[]) {
  return function roleMiddleware(ctx: Context, next: Next): Promise<void> | void {
    const userRole = ctx.state.user?.role as UserRole | undefined;
    if (!userRole) {
      ctx.status = 401;
      ctx.body = { error: '未授权' };
      return;
    }

    if (!roles.includes(userRole)) {
      ctx.status = 403;
      ctx.body = { error: '权限不足' };
      return;
    }

    return next();
  };
}

export function highRiskOperation(operation: string) {
  return function highRiskMiddleware(ctx: Context, next: Next): Promise<void> | void {
    const userId = ctx.state.user?.id as string | undefined;
    if (!userId) {
      ctx.status = 401;
      ctx.body = { error: '未授权' };
      return;
    }

    if (!authService.verifyHighRiskPermission(userId, operation)) {
      ctx.status = 403;
      ctx.body = { error: '高危操作需要管理员权限' };
      return;
    }

    return next();
  };
}
