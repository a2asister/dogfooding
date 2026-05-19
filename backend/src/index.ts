import Koa from 'koa';
import cors from '@koa/cors';
import { koaBody } from 'koa-body';
import Router from 'koa-router';

import { config } from './config';
import { initDatabase } from './db';
import { success } from './utils';

import authRouter from './routes/auth';
import usersRouter from './routes/users';
import groupsRouter from './routes/groups';
import projectsRouter from './routes/projects';
import apisRouter from './routes/apis';
import logsRouter from './routes/logs';
import mockApp from './mock';

initDatabase();

const app = new Koa();
const router = new Router();

app.use(cors({
  origin: '*',
  credentials: true
}));

app.use(koaBody({
  multipart: true,
  jsonLimit: '10mb',
  formLimit: '10mb'
}));

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err: any) {
    console.error('Server error:', err);
    ctx.status = err.statusCode || err.status || 500;
    ctx.body = {
      code: 1,
      message: err.message || '服务器内部错误',
      data: null
    };
  }
});

router.get('/api/health', (ctx) => {
  ctx.body = success({ status: 'ok' });
});

router.use(authRouter.routes()).use(authRouter.allowedMethods());
router.use(usersRouter.routes()).use(usersRouter.allowedMethods());
router.use(groupsRouter.routes()).use(groupsRouter.allowedMethods());
router.use(projectsRouter.routes()).use(projectsRouter.allowedMethods());
router.use(apisRouter.routes()).use(apisRouter.allowedMethods());
router.use(logsRouter.routes()).use(logsRouter.allowedMethods());

app.use(router.routes()).use(router.allowedMethods());

app.listen(config.port, () => {
  console.log(`API服务已启动: http://localhost:${config.port}`);
});

mockApp.listen(config.mockPort, () => {
  console.log(`Mock服务已启动: http://localhost:${config.mockPort}`);
});
