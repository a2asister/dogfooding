import jwt from 'jsonwebtoken';
import { Context, Next } from 'koa';

const JWT_SECRET = process.env.JWT_SECRET || 'dogfooding-secret-key-2024';

export interface JwtPayload {
  userId: string;
  username: string;
  role: string;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

export async function authMiddleware(ctx: Context, next: Next): Promise<void> {
  const authHeader = ctx.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    ctx.status = 401;
    ctx.body = {
      code: 401,
      message: '未提供认证令牌',
      data: null,
    };
    return;
  }

  const token = authHeader.slice(7);
  const payload = verifyToken(token);

  if (!payload) {
    ctx.status = 401;
    ctx.body = {
      code: 401,
      message: '认证令牌无效或已过期',
      data: null,
    };
    return;
  }

  ctx.state.user = payload;
  await next();
}

export async function optionalAuthMiddleware(ctx: Context, next: Next): Promise<void> {
  const authHeader = ctx.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    const payload = verifyToken(token);
    if (payload) {
      ctx.state.user = payload;
    }
  }

  await next();
}
