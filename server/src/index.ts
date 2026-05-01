import Koa from 'koa';
import { koaBody } from 'koa-body';
import cors from 'koa-cors';
import storesRouter from './routes/stores';
import customerFlowsRouter from './routes/customerFlows';
import inventoriesRouter from './routes/inventories';
import membersRouter from './routes/members';
import promotionsRouter from './routes/promotions';
import attendancesRouter from './routes/attendances';
import employeesRouter from './routes/employees';
import summaryRouter from './routes/summary';

const app = new Koa();
const PORT = process.env.PORT || 35678;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  headers: ['Content-Type', 'Authorization']
}));

app.use(koaBody({
  multipart: true,
  jsonLimit: '10mb',
  formLimit: '10mb'
}));

app.use(storesRouter.routes()).use(storesRouter.allowedMethods());
app.use(customerFlowsRouter.routes()).use(customerFlowsRouter.allowedMethods());
app.use(inventoriesRouter.routes()).use(inventoriesRouter.allowedMethods());
app.use(membersRouter.routes()).use(membersRouter.allowedMethods());
app.use(promotionsRouter.routes()).use(promotionsRouter.allowedMethods());
app.use(attendancesRouter.routes()).use(attendancesRouter.allowedMethods());
app.use(employeesRouter.routes()).use(employeesRouter.allowedMethods());
app.use(summaryRouter.routes()).use(summaryRouter.allowedMethods());

app.listen(PORT, () => {
  console.log(`🚀 线下门店数字化运营中台后端服务已启动`);
  console.log(`📡 服务地址: http://localhost:${PORT}`);
  console.log(`🔌 端口号: ${PORT}`);
});

export default app;
