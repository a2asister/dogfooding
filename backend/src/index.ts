import 'dotenv/config';
import Koa from 'koa';
import cors from 'koa-cors';
import bodyParser from 'koa-bodyparser';
import { initDatabase } from './db';
import authRouter from './routes/auth';
import coursesRouter from './routes/courses';
import classesRouter from './routes/classes';
import homeworkRouter from './routes/homework';
import challengesRouter from './routes/challenges';
import projectsRouter from './routes/projects';
import wrongQuestionsRouter from './routes/wrongQuestions';
import statsRouter from './routes/stats';
import adminRouter from './routes/admin';
import notificationsRouter from './routes/notifications';

initDatabase();

const app = new Koa();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: true,
  credentials: true,
}));

app.use(bodyParser({
  jsonLimit: '10mb',
  formLimit: '10mb',
}));

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    console.error('Server error:', err);
    ctx.status = (err as { status?: number }).status || 500;
    ctx.body = { error: (err as { message?: string }).message || '服务器内部错误' };
  }
});

app.use(authRouter.routes()).use(authRouter.allowedMethods());
app.use(coursesRouter.routes()).use(coursesRouter.allowedMethods());
app.use(classesRouter.routes()).use(classesRouter.allowedMethods());
app.use(homeworkRouter.routes()).use(homeworkRouter.allowedMethods());
app.use(challengesRouter.routes()).use(challengesRouter.allowedMethods());
app.use(projectsRouter.routes()).use(projectsRouter.allowedMethods());
app.use(wrongQuestionsRouter.routes()).use(wrongQuestionsRouter.allowedMethods());
app.use(statsRouter.routes()).use(statsRouter.allowedMethods());
app.use(adminRouter.routes()).use(adminRouter.allowedMethods());
app.use(notificationsRouter.routes()).use(notificationsRouter.allowedMethods());

app.listen(PORT, () => {
  console.info(`少儿编程平台后端服务已启动，端口: ${PORT}`);
});
