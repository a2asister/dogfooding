const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const cors = require('koa-cors');
const DataStore = require('@oa/data-store');

const app = new Koa();
const router = new Router();
const noticeStore = new DataStore('admin-notices');
const documentStore = new DataStore('admin-documents');
const eventStore = new DataStore('admin-events');

app.use(cors());
app.use(bodyParser());

router.get('/api/health', (ctx) => {
  ctx.body = { status: 'ok', service: 'admin-service', timestamp: new Date().toISOString() };
});

router.get('/api/notices', (ctx) => {
  const notices = noticeStore.findAll();
  ctx.body = { success: true, data: notices };
});

router.get('/api/notices/:id', (ctx) => {
  const notice = noticeStore.findById(ctx.params.id);
  if (!notice) {
    ctx.status = 404;
    ctx.body = { success: false, message: 'Notice not found' };
    return;
  }
  ctx.body = { success: true, data: notice };
});

router.post('/api/notices', (ctx) => {
  const notice = noticeStore.create(ctx.request.body);
  ctx.status = 201;
  ctx.body = { success: true, data: notice };
});

router.put('/api/notices/:id', (ctx) => {
  const notice = noticeStore.update(ctx.params.id, ctx.request.body);
  if (!notice) {
    ctx.status = 404;
    ctx.body = { success: false, message: 'Notice not found' };
    return;
  }
  ctx.body = { success: true, data: notice };
});

router.delete('/api/notices/:id', (ctx) => {
  const success = noticeStore.delete(ctx.params.id);
  if (!success) {
    ctx.status = 404;
    ctx.body = { success: false, message: 'Notice not found' };
    return;
  }
  ctx.body = { success: true };
});

router.get('/api/documents', (ctx) => {
  const documents = documentStore.findAll();
  ctx.body = { success: true, data: documents };
});

router.post('/api/documents', (ctx) => {
  const document = documentStore.create(ctx.request.body);
  ctx.status = 201;
  ctx.body = { success: true, data: document };
});

router.get('/api/events', (ctx) => {
  const events = eventStore.findAll();
  ctx.body = { success: true, data: events };
});

router.post('/api/events', (ctx) => {
  const event = eventStore.create(ctx.request.body);
  ctx.status = 201;
  ctx.body = { success: true, data: event };
});

app.use(router.routes()).use(router.allowedMethods());

const PORT = 3003;
app.listen(PORT, () => {
  console.log(`Admin Service running on port ${PORT}`);
});
