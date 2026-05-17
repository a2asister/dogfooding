import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: '未提供认证令牌' });
  }

  try {
    const secret = process.env.JWT_SECRET || 'fallback-secret';
    const user = jwt.verify(token, secret) as JwtPayload;
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: '无效的认证令牌' });
  }
}
