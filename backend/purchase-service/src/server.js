const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const cors = require('koa-cors');
const DataStore = require('@oa/data-store');

const app = new Koa();
const router = new Router();
const purchaseStore = new DataStore('purchase-purchases');
const supplierStore = new DataStore('purchase-suppliers');
const approvalStore = new DataStore('purchase-approvals');

app.use(cors());
app.use(bodyParser());

router.get('/api/health', (ctx) => {
  ctx.body = { status: 'ok', service: 'purchase-service', timestamp: new Date().toISOString() };
});

router.get('/api/purchases', (ctx) => {
  const purchases = purchaseStore.findAll();
  ctx.body = { success: true, data: purchases };
});

router.get('/api/purchases/:id', (ctx) => {
  const purchase = purchaseStore.findById(ctx.params.id);
  if (!purchase) {
    ctx.status = 404;
    ctx.body = { success: false, message: 'Purchase not found' };
    return;
  }
  ctx.body = { success: true, data: purchase };
});

router.post('/api/purchases', (ctx) => {
  const purchase = purchaseStore.create(ctx.request.body);
  ctx.status = 201;
  ctx.body = { success: true, data: purchase };
});

router.put('/api/purchases/:id', (ctx) => {
  const purchase = purchaseStore.update(ctx.params.id, ctx.request.body);
  if (!purchase) {
    ctx.status = 404;
    ctx.body = { success: false, message: 'Purchase not found' };
    return;
  }
  ctx.body = { success: true, data: purchase };
});

router.delete('/api/purchases/:id', (ctx) => {
  const success = purchaseStore.delete(ctx.params.id);
  if (!success) {
    ctx.status = 404;
    ctx.body = { success: false, message: 'Purchase not found' };
    return;
  }
  ctx.body = { success: true };
});

router.get('/api/suppliers', (ctx) => {
  const suppliers = supplierStore.findAll();
  ctx.body = { success: true, data: suppliers };
});

router.post('/api/suppliers', (ctx) => {
  const supplier = supplierStore.create(ctx.request.body);
  ctx.status = 201;
  ctx.body = { success: true, data: supplier };
});

router.get('/api/approvals', (ctx) => {
  const approvals = approvalStore.findAll();
  ctx.body = { success: true, data: approvals };
});

router.post('/api/approvals', (ctx) => {
  const approval = approvalStore.create(ctx.request.body);
  ctx.status = 201;
  ctx.body = { success: true, data: approval };
});

app.use(router.routes()).use(router.allowedMethods());

const PORT = 3009;
app.listen(PORT, () => {
  console.log(`Purchase Service running on port ${PORT}`);
});
