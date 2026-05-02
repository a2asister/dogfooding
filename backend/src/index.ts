import Koa from 'koa';
import { koaBody } from 'koa-body';
import Router from 'koa-router';
import employeesRouter from './routes/employees';
import attendanceRouter from './routes/attendance';
import tasksRouter from './routes/tasks';
import projectsRouter from './routes/projects';
import collaborationRouter from './routes/collaboration';
import efficiencyRouter from './routes/efficiency';
import { initMockData } from './utils/mockData';

const PORT = 38901;

const app = new Koa();
const router = new Router();

app.use(koaBody());

app.use(async (ctx, next) => {
  ctx.set('Access-Control-Allow-Origin', '*');
  ctx.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  ctx.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (ctx.method === 'OPTIONS') {
    ctx.status = 200;
    return;
  }
  
  await next();
});

router.use(employeesRouter.routes()).use(employeesRouter.allowedMethods());
router.use(attendanceRouter.routes()).use(attendanceRouter.allowedMethods());
router.use(tasksRouter.routes()).use(tasksRouter.allowedMethods());
router.use(projectsRouter.routes()).use(projectsRouter.allowedMethods());
router.use(collaborationRouter.routes()).use(collaborationRouter.allowedMethods());
router.use(efficiencyRouter.routes()).use(efficiencyRouter.allowedMethods());

app.use(router.routes()).use(router.allowedMethods());

router.get('/api/health', async (ctx) => {
  ctx.body = { status: 'ok', timestamp: new Date().toISOString() };
});

initMockData();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API endpoint: http://localhost:${PORT}/api`);
});
