const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const cors = require('koa-cors');
const DataStore = require('@oa/data-store');

const app = new Koa();
const router = new Router();
const vehicleStore = new DataStore('vehicle-vehicles');
const reservationStore = new DataStore('vehicle-reservations');
const maintenanceStore = new DataStore('vehicle-maintenances');

app.use(cors());
app.use(bodyParser());

router.get('/api/health', (ctx) => {
  ctx.body = { status: 'ok', service: 'vehicle-service', timestamp: new Date().toISOString() };
});

router.get('/api/vehicles', (ctx) => {
  const vehicles = vehicleStore.findAll();
  ctx.body = { success: true, data: vehicles };
});

router.get('/api/vehicles/:id', (ctx) => {
  const vehicle = vehicleStore.findById(ctx.params.id);
  if (!vehicle) {
    ctx.status = 404;
    ctx.body = { success: false, message: 'Vehicle not found' };
    return;
  }
  ctx.body = { success: true, data: vehicle };
});

router.post('/api/vehicles', (ctx) => {
  const vehicle = vehicleStore.create(ctx.request.body);
  ctx.status = 201;
  ctx.body = { success: true, data: vehicle };
});

router.put('/api/vehicles/:id', (ctx) => {
  const vehicle = vehicleStore.update(ctx.params.id, ctx.request.body);
  if (!vehicle) {
    ctx.status = 404;
    ctx.body = { success: false, message: 'Vehicle not found' };
    return;
  }
  ctx.body = { success: true, data: vehicle };
});

router.delete('/api/vehicles/:id', (ctx) => {
  const success = vehicleStore.delete(ctx.params.id);
  if (!success) {
    ctx.status = 404;
    ctx.body = { success: false, message: 'Vehicle not found' };
    return;
  }
  ctx.body = { success: true };
});

router.get('/api/reservations', (ctx) => {
  const reservations = reservationStore.findAll();
  ctx.body = { success: true, data: reservations };
});

router.post('/api/reservations', (ctx) => {
  const reservation = reservationStore.create(ctx.request.body);
  ctx.status = 201;
  ctx.body = { success: true, data: reservation };
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

const PORT = 3007;
app.listen(PORT, () => {
  console.log(`Vehicle Service running on port ${PORT}`);
});
