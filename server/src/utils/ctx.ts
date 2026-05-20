import type { Context } from 'koa';

export interface JwtPayload {
  userId: number;
  username: string;
  roleId?: number;
}

export function getUser(ctx: Context): JwtPayload | undefined {
  return (ctx as any).user;
}

export function getUserId(ctx: Context): number | undefined {
  return (ctx as any).user?.userId;
}

export function getUsername(ctx: Context): string | undefined {
  return (ctx as any).user?.username;
}
