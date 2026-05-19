import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { error } from '../utils/response';
import type { UserRole } from '../types';

export interface AuthRequest extends Request {
  user?: {
    userId: number;
    role: string;
    username: string;
  };
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json(error('未授权访问'));
    return;
  }

  const token = authHeader.slice(7);
  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json(error('Token 无效或已过期'));
    return;
  }

  req.user = payload;
  next();
}

export function requireRole(...roles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json(error('未授权访问'));
      return;
    }

    if (!roles.includes(req.user.role as UserRole)) {
      res.status(403).json(error('权限不足'));
      return;
    }

    next();
  };
}
