import type { Request, Response, NextFunction } from 'express';
import { error } from '../utils/response';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  console.error(err);
  res.status(500).json(error(err.message || '服务器内部错误'));
}

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json(error('接口不存在'));
}
