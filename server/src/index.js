const Koa = require('koa');
const cors = require('@koa/cors');
const { koaBody } = require('koa-body');
const Router = require('koa-router');

const contentsRouter = require('./routes/contents');
const rulesRouter = require('./routes/rules');
const logsRouter = require('./routes/logs');

const app = new Koa();
const router = new Router();
const PORT = 8765;

app.use(cors({
  origin: '*',
  credentials: true
}));

app.use(koaBody({
  multipart: true,
  formidable: {
    maxFileSize: 50 * 1024 * 1024
  }
}));

router.use('/api/contents', contentsRouter.routes(), contentsRouter.allowedMethods());
router.use('/api/rules', rulesRouter.routes(), rulesRouter.allowedMethods());
router.use('/api/logs', logsRouter.routes(), logsRouter.allowedMethods());

router.get('/api/health', async (ctx) => {
  ctx.body = {
    success: true,
    message: '内容审核中台服务运行正常',
    timestamp: new Date().toISOString()
  };
});

app.use(router.routes()).use(router.allowedMethods());

app.on('error', (err, ctx) => {
  console.error('服务错误:', err);
  ctx.status = 500;
  ctx.body = {
    success: false,
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  };
});

app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`  内容审核中台服务已启动`);
  console.log(`  服务端口: ${PORT}`);
  console.log(`  API 地址: http://localhost:${PORT}/api`);
  console.log(`=========================================`);
});
