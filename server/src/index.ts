import Koa from 'koa';
import cors from 'koa-cors';
import bodyParser from 'koa-bodyparser';
import { config } from './config';
import { initDB } from './models/database';
import { loggerMiddleware } from './middleware/auth';
import authRouter from './routes/auth';
import studentRouter from './routes/student';
import portalRouter from './routes/portal';
import { seedDatabase } from './utils/seed';
import fs from 'fs';
import path from 'path';

async function bootstrap(): Promise<void> {
  const app = new Koa();

  initDB();

  const dbPath = config.database.path;
  if (!fs.existsSync(dbPath) || fs.statSync(dbPath).size < 1000) {
    console.log('数据库为空，正在生成模拟数据...');
    await seedDatabase();
  }

  app.use(
    cors({
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      headers: ['Content-Type', 'Authorization'],
    })
  );

  app.use(bodyParser());
  app.use(loggerMiddleware);

  app.use(async (ctx, next) => {
    try {
      await next();
    } catch (err: any) {
      console.error('Error:', err);
      ctx.status = 500;
      ctx.body = { code: 500, message: err.message || '服务器内部错误' };
    }
  });

  app.use(authRouter.routes());
  app.use(authRouter.allowedMethods());
  app.use(studentRouter.routes());
  app.use(studentRouter.allowedMethods());
  app.use(portalRouter.routes());
  app.use(portalRouter.allowedMethods());

  app.listen(config.port, () => {
    console.log(`🚀 服务器运行在 http://localhost:${config.port}`);
  });
}

bootstrap().catch(console.error);
