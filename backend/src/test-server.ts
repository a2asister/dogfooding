import Koa from 'koa';
import Router from 'koa-router';

const app = new Koa();
const router = new Router();

router.get('/test', (ctx) => {
  ctx.body = { success: true, message: 'Test OK' };
});

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(3099, () => {
  console.log('Test server running on http://localhost:3099');
});
