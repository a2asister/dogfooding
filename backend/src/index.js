const Koa = require('koa');
const Router = require('koa-router');
const { koaBody } = require('koa-body');
const cors = require('koa2-cors');
const apiRouter = require('./routes');
const { scheduler, initScheduler } = require('./services/scheduler');

const app = new Koa();
const router = new Router();
const PORT = process.env.PORT || 3001;

router.get('/api/health', async (ctx) => {
  ctx.body = {
    success: true,
    message: 'Service is healthy',
    data: {
      timestamp: new Date().toISOString(),
      status: 'ok'
    }
  };
});

app.use(cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

app.use(koaBody({
  multipart: true,
  jsonLimit: '10mb',
  formLimit: '10mb'
}));

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    console.error('Error:', err);
    ctx.status = err.status || 500;
    ctx.body = {
      success: false,
      message: err.message || 'Internal Server Error',
      data: null
    };
  }
});

app.use(router.routes());
app.use(router.allowedMethods());
app.use(apiRouter.routes());
app.use(apiRouter.allowedMethods());

initScheduler();

app.listen(PORT, () => {
  console.log(`\n========================================`);
  console.log(`  自动化测试平台后端服务已启动`);
  console.log(`  地址: http://localhost:${PORT}`);
  console.log(`========================================\n`);
});
