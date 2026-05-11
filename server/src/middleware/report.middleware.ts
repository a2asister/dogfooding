import { Middleware, IMiddleware } from '@midwayjs/core';
import { Context, NextFunction } from '@midwayjs/koa';

@Middleware()
export class ReportMiddleware implements IMiddleware<Context, NextFunction> {
  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      const startTime = Date.now();
      await next();
      const endTime = Date.now();
      ctx.set('X-Request-Time', `${endTime - startTime}ms`);
    };
  }
}
