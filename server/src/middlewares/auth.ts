import { Context, Next } from 'koa';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { User, UserRole } from '../models';

interface JwtPayload {
  userId: number;
  username: string;
  role: UserRole;
  iat: number;
  exp: number;
}

export interface AuthContext extends Context {
  state: {
    user: {
      userId: number;
      username: string;
      role: UserRole;
    };
  };
}

export const authMiddleware = async (ctx: AuthContext, next: Next) => {
  const authHeader = ctx.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    ctx.status = 401;
    ctx.body = {
      success: false,
      message: '未提供认证令牌',
      code: 'UNAUTHORIZED'
    };
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
    
    const user = await User.findByPk(decoded.userId);
    
    if (!user) {
      ctx.status = 401;
      ctx.body = {
        success: false,
        message: '用户不存在',
        code: 'USER_NOT_FOUND'
      };
      return;
    }

    ctx.state.user = {
      userId: decoded.userId,
      username: decoded.username,
      role: decoded.role
    };

    await next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      ctx.status = 401;
      ctx.body = {
        success: false,
        message: '令牌已过期',
        code: 'TOKEN_EXPIRED'
      };
    } else if (error instanceof jwt.JsonWebTokenError) {
      ctx.status = 401;
      ctx.body = {
        success: false,
        message: '无效的令牌',
        code: 'INVALID_TOKEN'
      };
    } else {
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: '认证失败',
        code: 'AUTH_FAILED'
      };
    }
  }
};

export const roleMiddleware = (allowedRoles: UserRole[]) => {
  return async (ctx: AuthContext, next: Next) => {
    const userRole = ctx.state.user?.role;

    if (!allowedRoles.includes(userRole)) {
      ctx.status = 403;
      ctx.body = {
        success: false,
        message: '权限不足',
        code: 'FORBIDDEN'
      };
      return;
    }

    await next();
  };
};
