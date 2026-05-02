const Koa = require('koa');
const Router = require('koa-router');
const { koaBody } = require('koa-body');
const cors = require('koa-cors');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = new Koa();
const router = new Router();
const PORT = 3125;

app.use(cors());
app.use(koaBody());

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

function readData(file) {
  const filePath = path.join(dataDir, file);
  if (!fs.existsSync(filePath)) {
    const initialData = {
      members: [],
      points: [],
      stores: [],
      giftBoxes: [],
      tastingEvents: [],
      inventory: [],
      pointExchanges: [],
      storeActivities: []
    };
    fs.writeFileSync(filePath, JSON.stringify(initialData, null, 2));
    return initialData;
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeData(file, data) {
  const filePath = path.join(dataDir, file);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

const dataFile = 'database.json';

// 会员体系API
router.get('/api/members', async (ctx) => {
  const data = readData(dataFile);
  ctx.body = { success: true, data: data.members };
});

router.post('/api/members', async (ctx) => {
  const data = readData(dataFile);
  const member = {
    id: uuidv4(),
    ...ctx.request.body,
    totalPoints: 0,
    currentPoints: 0,
    level: '普通会员',
    joinDate: new Date().toISOString()
  };
  data.members.push(member);
  writeData(dataFile, data);
  ctx.body = { success: true, data: member };
});

router.put('/api/members/:id', async (ctx) => {
  const data = readData(dataFile);
  const index = data.members.findIndex(m => m.id === ctx.params.id);
  if (index !== -1) {
    data.members[index] = { ...data.members[index], ...ctx.request.body };
    writeData(dataFile, data);
    ctx.body = { success: true, data: data.members[index] };
  } else {
    ctx.body = { success: false, message: '会员不存在' };
  }
});

router.delete('/api/members/:id', async (ctx) => {
  const data = readData(dataFile);
  const index = data.members.findIndex(m => m.id === ctx.params.id);
  if (index !== -1) {
    data.members.splice(index, 1);
    writeData(dataFile, data);
    ctx.body = { success: true };
  } else {
    ctx.body = { success: false, message: '会员不存在' };
  }
});

// 积分兑换API
router.get('/api/points', async (ctx) => {
  const data = readData(dataFile);
  ctx.body = { success: true, data: data.points };
});

router.get('/api/point-exchanges', async (ctx) => {
  const data = readData(dataFile);
  ctx.body = { success: true, data: data.pointExchanges };
});

router.post('/api/point-exchanges', async (ctx) => {
  const data = readData(dataFile);
  const { memberId, giftBoxId, pointsUsed } = ctx.request.body;
  
  const memberIndex = data.members.findIndex(m => m.id === memberId);
  const giftBox = data.giftBoxes.find(g => g.id === giftBoxId);
  
  if (memberIndex !== -1 && giftBox && data.members[memberIndex].currentPoints >= pointsUsed) {
    const exchange = {
      id: uuidv4(),
      memberId,
      giftBoxId,
      pointsUsed,
      exchangeDate: new Date().toISOString(),
      status: '待处理'
    };
    
    data.members[memberIndex].currentPoints -= pointsUsed;
    data.pointExchanges.push(exchange);
    
    writeData(dataFile, data);
    ctx.body = { success: true, data: exchange };
  } else {
    ctx.body = { success: false, message: '积分不足或兑换项不存在' };
  }
});

// 线下门店联动API
router.get('/api/stores', async (ctx) => {
  const data = readData(dataFile);
  ctx.body = { success: true, data: data.stores };
});

router.post('/api/stores', async (ctx) => {
  const data = readData(dataFile);
  const store = {
    id: uuidv4(),
    ...ctx.request.body,
    createDate: new Date().toISOString()
  };
  data.stores.push(store);
  writeData(dataFile, data);
  ctx.body = { success: true, data: store };
});

router.put('/api/stores/:id', async (ctx) => {
  const data = readData(dataFile);
  const index = data.stores.findIndex(s => s.id === ctx.params.id);
  if (index !== -1) {
    data.stores[index] = { ...data.stores[index], ...ctx.request.body };
    writeData(dataFile, data);
    ctx.body = { success: true, data: data.stores[index] };
  } else {
    ctx.body = { success: false, message: '门店不存在' };
  }
});

router.delete('/api/stores/:id', async (ctx) => {
  const data = readData(dataFile);
  const index = data.stores.findIndex(s => s.id === ctx.params.id);
  if (index !== -1) {
    data.stores.splice(index, 1);
    writeData(dataFile, data);
    ctx.body = { success: true };
  } else {
    ctx.body = { success: false, message: '门店不存在' };
  }
});

router.get('/api/store-activities', async (ctx) => {
  const data = readData(dataFile);
  ctx.body = { success: true, data: data.storeActivities };
});

// 定制礼盒API
router.get('/api/gift-boxes', async (ctx) => {
  const data = readData(dataFile);
  ctx.body = { success: true, data: data.giftBoxes };
});

router.post('/api/gift-boxes', async (ctx) => {
  const data = readData(dataFile);
  const giftBox = {
    id: uuidv4(),
    ...ctx.request.body,
    pointsRequired: ctx.request.body.pointsRequired || 0,
    price: ctx.request.body.price || 0,
    createDate: new Date().toISOString()
  };
  data.giftBoxes.push(giftBox);
  writeData(dataFile, data);
  ctx.body = { success: true, data: giftBox };
});

router.put('/api/gift-boxes/:id', async (ctx) => {
  const data = readData(dataFile);
  const index = data.giftBoxes.findIndex(g => g.id === ctx.params.id);
  if (index !== -1) {
    data.giftBoxes[index] = { ...data.giftBoxes[index], ...ctx.request.body };
    writeData(dataFile, data);
    ctx.body = { success: true, data: data.giftBoxes[index] };
  } else {
    ctx.body = { success: false, message: '礼盒不存在' };
  }
});

router.delete('/api/gift-boxes/:id', async (ctx) => {
  const data = readData(dataFile);
  const index = data.giftBoxes.findIndex(g => g.id === ctx.params.id);
  if (index !== -1) {
    data.giftBoxes.splice(index, 1);
    writeData(dataFile, data);
    ctx.body = { success: true };
  } else {
    ctx.body = { success: false, message: '礼盒不存在' };
  }
});

// 品鉴活动API
router.get('/api/tasting-events', async (ctx) => {
  const data = readData(dataFile);
  ctx.body = { success: true, data: data.tastingEvents };
});

router.post('/api/tasting-events', async (ctx) => {
  const data = readData(dataFile);
  const event = {
    id: uuidv4(),
    ...ctx.request.body,
    participants: [],
    createDate: new Date().toISOString()
  };
  data.tastingEvents.push(event);
  writeData(dataFile, data);
  ctx.body = { success: true, data: event };
});

router.put('/api/tasting-events/:id', async (ctx) => {
  const data = readData(dataFile);
  const index = data.tastingEvents.findIndex(e => e.id === ctx.params.id);
  if (index !== -1) {
    data.tastingEvents[index] = { ...data.tastingEvents[index], ...ctx.request.body };
    writeData(dataFile, data);
    ctx.body = { success: true, data: data.tastingEvents[index] };
  } else {
    ctx.body = { success: false, message: '活动不存在' };
  }
});

router.delete('/api/tasting-events/:id', async (ctx) => {
  const data = readData(dataFile);
  const index = data.tastingEvents.findIndex(e => e.id === ctx.params.id);
  if (index !== -1) {
    data.tastingEvents.splice(index, 1);
    writeData(dataFile, data);
    ctx.body = { success: true };
  } else {
    ctx.body = { success: false, message: '活动不存在' };
  }
});

router.post('/api/tasting-events/:id/join', async (ctx) => {
  const data = readData(dataFile);
  const { memberId } = ctx.request.body;
  const eventIndex = data.tastingEvents.findIndex(e => e.id === ctx.params.id);
  
  if (eventIndex !== -1) {
    const event = data.tastingEvents[eventIndex];
    if (!event.participants.includes(memberId)) {
      event.participants.push(memberId);
      writeData(dataFile, data);
      ctx.body = { success: true, data: event };
    } else {
      ctx.body = { success: false, message: '已报名参加此活动' };
    }
  } else {
    ctx.body = { success: false, message: '活动不存在' };
  }
});

// 库存管控API
router.get('/api/inventory', async (ctx) => {
  const data = readData(dataFile);
  ctx.body = { success: true, data: data.inventory };
});

router.post('/api/inventory', async (ctx) => {
  const data = readData(dataFile);
  const item = {
    id: uuidv4(),
    ...ctx.request.body,
    updateDate: new Date().toISOString()
  };
  data.inventory.push(item);
  writeData(dataFile, data);
  ctx.body = { success: true, data: item };
});

router.put('/api/inventory/:id', async (ctx) => {
  const data = readData(dataFile);
  const index = data.inventory.findIndex(i => i.id === ctx.params.id);
  if (index !== -1) {
    data.inventory[index] = { ...data.inventory[index], ...ctx.request.body, updateDate: new Date().toISOString() };
    writeData(dataFile, data);
    ctx.body = { success: true, data: data.inventory[index] };
  } else {
    ctx.body = { success: false, message: '库存项不存在' };
  }
});

router.delete('/api/inventory/:id', async (ctx) => {
  const data = readData(dataFile);
  const index = data.inventory.findIndex(i => i.id === ctx.params.id);
  if (index !== -1) {
    data.inventory.splice(index, 1);
    writeData(dataFile, data);
    ctx.body = { success: true };
  } else {
    ctx.body = { success: false, message: '库存项不存在' };
  }
});

app.use(router.routes()).use(router.allowedMethods());

app.listen(PORT, () => {
  console.log(`私域运营中台后端服务已启动，端口: ${PORT}`);
  console.log(`API地址: http://localhost:${PORT}/api/`);
});
