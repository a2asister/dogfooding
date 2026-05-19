import type { Request, Response, NextFunction } from 'express';

export function requestLogger(req: Request, _res: Response, next: NextFunction): void {
  console.warn(`[${new Date().toISOString()}] ${req.method} ${req.path} ${req.ip}`);
  next();
}
