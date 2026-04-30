const Router = require('koa-router');
const { readJSON, writeJSON } = require('../models/database');

const router = new Router();
const ALERTS_FILE = 'alerts.json';

router.get('/', async (ctx) => {
  try {
    const { read = false } = ctx.query;
    let alerts = await readJSON(ALERTS_FILE);
    
    if (read !== undefined) {
      const isRead = read === 'true';
      alerts = alerts.filter(alert => alert.read === isRead);
    }
    
    alerts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    ctx.body = { success: true, data: alerts };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { success: false, message: error.message };
  }
});

router.get('/unread-count', async (ctx) => {
  try {
    const alerts = await readJSON(ALERTS_FILE);
    const unreadCount = alerts.filter(alert => !alert.read).length;
    ctx.body = { success: true, data: { count: unreadCount } };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { success: false, message: error.message };
  }
});

router.post('/', async (ctx) => {
  try {
    const alert = ctx.request.body;
    const alerts = await readJSON(ALERTS_FILE);
    
    alert.id = Date.now().toString();
    alert.timestamp = new Date().toISOString();
    alert.read = false;
    
    alerts.push(alert);
    await writeJSON(ALERTS_FILE, alerts);
    ctx.body = { success: true, data: alert };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { success: false, message: error.message };
  }
});

router.put('/:id/read', async (ctx) => {
  try {
    const { id } = ctx.params;
    const alerts = await readJSON(ALERTS_FILE);
    const index = alerts.findIndex(a => a.id === id);
    
    if (index === -1) {
      ctx.status = 404;
      ctx.body = { success: false, message: '告警不存在' };
      return;
    }
    
    alerts[index].read = true;
    await writeJSON(ALERTS_FILE, alerts);
    ctx.body = { success: true, data: alerts[index] };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { success: false, message: error.message };
  }
});

router.put('/read-all', async (ctx) => {
  try {
    const alerts = await readJSON(ALERTS_FILE);
    alerts.forEach(alert => {
      alert.read = true;
    });
    await writeJSON(ALERTS_FILE, alerts);
    ctx.body = { success: true, message: '所有告警已标记为已读' };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { success: false, message: error.message };
  }
});

router.delete('/:id', async (ctx) => {
  try {
    const { id } = ctx.params;
    const alerts = await readJSON(ALERTS_FILE);
    const filteredAlerts = alerts.filter(a => a.id !== id);
    
    if (filteredAlerts.length === alerts.length) {
      ctx.status = 404;
      ctx.body = { success: false, message: '告警不存在' };
      return;
    }
    
    await writeJSON(ALERTS_FILE, filteredAlerts);
    ctx.body = { success: true, message: '删除成功' };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { success: false, message: error.message };
  }
});

router.post('/test', async (ctx) => {
  try {
    const alerts = await readJSON(ALERTS_FILE);
    const testAlert = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      type: 'anomaly',
      title: '测试告警',
      message: '这是一条测试告警消息，用于验证告警系统是否正常工作。',
      read: false,
      device: {
        id: 'test-1',
        name: '测试设备',
        ip: '192.168.1.99'
      }
    };
    
    alerts.push(testAlert);
    await writeJSON(ALERTS_FILE, alerts);
    ctx.body = { success: true, data: testAlert };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { success: false, message: error.message };
  }
});

module.exports = router;
