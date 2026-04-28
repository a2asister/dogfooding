const Koa = require('koa');
const Router = require('@koa/router');
const bodyParser = require('koa-bodyparser');
const serveStatic = require('koa-static');
const compress = require('koa-compress');
const path = require('path');

const app = new Koa();
const router = new Router();

// 配置中间件
app.use(compress({
  filter: (contentType) => {
    return /text/i.test(contentType);
  },
  threshold: 2048,
  gzip: {
    flush: require('zlib').Z_SYNC_FLUSH
  }
}));

app.use(bodyParser({
  jsonLimit: '1mb',
  formLimit: '1mb'
}));

// 静态资源服务
app.use(serveStatic(path.join(__dirname, '../dist/client')));
app.use(serveStatic(path.join(__dirname, '../public')));

// 导入路由模块
const reservationRouter = require('./routes/reservation');
const queryRouter = require('./routes/query');
const ssrRouter = require('./routes/ssr');

// 注册 API 路由
router.use('/api/reservation', reservationRouter.routes(), reservationRouter.allowedMethods());
router.use('/api/query', queryRouter.routes(), queryRouter.allowedMethods());

// 注册主路由（API 路由）
app.use(router.routes());
app.use(router.allowedMethods());

// 注册 SSR 路由（处理页面请求，放在 API 路由之后）
app.use(ssrRouter.routes());
app.use(ssrRouter.allowedMethods());

// 错误处理中间件
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    console.error('服务器错误:', err);
    ctx.status = err.status || 500;
    ctx.body = {
      success: false,
      message: '服务器内部错误',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    };
  }
});

module.exports = app;
