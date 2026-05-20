import { Context, Next } from 'koa';
import { error } from '../utils/response';

export async function errorHandler(ctx: Context, next: Next) {
  try {
    await next();
    if (ctx.status === 404) {
      ctx.body = error('接口不存在', 404);
    }
  } catch (err) {
    console.error('Error:', err);
    ctx.status = 500;
    ctx.body = error(err instanceof Error ? err.message : '服务器内部错误', 500);
  }
}
