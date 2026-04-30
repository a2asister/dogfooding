const Router = require('koa-router');
const { readJSON, writeJSON } = require('../models/database');

const router = new Router();
const SETTINGS_FILE = 'settings.json';

router.get('/', async (ctx) => {
  try {
    const settings = await readJSON(SETTINGS_FILE);
    const defaultSettings = {
      router: {
        ssid: 'HomeNetwork',
        password: '********',
        channel: 6,
        mode: '2.4G',
        ip: '192.168.1.1',
        subnetMask: '255.255.255.0'
      },
      dhcp: {
        enabled: true,
        startIp: '192.168.1.100',
        endIp: '192.168.1.200',
        leaseTime: 86400
      },
      firewall: {
        enabled: true,
        logEnabled: true
      },
      alerts: {
        enabled: true,
        email: '',
        newDeviceAlert: true,
        anomalyAlert: true
      }
    };
    
    const mergedSettings = { ...defaultSettings, ...settings };
    ctx.body = { success: true, data: mergedSettings };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { success: false, message: error.message };
  }
});

router.put('/', async (ctx) => {
  try {
    const newSettings = ctx.request.body;
    const existingSettings = await readJSON(SETTINGS_FILE);
    const updatedSettings = { ...existingSettings, ...newSettings };
    await writeJSON(SETTINGS_FILE, updatedSettings);
    ctx.body = { success: true, data: updatedSettings };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { success: false, message: error.message };
  }
});

router.get('/router', async (ctx) => {
  try {
    const settings = await readJSON(SETTINGS_FILE);
    const routerSettings = settings.router || {
      ssid: 'HomeNetwork',
      password: '********',
      channel: 6,
      mode: '2.4G',
      ip: '192.168.1.1',
      subnetMask: '255.255.255.0'
    };
    ctx.body = { success: true, data: routerSettings };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { success: false, message: error.message };
  }
});

router.put('/router', async (ctx) => {
  try {
    const routerSettings = ctx.request.body;
    const settings = await readJSON(SETTINGS_FILE);
    settings.router = { ...settings.router, ...routerSettings };
    await writeJSON(SETTINGS_FILE, settings);
    ctx.body = { success: true, data: settings.router };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { success: false, message: error.message };
  }
});

router.get('/dhcp', async (ctx) => {
  try {
    const settings = await readJSON(SETTINGS_FILE);
    const dhcpSettings = settings.dhcp || {
      enabled: true,
      startIp: '192.168.1.100',
      endIp: '192.168.1.200',
      leaseTime: 86400
    };
    ctx.body = { success: true, data: dhcpSettings };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { success: false, message: error.message };
  }
});

router.put('/dhcp', async (ctx) => {
  try {
    const dhcpSettings = ctx.request.body;
    const settings = await readJSON(SETTINGS_FILE);
    settings.dhcp = { ...settings.dhcp, ...dhcpSettings };
    await writeJSON(SETTINGS_FILE, settings);
    ctx.body = { success: true, data: settings.dhcp };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { success: false, message: error.message };
  }
});

module.exports = router;
