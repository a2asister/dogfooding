const Koa = require('koa');
const Router = require('koa-router');
const { koaBody } = require('koa-body');
const cors = require('koa-cors');

const logRoutes = require('./routes/logs');
const alertRoutes = require('./routes/alerts');
const traceRoutes = require('./routes/traces');
const replayRoutes = require('./routes/replay');
const { initAll } = require('./utils/initData');
const { logBuffer } = require('./utils/logBuffer');

const app = new Koa();
const router = new Router();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  headers: ['Content-Type', 'Authorization']
}));

app.use(koaBody({
  jsonLimit: '10mb',
  multipart: true
}));

router.use('/api/logs', logRoutes.routes(), logRoutes.allowedMethods());
router.use('/api/alerts', alertRoutes.routes(), alertRoutes.allowedMethods());
router.use('/api/traces', traceRoutes.routes(), traceRoutes.allowedMethods());
router.use('/api/replay', replayRoutes.routes(), replayRoutes.allowedMethods());

app.use(router.routes());
app.use(router.allowedMethods());

const PORT = process.env.PORT || 3000;
const INIT_LOG_COUNT = parseInt(process.env.INIT_LOG_COUNT) || 200;

process.on('SIGTERM', () => {
  console.log('Shutting down gracefully...');
  logBuffer.shutdown();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Shutting down gracefully...');
  logBuffer.shutdown();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`日志审计系统后端服务已启动，端口: ${PORT}`);
  console.log(`API 端点: http://localhost:${PORT}/api/`);
  console.log('');
  console.log('正在初始化数据...');
  console.log('='.repeat(60));
  
  initAll({
    initServicesFlag: true,
    initRulesFlag: true,
    initLogsFlag: true,
    logCount: INIT_LOG_COUNT
  });
  
  console.log('='.repeat(60));
  console.log('服务启动完成！');
  console.log('');
  console.log('前端访问地址: http://localhost:5173');
  console.log('后端API地址: http://localhost:3000');
  console.log('');
  console.log('可用API:');
  console.log('  POST /api/logs/ingest - 接收日志');
  console.log('  GET  /api/logs/search - 查询日志');
  console.log('  GET  /api/logs/stats  - 获取统计');
  console.log('  GET  /api/logs/buffer/stats - 获取缓冲统计');
  console.log('  POST /api/logs/buffer/flush - 手动刷新缓冲');
  console.log('  POST /api/traces/create - 创建链路追踪');
  console.log('  GET  /api/traces/search - 查询链路');
  console.log('  GET  /api/alerts/rules - 获取告警规则');
  console.log('  POST /api/alerts/rules/evaluate - 评估告警规则');
  console.log('');
  console.log('【时序存储API】:');
  console.log('  GET  /api/replay/timeseries/stats - 获取时序存储统计');
  console.log('  POST /api/replay/timeseries/query - 时序查询');
  console.log('  GET  /api/replay/timeseries/trend - 获取趋势数据');
  console.log('  GET  /api/replay/timeseries/aggregation - 获取聚合数据');
  console.log('');
  console.log('【日志回放API】:');
  console.log('  POST /api/replay/session/create - 创建回放会话');
  console.log('  GET  /api/replay/sessions - 获取所有会话');
  console.log('  GET  /api/replay/session/:id - 获取会话详情');
  console.log('  POST /api/replay/session/:id/play - 开始播放');
  console.log('  POST /api/replay/session/:id/pause - 暂停播放');
  console.log('  POST /api/replay/session/:id/seek - 跳转位置');
  console.log('  GET  /api/replay/session/:id/timeline - 获取时间轴');
  console.log('  GET  /api/replay/session/:id/callchain - 获取调用链');
});
