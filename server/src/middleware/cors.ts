import { Context, Next } from 'koa';

export async function corsMiddleware(ctx: Context, next: Next) {
  ctx.set('Access-Control-Allow-Origin', '*');
  ctx.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  ctx.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  ctx.set('Access-Control-Max-Age', '86400');

  if (ctx.method === 'OPTIONS') {
    ctx.status = 204;
    return;
  }

  return next();
}
