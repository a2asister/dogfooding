import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import Router from '@koa/router';
import budgetsRouter from './routes/budgets';
import applicationsRouter from './routes/applications';
import receiptsRouter from './routes/receipts';
import commonRouter from './routes/common';

const app = new Koa();
const router = new Router();

const PORT = 19876;

app.use(async (ctx, next) => {
  ctx.set('Access-Control-Allow-Origin', '*');
  ctx.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  ctx.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (ctx.method === 'OPTIONS') {
    ctx.status = 204;
    return;
  }
  
  await next();
});

app.use(bodyParser({
  jsonLimit: '10mb',
  formLimit: '10mb'
}));

app.use(async (ctx, next) => {
  const start = Date.now();
  try {
    await next();
    const ms = Date.now() - start;
    console.log(`${ctx.method} ${ctx.url} - ${ctx.status} - ${ms}ms`);
  } catch (err) {
    const ms = Date.now() - start;
    console.error(`${ctx.method} ${ctx.url} - ${ms}ms`, err);
    ctx.status = (err as any).statusCode || 500;
    ctx.body = {
      success: false,
      message: (err as Error).message || '服务器内部错误'
    };
  }
});

router.use('', commonRouter.routes(), commonRouter.allowedMethods());
router.use('', budgetsRouter.routes(), budgetsRouter.allowedMethods());
router.use('', applicationsRouter.routes(), applicationsRouter.allowedMethods());
router.use('', receiptsRouter.routes(), receiptsRouter.allowedMethods());

router.get('/api/health', async (ctx) => {
  ctx.body = {
    success: true,
    message: '服务运行正常',
    timestamp: new Date().toISOString()
  };
});

app.use(router.routes());
app.use(router.allowedMethods());

app.use(async (ctx) => {
  ctx.status = 404;
  ctx.body = {
    success: false,
    message: '接口不存在'
  };
});

app.listen(PORT, () => {
  console.log(`
========================================
   费用报销 & 预算管控平台 后端服务
========================================
服务地址: http://localhost:${PORT}
API 前缀: http://localhost:${PORT}/api
启动时间: ${new Date().toLocaleString()}
========================================
`);
});
