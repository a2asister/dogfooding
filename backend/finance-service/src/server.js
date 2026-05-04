const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const cors = require('koa-cors');
const DataStore = require('@oa/data-store');

const app = new Koa();
const router = new Router();
const budgetStore = new DataStore('finance-budgets');
const expenseStore = new DataStore('finance-expenses');
const incomeStore = new DataStore('finance-incomes');

app.use(cors());
app.use(bodyParser());

router.get('/api/health', (ctx) => {
  ctx.body = { status: 'ok', service: 'finance-service', timestamp: new Date().toISOString() };
});

router.get('/api/budgets', (ctx) => {
  const budgets = budgetStore.findAll();
  ctx.body = { success: true, data: budgets };
});

router.get('/api/budgets/:id', (ctx) => {
  const budget = budgetStore.findById(ctx.params.id);
  if (!budget) {
    ctx.status = 404;
    ctx.body = { success: false, message: 'Budget not found' };
    return;
  }
  ctx.body = { success: true, data: budget };
});

router.post('/api/budgets', (ctx) => {
  const budget = budgetStore.create(ctx.request.body);
  ctx.status = 201;
  ctx.body = { success: true, data: budget };
});

router.put('/api/budgets/:id', (ctx) => {
  const budget = budgetStore.update(ctx.params.id, ctx.request.body);
  if (!budget) {
    ctx.status = 404;
    ctx.body = { success: false, message: 'Budget not found' };
    return;
  }
  ctx.body = { success: true, data: budget };
});

router.delete('/api/budgets/:id', (ctx) => {
  const success = budgetStore.delete(ctx.params.id);
  if (!success) {
    ctx.status = 404;
    ctx.body = { success: false, message: 'Budget not found' };
    return;
  }
  ctx.body = { success: true };
});

router.get('/api/expenses', (ctx) => {
  const expenses = expenseStore.findAll();
  ctx.body = { success: true, data: expenses };
});

router.post('/api/expenses', (ctx) => {
  const expense = expenseStore.create(ctx.request.body);
  ctx.status = 201;
  ctx.body = { success: true, data: expense };
});

router.get('/api/incomes', (ctx) => {
  const incomes = incomeStore.findAll();
  ctx.body = { success: true, data: incomes };
});

router.post('/api/incomes', (ctx) => {
  const income = incomeStore.create(ctx.request.body);
  ctx.status = 201;
  ctx.body = { success: true, data: income };
});

app.use(router.routes()).use(router.allowedMethods());

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`Finance Service running on port ${PORT}`);
});
