const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const cors = require('koa-cors');
const DataStore = require('@oa/data-store');

const app = new Koa();
const router = new Router();
const roomStore = new DataStore('meeting-rooms');
const bookingStore = new DataStore('meeting-bookings');
const equipmentStore = new DataStore('meeting-equipments');

app.use(cors());
app.use(bodyParser());

router.get('/api/health', (ctx) => {
  ctx.body = { status: 'ok', service: 'meeting-service', timestamp: new Date().toISOString() };
});

router.get('/api/rooms', (ctx) => {
  const rooms = roomStore.findAll();
  ctx.body = { success: true, data: rooms };
});

router.get('/api/rooms/:id', (ctx) => {
  const room = roomStore.findById(ctx.params.id);
  if (!room) {
    ctx.status = 404;
    ctx.body = { success: false, message: 'Meeting room not found' };
    return;
  }
  ctx.body = { success: true, data: room };
});

router.post('/api/rooms', (ctx) => {
  const room = roomStore.create(ctx.request.body);
  ctx.status = 201;
  ctx.body = { success: true, data: room };
});

router.put('/api/rooms/:id', (ctx) => {
  const room = roomStore.update(ctx.params.id, ctx.request.body);
  if (!room) {
    ctx.status = 404;
    ctx.body = { success: false, message: 'Meeting room not found' };
    return;
  }
  ctx.body = { success: true, data: room };
});

router.delete('/api/rooms/:id', (ctx) => {
  const success = roomStore.delete(ctx.params.id);
  if (!success) {
    ctx.status = 404;
    ctx.body = { success: false, message: 'Meeting room not found' };
    return;
  }
  ctx.body = { success: true };
});

router.get('/api/bookings', (ctx) => {
  const bookings = bookingStore.findAll();
  ctx.body = { success: true, data: bookings };
});

router.post('/api/bookings', (ctx) => {
  const booking = bookingStore.create(ctx.request.body);
  ctx.status = 201;
  ctx.body = { success: true, data: booking };
});

router.get('/api/equipments', (ctx) => {
  const equipments = equipmentStore.findAll();
  ctx.body = { success: true, data: equipments };
});

router.post('/api/equipments', (ctx) => {
  const equipment = equipmentStore.create(ctx.request.body);
  ctx.status = 201;
  ctx.body = { success: true, data: equipment };
});

app.use(router.routes()).use(router.allowedMethods());

const PORT = 3008;
app.listen(PORT, () => {
  console.log(`Meeting Service running on port ${PORT}`);
});
