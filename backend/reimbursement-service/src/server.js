const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const cors = require('koa-cors');
const DataStore = require('@oa/data-store');

const app = new Koa();
const router = new Router();
const reimbursementStore = new DataStore('reimbursement-reimbursements');
const expenseItemStore = new DataStore('reimbursement-expense-items');
const approvalStore = new DataStore('reimbursement-approvals');

app.use(cors());
app.use(bodyParser());

router.get('/api/health', (ctx) => {
  ctx.body = { status: 'ok', service: 'reimbursement-service', timestamp: new Date().toISOString() };
});

router.get('/api/reimbursements', (ctx) => {
  const reimbursements = reimbursementStore.findAll();
  ctx.body = { success: true, data: reimbursements };
});

router.get('/api/reimbursements/:id', (ctx) => {
  const reimbursement = reimbursementStore.findById(ctx.params.id);
  if (!reimbursement) {
    ctx.status = 404;
    ctx.body = { success: false, message: 'Reimbursement not found' };
    return;
  }
  ctx.body = { success: true, data: reimbursement };
});

router.post('/api/reimbursements', (ctx) => {
  const reimbursement = reimbursementStore.create(ctx.request.body);
  ctx.status = 201;
  ctx.body = { success: true, data: reimbursement };
});

router.put('/api/reimbursements/:id', (ctx) => {
  const reimbursement = reimbursementStore.update(ctx.params.id, ctx.request.body);
  if (!reimbursement) {
    ctx.status = 404;
    ctx.body = { success: false, message: 'Reimbursement not found' };
    return;
  }
  ctx.body = { success: true, data: reimbursement };
});

router.delete('/api/reimbursements/:id', (ctx) => {
  const success = reimbursementStore.delete(ctx.params.id);
  if (!success) {
    ctx.status = 404;
    ctx.body = { success: false, message: 'Reimbursement not found' };
    return;
  }
  ctx.body = { success: true };
});

router.get('/api/expense-items', (ctx) => {
  const expenseItems = expenseItemStore.findAll();
  ctx.body = { success: true, data: expenseItems };
});

router.post('/api/expense-items', (ctx) => {
  const expenseItem = expenseItemStore.create(ctx.request.body);
  ctx.status = 201;
  ctx.body = { success: true, data: expenseItem };
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

const PORT = 3010;
app.listen(PORT, () => {
  console.log(`Reimbursement Service running on port ${PORT}`);
});
