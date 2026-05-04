const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const cors = require('koa-cors');
const DataStore = require('@oa/data-store');

const app = new Koa();
const router = new Router();
const employeeStore = new DataStore('hr-employees');
const departmentStore = new DataStore('hr-departments');
const attendanceStore = new DataStore('hr-attendance');

app.use(cors());
app.use(bodyParser());

router.get('/api/health', (ctx) => {
  ctx.body = { status: 'ok', service: 'hr-service', timestamp: new Date().toISOString() };
});

router.get('/api/employees', (ctx) => {
  const employees = employeeStore.findAll();
  ctx.body = { success: true, data: employees };
});

router.get('/api/employees/:id', (ctx) => {
  const employee = employeeStore.findById(ctx.params.id);
  if (!employee) {
    ctx.status = 404;
    ctx.body = { success: false, message: 'Employee not found' };
    return;
  }
  ctx.body = { success: true, data: employee };
});

router.post('/api/employees', (ctx) => {
  const employee = employeeStore.create(ctx.request.body);
  ctx.status = 201;
  ctx.body = { success: true, data: employee };
});

router.put('/api/employees/:id', (ctx) => {
  const employee = employeeStore.update(ctx.params.id, ctx.request.body);
  if (!employee) {
    ctx.status = 404;
    ctx.body = { success: false, message: 'Employee not found' };
    return;
  }
  ctx.body = { success: true, data: employee };
});

router.delete('/api/employees/:id', (ctx) => {
  const success = employeeStore.delete(ctx.params.id);
  if (!success) {
    ctx.status = 404;
    ctx.body = { success: false, message: 'Employee not found' };
    return;
  }
  ctx.body = { success: true };
});

router.get('/api/departments', (ctx) => {
  const departments = departmentStore.findAll();
  ctx.body = { success: true, data: departments };
});

router.post('/api/departments', (ctx) => {
  const department = departmentStore.create(ctx.request.body);
  ctx.status = 201;
  ctx.body = { success: true, data: department };
});

router.get('/api/attendance', (ctx) => {
  const attendance = attendanceStore.findAll();
  ctx.body = { success: true, data: attendance };
});

router.post('/api/attendance', (ctx) => {
  const record = attendanceStore.create(ctx.request.body);
  ctx.status = 201;
  ctx.body = { success: true, data: record };
});

app.use(router.routes()).use(router.allowedMethods());

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`HR Service running on port ${PORT}`);
});
