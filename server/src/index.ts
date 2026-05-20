import Koa from 'koa';
import cors from '@koa/cors';
import bodyParser from 'koa-bodyparser';
import projectsRouter from './routes/projects';
import tasksRouter from './routes/tasks';

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

app.use(projectsRouter.routes());
app.use(projectsRouter.allowedMethods());
app.use(tasksRouter.routes());
app.use(tasksRouter.allowedMethods());

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
