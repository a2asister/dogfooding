const Koa = require('koa');
const Router = require('@koa/router');
const bodyParser = require('koa-bodyparser');
const cors = require('koa-cors');
const static = require('koa-static');
const path = require('path');

const projectRoutes = require('./routes/project');
const riskRoutes = require('./routes/risk');
const reportRoutes = require('./routes/report');
const ruleRoutes = require('./routes/rule');
const rectificationRoutes = require('./routes/rectification');

const app = new Koa();
const router = new Router();

// 中间件
app.use(cors());
app.use(bodyParser());
app.use(static(path.join(__dirname, '../public')));

// 路由
router.use('/api/projects', projectRoutes.routes());
router.use('/api/risks', riskRoutes.routes());
router.use('/api/reports', reportRoutes.routes());
router.use('/api/rules', ruleRoutes.routes());
router.use('/api/rectifications', rectificationRoutes.routes());

app.use(router.routes()).use(router.allowedMethods());

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`风险管控系统后端服务运行在 http://localhost:${PORT}`);
});
