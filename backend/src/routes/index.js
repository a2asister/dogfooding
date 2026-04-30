const Router = require('koa-router');
const router = new Router();
const db = require('../../data/database');
const logger = require('../utils/logger');

router.prefix('/api');

router.get('/overview', async (ctx) => {
  const totalAnimals = db.animals.length;
  const healthyAnimals = db.animals.filter(a => a.health >= 80).length;
  const totalVenues = db.venues.length;
  const openVenues = db.venues.filter(v => v.status === '开放').length;
  const totalVisitors = db.crowds[0]?.totalVisitors || 0;
  const pendingAlerts = db.alerts.filter(a => a.status === '未处理').length;
  const securityOnline = db.security.filter(s => s.status === '在线').length;
  const securityTotal = db.security.length;

  ctx.body = {
    success: true,
    data: {
      animals: { total: totalAnimals, healthy: healthyAnimals },
      venues: { total: totalVenues, open: openVenues },
      visitors: totalVisitors,
      alerts: { pending: pendingAlerts },
      security: { online: securityOnline, total: securityTotal }
    }
  };
});

router.get('/animals', async (ctx) => {
  ctx.body = {
    success: true,
    data: db.animals
  };
});

router.get('/animals/:id', async (ctx) => {
  const { id } = ctx.params;
  const animal = db.animals.find(a => a.id === id);
  if (!animal) {
    ctx.status = 404;
    ctx.body = { success: false, message: '动物不存在' };
    return;
  }
  ctx.body = { success: true, data: animal };
});

router.post('/animals', async (ctx) => {
  const animalData = ctx.request.body;
  const newAnimal = {
    id: db.generateId(),
    ...animalData,
    lastCheck: new Date().toISOString()
  };
  db.animals.push(newAnimal);
  db.saveAll();
  logger.operation('system', '添加动物', { name: newAnimal.name });
  ctx.body = { success: true, data: newAnimal };
});

router.put('/animals/:id', async (ctx) => {
  const { id } = ctx.params;
  const updateData = ctx.request.body;
  const index = db.animals.findIndex(a => a.id === id);
  
  if (index === -1) {
    ctx.status = 404;
    ctx.body = { success: false, message: '动物不存在' };
    return;
  }
  
  db.animals[index] = { ...db.animals[index], ...updateData };
  db.saveAll();
  logger.operation('system', '更新动物信息', { id, ...updateData });
  ctx.body = { success: true, data: db.animals[index] };
});

router.delete('/animals/:id', async (ctx) => {
  const { id } = ctx.params;
  const index = db.animals.findIndex(a => a.id === id);
  
  if (index === -1) {
    ctx.status = 404;
    ctx.body = { success: false, message: '动物不存在' };
    return;
  }
  
  const deleted = db.animals.splice(index, 1)[0];
  db.saveAll();
  logger.operation('system', '删除动物', { id, name: deleted.name });
  ctx.body = { success: true, message: '删除成功' };
});

router.get('/venues', async (ctx) => {
  ctx.body = {
    success: true,
    data: db.venues
  };
});

router.get('/venues/:id', async (ctx) => {
  const { id } = ctx.params;
  const venue = db.venues.find(v => v.id === id);
  if (!venue) {
    ctx.status = 404;
    ctx.body = { success: false, message: '场馆不存在' };
    return;
  }
  ctx.body = { success: true, data: venue };
});

router.get('/crowds', async (ctx) => {
  ctx.body = {
    success: true,
    data: db.crowds[0] || {}
  };
});

router.get('/environments', async (ctx) => {
  ctx.body = {
    success: true,
    data: db.environments
  };
});

router.get('/environments/:venueId', async (ctx) => {
  const { venueId } = ctx.params;
  const env = db.environments.find(e => e.venueId === venueId);
  if (!env) {
    ctx.status = 404;
    ctx.body = { success: false, message: '环境数据不存在' };
    return;
  }
  ctx.body = { success: true, data: env };
});

router.get('/security', async (ctx) => {
  ctx.body = {
    success: true,
    data: db.security
  };
});

router.get('/devices', async (ctx) => {
  ctx.body = {
    success: true,
    data: db.devices
  };
});

router.get('/alerts', async (ctx) => {
  ctx.body = {
    success: true,
    data: db.alerts
  };
});

router.post('/alerts', async (ctx) => {
  const alertData = ctx.request.body;
  const newAlert = {
    id: db.generateId(),
    ...alertData,
    status: '未处理',
    createdAt: new Date().toISOString()
  };
  db.alerts.push(newAlert);
  db.saveAll();
  logger.warn(`新告警: ${newAlert.type} - ${newAlert.message}`);
  ctx.body = { success: true, data: newAlert };
});

router.put('/alerts/:id', async (ctx) => {
  const { id } = ctx.params;
  const { status, handlerId } = ctx.request.body;
  const index = db.alerts.findIndex(a => a.id === id);
  
  if (index === -1) {
    ctx.status = 404;
    ctx.body = { success: false, message: '告警不存在' };
    return;
  }
  
  db.alerts[index] = { 
    ...db.alerts[index], 
    status: status || db.alerts[index].status,
    handlerId: handlerId || db.alerts[index].handlerId,
    handledAt: new Date().toISOString()
  };
  db.saveAll();
  logger.operation('system', '处理告警', { id, status: db.alerts[index].status });
  ctx.body = { success: true, data: db.alerts[index] };
});

router.get('/users', async (ctx) => {
  const users = db.users.map(u => ({ ...u, password: undefined }));
  ctx.body = {
    success: true,
    data: users
  };
});

router.post('/login', async (ctx) => {
  const { username, password } = ctx.request.body;
  const user = db.users.find(u => u.username === username && u.password === password);
  
  if (!user) {
    ctx.status = 401;
    ctx.body = { success: false, message: '用户名或密码错误' };
    return;
  }
  
  const { password: _, ...userWithoutPassword } = user;
  logger.operation(user.id, '登录系统', { username });
  ctx.body = { success: true, data: userWithoutPassword };
});

router.get('/operation-logs', async (ctx) => {
  ctx.body = {
    success: true,
    data: db.operationLogs
  };
});

router.get('/feeding-records', async (ctx) => {
  ctx.body = {
    success: true,
    data: db.feedingRecords
  };
});

router.post('/feeding-records', async (ctx) => {
  const recordData = ctx.request.body;
  const newRecord = {
    id: db.generateId(),
    ...recordData,
    time: new Date().toISOString()
  };
  db.feedingRecords.push(newRecord);
  db.saveAll();
  logger.operation(recordData.feederId || 'system', '添加投喂记录', recordData);
  ctx.body = { success: true, data: newRecord };
});

router.get('/logs/:date?', async (ctx) => {
  const { date } = ctx.params;
  const logs = logger.getLogs(date);
  
  if (!logs) {
    ctx.body = { success: true, data: [] };
    return;
  }
  
  const logLines = logs.split('\n').filter(line => line.trim());
  const parsedLogs = logLines.map(line => {
    const match = line.match(/\[([^\]]+)\] \[([^\]]+)\] (.*)/);
    if (match) {
      return {
        timestamp: match[1],
        level: match[2],
        message: match[3]
      };
    }
    return { raw: line };
  });
  
  ctx.body = { success: true, data: parsedLogs };
});

module.exports = router;
