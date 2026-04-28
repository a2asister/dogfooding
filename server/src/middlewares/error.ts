import { Context, Next } from 'koa';
import { config } from '../config';

export const errorMiddleware = async (ctx: Context, next: Next) => {
  try {
    await next();
    
    if (ctx.status === 404) {
      ctx.body = {
        success: false,
        message: '资源不存在',
        code: 'NOT_FOUND'
      };
    }
  } catch (error) {
    console.error('请求错误:', error);
    
    const err = error as Error & { status?: number; code?: string };
    
    ctx.status = err.status || 500;
    ctx.body = {
      success: false,
      message: err.message || '服务器内部错误',
      code: err.code || 'INTERNAL_ERROR'
    };

    if (config.env === 'development') {
      (ctx.body as any).stack = err.stack;
    }
  }
};

export const loggerMiddleware = async (ctx: Context, next: Next) => {
  const start = Date.now();
  const method = ctx.method;
  const url = ctx.url;
  const ip = ctx.ip;
  
  console.log(`[${new Date().toISOString()}] ${method} ${url} - IP: ${ip}`);
  
  await next();
  
  const duration = Date.now() - start;
  const status = ctx.status;
  
  console.log(`[${new Date().toISOString()}] ${method} ${url} - ${status} - ${duration}ms`);
};

export const responseMiddleware = async (ctx: Context, next: Next) => {
  const originalBody = ctx.body;
  
  await next();
  
  if (ctx.status === 200 || ctx.status === 201) {
    if (ctx.body === undefined && originalBody === undefined) {
      ctx.body = {
        success: true,
        message: '操作成功',
        data: null
      };
    } else if (ctx.body && !(ctx.body as any).success !== undefined) {
      ctx.body = {
        success: true,
        message: '操作成功',
        data: ctx.body
      };
    }
  }
};
