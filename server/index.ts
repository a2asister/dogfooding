import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import cors from '@koa/cors';
import router from './routes/index.js';

const app = new Koa();
const PORT = 45678;

app.use(cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

app.use(bodyParser({
  enableTypes: ['json'],
  jsonLimit: '10mb',
}));

app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
});

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
