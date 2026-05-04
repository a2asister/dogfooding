const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const cors = require('koa-cors');
const DataStore = require('@oa/data-store');

const app = new Koa();
const router = new Router();
const contractStore = new DataStore('contract-contracts');
const vendorStore = new DataStore('contract-vendors');
const paymentStore = new DataStore('contract-payments');

app.use(cors());
app.use(bodyParser());

router.get('/api/health', (ctx) => {
  ctx.body = { status: 'ok', service: 'contract-service', timestamp: new Date().toISOString() };
});

router.get('/api/contracts', (ctx) => {
  const contracts = contractStore.findAll();
  ctx.body = { success: true, data: contracts };
});

router.get('/api/contracts/:id', (ctx) => {
  const contract = contractStore.findById(ctx.params.id);
  if (!contract) {
    ctx.status = 404;
    ctx.body = { success: false, message: 'Contract not found' };
    return;
  }
  ctx.body = { success: true, data: contract };
});

router.post('/api/contracts', (ctx) => {
  const contract = contractStore.create(ctx.request.body);
  ctx.status = 201;
  ctx.body = { success: true, data: contract };
});

router.put('/api/contracts/:id', (ctx) => {
  const contract = contractStore.update(ctx.params.id, ctx.request.body);
  if (!contract) {
    ctx.status = 404;
    ctx.body = { success: false, message: 'Contract not found' };
    return;
  }
  ctx.body = { success: true, data: contract };
});

router.delete('/api/contracts/:id', (ctx) => {
  const success = contractStore.delete(ctx.params.id);
  if (!success) {
    ctx.status = 404;
    ctx.body = { success: false, message: 'Contract not found' };
    return;
  }
  ctx.body = { success: true };
});

router.get('/api/vendors', (ctx) => {
  const vendors = vendorStore.findAll();
  ctx.body = { success: true, data: vendors };
});

router.post('/api/vendors', (ctx) => {
  const vendor = vendorStore.create(ctx.request.body);
  ctx.status = 201;
  ctx.body = { success: true, data: vendor };
});

router.get('/api/payments', (ctx) => {
  const payments = paymentStore.findAll();
  ctx.body = { success: true, data: payments };
});

router.post('/api/payments', (ctx) => {
  const payment = paymentStore.create(ctx.request.body);
  ctx.status = 201;
  ctx.body = { success: true, data: payment };
});

app.use(router.routes()).use(router.allowedMethods());

const PORT = 3006;
app.listen(PORT, () => {
  console.log(`Contract Service running on port ${PORT}`);
});
