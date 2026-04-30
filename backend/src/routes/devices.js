const Router = require('koa-router');
const { readJSON, writeJSON } = require('../models/database');

const router = new Router();
const DEVICES_FILE = 'devices.json';

router.get('/', async (ctx) => {
  try {
    const devices = await readJSON(DEVICES_FILE);
    const devicesWithStatus = devices.map(device => ({
      ...device,
      online: Math.random() > 0.3
    }));
    ctx.body = { success: true, data: devicesWithStatus };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { success: false, message: error.message };
  }
});

router.get('/scan', async (ctx) => {
  try {
    const mockDevices = [
      {
        id: '1',
        mac: 'AA:BB:CC:DD:EE:01',
        ip: '192.168.1.101',
        name: '客厅电视',
        note: '小米智能电视',
        type: '电视',
        online: true,
        firstSeen: new Date().toISOString()
      },
      {
        id: '2',
        mac: 'AA:BB:CC:DD:EE:02',
        ip: '192.168.1.102',
        name: '卧室手机',
        note: 'iPhone 15',
        type: '手机',
        online: true,
        firstSeen: new Date().toISOString()
      },
      {
        id: '3',
        mac: 'AA:BB:CC:DD:EE:03',
        ip: '192.168.1.103',
        name: '书房电脑',
        note: '工作用台式机',
        type: '电脑',
        online: false,
        firstSeen: new Date().toISOString()
      }
    ];
    
    const existingDevices = await readJSON(DEVICES_FILE);
    const mergedDevices = [...existingDevices];
    
    mockDevices.forEach(mockDevice => {
      const existingIndex = mergedDevices.findIndex(d => d.mac === mockDevice.mac);
      if (existingIndex === -1) {
        mergedDevices.push(mockDevice);
      }
    });
    
    await writeJSON(DEVICES_FILE, mergedDevices);
    ctx.body = { success: true, data: mergedDevices, message: '扫描完成' };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { success: false, message: error.message };
  }
});

router.post('/', async (ctx) => {
  try {
    const device = ctx.request.body;
    const devices = await readJSON(DEVICES_FILE);
    device.id = Date.now().toString();
    device.firstSeen = new Date().toISOString();
    devices.push(device);
    await writeJSON(DEVICES_FILE, devices);
    ctx.body = { success: true, data: device };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { success: false, message: error.message };
  }
});

router.put('/:id', async (ctx) => {
  try {
    const { id } = ctx.params;
    const updatedDevice = ctx.request.body;
    const devices = await readJSON(DEVICES_FILE);
    const index = devices.findIndex(d => d.id === id);
    
    if (index === -1) {
      ctx.status = 404;
      ctx.body = { success: false, message: '设备不存在' };
      return;
    }
    
    devices[index] = { ...devices[index], ...updatedDevice };
    await writeJSON(DEVICES_FILE, devices);
    ctx.body = { success: true, data: devices[index] };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { success: false, message: error.message };
  }
});

router.delete('/:id', async (ctx) => {
  try {
    const { id } = ctx.params;
    const devices = await readJSON(DEVICES_FILE);
    const filteredDevices = devices.filter(d => d.id !== id);
    
    if (filteredDevices.length === devices.length) {
      ctx.status = 404;
      ctx.body = { success: false, message: '设备不存在' };
      return;
    }
    
    await writeJSON(DEVICES_FILE, filteredDevices);
    ctx.body = { success: true, message: '删除成功' };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { success: false, message: error.message };
  }
});

module.exports = router;
