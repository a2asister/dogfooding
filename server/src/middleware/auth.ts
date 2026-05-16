import { Context, Next } from 'koa';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config';

export interface AuthContext extends Context {
  state: {
    userId?: number;
  };
}

export const authMiddleware = async (ctx: AuthContext, next: Next) => {
  const token = ctx.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    ctx.status = 401;
    ctx.body = { code: 401, message: '未授权' };
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    ctx.state.userId = decoded.userId;
    await next();
  } catch (err) {
    ctx.status = 401;
    ctx.body = { code: 401, message: 'Token 无效' };
  }
};
