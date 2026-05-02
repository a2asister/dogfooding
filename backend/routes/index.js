const Router = require('koa-router');
const router = new Router();
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DATA_DIR = path.join(__dirname, '../data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const initData = () => {
  const files = {
    suppliers: [],
    qualifications: [],
    ratings: [],
    contracts: [],
    settlements: [],
    tickets: []
  };

  Object.keys(files).forEach(file => {
    const filePath = path.join(DATA_DIR, `${file}.json`);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(files[file], null, 2));
    }
  });
};

initData();

const readData = (fileName) => {
  const filePath = path.join(DATA_DIR, `${fileName}.json`);
  const data = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(data);
};

const writeData = (fileName, data) => {
  const filePath = path.join(DATA_DIR, `${fileName}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

router.get('/', async (ctx) => {
  ctx.body = { message: '第三方服务商管理中台 API 服务' };
});

router.get('/api/suppliers', async (ctx) => {
  const suppliers = readData('suppliers');
  ctx.body = { success: true, data: suppliers };
});

router.post('/api/suppliers', async (ctx) => {
  const suppliers = readData('suppliers');
  const newSupplier = {
    id: uuidv4(),
    ...ctx.request.body,
    createdAt: new Date().toISOString(),
    status: 'pending'
  };
  suppliers.push(newSupplier);
  writeData('suppliers', suppliers);
  ctx.body = { success: true, data: newSupplier };
});

router.put('/api/suppliers/:id', async (ctx) => {
  const suppliers = readData('suppliers');
  const index = suppliers.findIndex(s => s.id === ctx.params.id);
  if (index === -1) {
    ctx.status = 404;
    ctx.body = { success: false, message: '供应商不存在' };
    return;
  }
  suppliers[index] = { ...suppliers[index], ...ctx.request.body, updatedAt: new Date().toISOString() };
  writeData('suppliers', suppliers);
  ctx.body = { success: true, data: suppliers[index] };
});

router.delete('/api/suppliers/:id', async (ctx) => {
  const suppliers = readData('suppliers');
  const filtered = suppliers.filter(s => s.id !== ctx.params.id);
  if (filtered.length === suppliers.length) {
    ctx.status = 404;
    ctx.body = { success: false, message: '供应商不存在' };
    return;
  }
  writeData('suppliers', filtered);
  ctx.body = { success: true, message: '删除成功' };
});

router.get('/api/qualifications', async (ctx) => {
  const qualifications = readData('qualifications');
  ctx.body = { success: true, data: qualifications };
});

router.post('/api/qualifications', async (ctx) => {
  const qualifications = readData('qualifications');
  const newQualification = {
    id: uuidv4(),
    ...ctx.request.body,
    createdAt: new Date().toISOString(),
    status: 'pending'
  };
  qualifications.push(newQualification);
  writeData('qualifications', qualifications);
  ctx.body = { success: true, data: newQualification };
});

router.put('/api/qualifications/:id', async (ctx) => {
  const qualifications = readData('qualifications');
  const index = qualifications.findIndex(q => q.id === ctx.params.id);
  if (index === -1) {
    ctx.status = 404;
    ctx.body = { success: false, message: '资质审核记录不存在' };
    return;
  }
  qualifications[index] = { ...qualifications[index], ...ctx.request.body, updatedAt: new Date().toISOString() };
  writeData('qualifications', qualifications);
  ctx.body = { success: true, data: qualifications[index] };
});

router.get('/api/ratings', async (ctx) => {
  const ratings = readData('ratings');
  ctx.body = { success: true, data: ratings };
});

router.post('/api/ratings', async (ctx) => {
  const ratings = readData('ratings');
  const newRating = {
    id: uuidv4(),
    ...ctx.request.body,
    createdAt: new Date().toISOString()
  };
  ratings.push(newRating);
  writeData('ratings', ratings);
  ctx.body = { success: true, data: newRating };
});

router.get('/api/contracts', async (ctx) => {
  const contracts = readData('contracts');
  ctx.body = { success: true, data: contracts };
});

router.post('/api/contracts', async (ctx) => {
  const contracts = readData('contracts');
  const newContract = {
    id: uuidv4(),
    ...ctx.request.body,
    createdAt: new Date().toISOString(),
    status: 'active'
  };
  contracts.push(newContract);
  writeData('contracts', contracts);
  ctx.body = { success: true, data: newContract };
});

router.put('/api/contracts/:id', async (ctx) => {
  const contracts = readData('contracts');
  const index = contracts.findIndex(c => c.id === ctx.params.id);
  if (index === -1) {
    ctx.status = 404;
    ctx.body = { success: false, message: '合同不存在' };
    return;
  }
  contracts[index] = { ...contracts[index], ...ctx.request.body, updatedAt: new Date().toISOString() };
  writeData('contracts', contracts);
  ctx.body = { success: true, data: contracts[index] };
});

router.get('/api/settlements', async (ctx) => {
  const settlements = readData('settlements');
  ctx.body = { success: true, data: settlements };
});

router.post('/api/settlements', async (ctx) => {
  const settlements = readData('settlements');
  const newSettlement = {
    id: uuidv4(),
    ...ctx.request.body,
    createdAt: new Date().toISOString(),
    status: 'pending'
  };
  settlements.push(newSettlement);
  writeData('settlements', settlements);
  ctx.body = { success: true, data: newSettlement };
});

router.put('/api/settlements/:id', async (ctx) => {
  const settlements = readData('settlements');
  const index = settlements.findIndex(s => s.id === ctx.params.id);
  if (index === -1) {
    ctx.status = 404;
    ctx.body = { success: false, message: '结算记录不存在' };
    return;
  }
  settlements[index] = { ...settlements[index], ...ctx.request.body, updatedAt: new Date().toISOString() };
  writeData('settlements', settlements);
  ctx.body = { success: true, data: settlements[index] };
});

router.get('/api/tickets', async (ctx) => {
  const tickets = readData('tickets');
  ctx.body = { success: true, data: tickets };
});

router.post('/api/tickets', async (ctx) => {
  const tickets = readData('tickets');
  const newTicket = {
    id: uuidv4(),
    ...ctx.request.body,
    createdAt: new Date().toISOString(),
    status: 'open'
  };
  tickets.push(newTicket);
  writeData('tickets', tickets);
  ctx.body = { success: true, data: newTicket };
});

router.put('/api/tickets/:id', async (ctx) => {
  const tickets = readData('tickets');
  const index = tickets.findIndex(t => t.id === ctx.params.id);
  if (index === -1) {
    ctx.status = 404;
    ctx.body = { success: false, message: '工单不存在' };
    return;
  }
  tickets[index] = { ...tickets[index], ...ctx.request.body, updatedAt: new Date().toISOString() };
  writeData('tickets', tickets);
  ctx.body = { success: true, data: tickets[index] };
});

module.exports = router;
