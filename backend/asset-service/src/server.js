const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const cors = require('koa-cors');
const DataStore = require('@oa/data-store');

const app = new Koa();
const router = new Router();
const assetStore = new DataStore('asset-assets');
const inventoryStore = new DataStore('asset-inventories');
const maintenanceStore = new DataStore('asset-maintenances');

app.use(cors());
app.use(bodyParser());

router.get('/api/health', (ctx) => {
  ctx.body = { status: 'ok', service: 'asset-service', timestamp: new Date().toISOString() };
});

router.get('/api/assets', (ctx) => {
  const assets = assetStore.findAll();
  ctx.body = { success: true, data: assets };
});

router.get('/api/assets/:id', (ctx) => {
  const asset = assetStore.findById(ctx.params.id);
  if (!asset) {
    ctx.status = 404;
    ctx.body = { success: false, message: 'Asset not found' };
    return;
  }
  ctx.body = { success: true, data: asset };
});

router.post('/api/assets', (ctx) => {
  const asset = assetStore.create(ctx.request.body);
  ctx.status = 201;
  ctx.body = { success: true, data: asset };
});

router.put('/api/assets/:id', (ctx) => {
  const asset = assetStore.update(ctx.params.id, ctx.request.body);
  if (!asset) {
    ctx.status = 404;
    ctx.body = { success: false, message: 'Asset not found' };
    return;
  }
  ctx.body = { success: true, data: asset };
});

router.delete('/api/assets/:id', (ctx) => {
  const success = assetStore.delete(ctx.params.id);
  if (!success) {
    ctx.status = 404;
    ctx.body = { success: false, message: 'Asset not found' };
    return;
  }
  ctx.body = { success: true };
});

router.get('/api/inventories', (ctx) => {
  const inventories = inventoryStore.findAll();
  ctx.body = { success: true, data: inventories };
});

router.post('/api/inventories', (ctx) => {
  const inventory = inventoryStore.create(ctx.request.body);
  ctx.status = 201;
  ctx.body = { success: true, data: inventory };
});

router.get('/api/maintenances', (ctx) => {
  const maintenances = maintenanceStore.findAll();
  ctx.body = { success: true, data: maintenances };
});

router.post('/api/maintenances', (ctx) => {
  const maintenance = maintenanceStore.create(ctx.request.body);
  ctx.status = 201;
  ctx.body = { success: true, data: maintenance };
});

app.use(router.routes()).use(router.allowedMethods());

const PORT = 3004;
app.listen(PORT, () => {
  console.log(`Asset Service running on port ${PORT}`);
});
