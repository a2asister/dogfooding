const Koa = require('koa');
const cors = require('koa-cors');
const { koaBody } = require('koa-body');
const logger = require('koa-logger');
const router = require('./routes');
const logSystem = require('./utils/logger');

const app = new Koa();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(koaBody());
app.use(logger((str) => {
  logSystem.info(str);
}));

app.use(async (ctx, next) => {
  try {
    await next();
    logSystem.info(`请求处理完成: ${ctx.method} ${ctx.url} - ${ctx.status}`);
  } catch (err) {
    ctx.status = err.status || 500;
    ctx.body = {
      success: false,
      message: err.message || '服务器内部错误'
    };
    logSystem.error(`请求处理失败: ${ctx.method} ${ctx.url} - ${err.message}`);
  }
});

app.use(router.routes()).use(router.allowedMethods());

app.listen(PORT, () => {
  console.log(`动物园管理系统后端服务已启动`);
  console.log(`服务地址: http://localhost:${PORT}`);
  logSystem.info(`动物园管理系统后端服务已启动，端口: ${PORT}`);
});
