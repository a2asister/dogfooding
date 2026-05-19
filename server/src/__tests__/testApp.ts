import Koa from 'koa';
import Router from 'koa-router';
import koaBody from 'koa-body';
import cors from '@koa/cors';
import type { Database } from 'better-sqlite3';

export interface TestAppOptions {
  db: Database;
}

export function createTestApp(options: TestAppOptions): Koa {
  const { db } = options;
  const app = new Koa();

  app.use(cors());
  app.use(koaBody({ multipart: true }));

  app.use(async (ctx, next) => {
    (ctx as any).db = db;
    await next();
  });

  return app;
}

export function createTestRouter(): Router {
  return new Router({ prefix: '/api' });
}
