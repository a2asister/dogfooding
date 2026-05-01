import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { AuthPayload } from '../types';

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export function createAuthMiddleware(authService: AuthService) {
  return function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: '未授权访问' });
    }

    const token = authHeader.split(' ')[1];

    try {
      const payload = authService.verifyToken(token);
      req.user = payload;
      next();
    } catch (error) {
      return res.status(401).json({ error: '无效的令牌' });
    }
  };
}
