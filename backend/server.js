const Koa = require('koa');
const { koaBody } = require('koa-body');
const cors = require('koa-cors');
const router = require('./routes');
const PORT = 28473;

const app = new Koa();

app.use(cors());
app.use(koaBody({
  multipart: true,
  urlencoded: true,
  json: true
}));

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(PORT, () => {
  console.log(`后端服务已启动，运行在 http://localhost:${PORT}`);
});
