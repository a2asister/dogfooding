import Router from 'koa-router';
import authRouter from './auth';
import usersRouter from './users';
import coursesRouter from './courses';
import batchesRouter from './batches';
import electiveRouter from './elective';
import gradesRouter from './grades';
import statisticsRouter from './statistics';
import teacherRouter from './teacher';

const router = new Router();

router.use(authRouter.routes()).use(authRouter.allowedMethods());
router.use(usersRouter.routes()).use(usersRouter.allowedMethods());
router.use(coursesRouter.routes()).use(coursesRouter.allowedMethods());
router.use(batchesRouter.routes()).use(batchesRouter.allowedMethods());
router.use(electiveRouter.routes()).use(electiveRouter.allowedMethods());
router.use(gradesRouter.routes()).use(gradesRouter.allowedMethods());
router.use(statisticsRouter.routes()).use(statisticsRouter.allowedMethods());
router.use(teacherRouter.routes()).use(teacherRouter.allowedMethods());

router.get('/api/health', (ctx) => {
  ctx.body = { success: true, message: '服务运行正常', timestamp: new Date().toISOString() };
});

export default router;
