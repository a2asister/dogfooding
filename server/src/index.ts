import Koa from 'koa';
import cors from '@koa/cors';
import { koaBody } from 'koa-body';
import Router from 'koa-router';

import authRouter from './routes/auth.js';
import articlesRouter from './routes/articles.js';
import questionsRouter from './routes/questions.js';
import projectsRouter from './routes/projects.js';
import commentsRouter from './routes/comments.js';
import communityRouter from './routes/community.js';
import adminRouter from './routes/admin.js';

const app = new Koa();
const router = new Router();

const PORT = Number(process.env.PORT) || 8765;

app.use(cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

app.use(koaBody({
  multipart: true,
  jsonLimit: '10mb',
  formLimit: '10mb',
}));

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    console.error('Error:', err);
    ctx.status = 500;
    ctx.body = { error: '服务器内部错误' };
  }
});

router.get('/api/health', (ctx) => {
  ctx.body = { status: 'ok', timestamp: new Date().toISOString() };
});

router.use('/api/auth', authRouter.routes(), authRouter.allowedMethods());
router.use('/api/articles', articlesRouter.routes(), articlesRouter.allowedMethods());
router.use('/api/questions', questionsRouter.routes(), questionsRouter.allowedMethods());
router.use('/api/projects', projectsRouter.routes(), projectsRouter.allowedMethods());
router.use('/api/comments', commentsRouter.routes(), commentsRouter.allowedMethods());
router.use('/api/community', communityRouter.routes(), communityRouter.allowedMethods());
router.use('/api/admin', adminRouter.routes(), adminRouter.allowedMethods());

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 API Docs: http://localhost:${PORT}/api/health`);
});
