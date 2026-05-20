import Koa from 'koa';
import cors from '@koa/cors';
import bodyParser from 'koa-bodyparser';
import projectsRouter from './routes/projects';
import tasksRouter from './routes/tasks';
import authRouter from './routes/auth';
import usersRouter from './routes/users';
import organizationsRouter from './routes/organizations';
import sprintsRouter from './routes/sprints';
import backlogRouter from './routes/backlog';
import versionsRouter from './routes/versions';

const app = new Koa();
const PORT = 31845;

app.use(cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

app.use(bodyParser());

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    const error = err as { message?: string; status?: number };
    ctx.status = error.status || 500;
    ctx.body = {
      code: ctx.status,
      message: error.message || 'Internal Server Error',
      data: null,
    };
  }
});

app.use(authRouter.routes());
app.use(authRouter.allowedMethods());
app.use(usersRouter.routes());
app.use(usersRouter.allowedMethods());
app.use(organizationsRouter.routes());
app.use(organizationsRouter.allowedMethods());
app.use(projectsRouter.routes());
app.use(projectsRouter.allowedMethods());
app.use(tasksRouter.routes());
app.use(tasksRouter.allowedMethods());
app.use(sprintsRouter.routes());
app.use(sprintsRouter.allowedMethods());
app.use(backlogRouter.routes());
app.use(backlogRouter.allowedMethods());
app.use(versionsRouter.routes());
app.use(versionsRouter.allowedMethods());

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
