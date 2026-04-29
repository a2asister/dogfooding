import type { Context, Next } from 'koa';

export const errorHandler = async (ctx: Context, next: Next) => {
  try {
    await next();
  } catch (err: unknown) {
    console.error('Error:', err);

    ctx.status = 500;
    ctx.body = {
      success: false,
      message: err instanceof Error ? err.message : '服务器内部错误',
    };
  }
};
