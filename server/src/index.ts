import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import Router from 'koa-router';
import cors from 'koa-cors';
import contractRouter from './routes/contracts';
import approvalRouter from './routes/approvals';
import performanceRouter from './routes/performance';
import archiveRouter from './routes/archives';
import aiReviewRouter from './routes/aiReview';

const app = new Koa();
const router = new Router();

const PORT = 38440;

app.use(cors());
app.use(bodyParser());

router.get('/', async (ctx) => {
  ctx.body = {
    message: '合同全生命周期管理系统 API 服务运行中',
    timestamp: new Date().toISOString()
  };
});

router.use('/api/contracts', contractRouter.routes(), contractRouter.allowedMethods());
router.use('/api/approvals', approvalRouter.routes(), approvalRouter.allowedMethods());
router.use('/api/performance', performanceRouter.routes(), performanceRouter.allowedMethods());
router.use('/api/archives', archiveRouter.routes(), archiveRouter.allowedMethods());
router.use('/api/ai-review', aiReviewRouter.routes(), aiReviewRouter.allowedMethods());

app.use(router.routes()).use(router.allowedMethods());

app.listen(PORT, () => {
  console.log(`合同管理系统后端服务已启动，端口: ${PORT}`);
  console.log(`API 地址: http://localhost:${PORT}`);
});
