const Router = require('koa-router');
const { readJSON, writeJSON } = require('../models/database');

const router = new Router();
const GUEST_NETWORK_FILE = 'guestNetwork.json';

router.get('/', async (ctx) => {
  try {
    const guestNetworks = await readJSON(GUEST_NETWORK_FILE);
    const activeNetworks = guestNetworks.map(network => {
      const now = new Date();
      const expiresAt = new Date(network.expiresAt);
      return {
        ...network,
        active: now < expiresAt
      };
    });
    ctx.body = { success: true, data: activeNetworks };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { success: false, message: error.message };
  }
});

router.post('/', async (ctx) => {
  try {
    const network = ctx.request.body;
    const guestNetworks = await readJSON(GUEST_NETWORK_FILE);
    
    network.id = Date.now().toString();
    network.createdAt = new Date().toISOString();
    
    if (!network.expiresAt) {
      const defaultExpiry = new Date();
      defaultExpiry.setHours(defaultExpiry.getHours() + (network.duration || 24));
      network.expiresAt = defaultExpiry.toISOString();
    }
    
    guestNetworks.push(network);
    await writeJSON(GUEST_NETWORK_FILE, guestNetworks);
    ctx.body = { success: true, data: network };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { success: false, message: error.message };
  }
});

router.put('/:id', async (ctx) => {
  try {
    const { id } = ctx.params;
    const updatedNetwork = ctx.request.body;
    const guestNetworks = await readJSON(GUEST_NETWORK_FILE);
    const index = guestNetworks.findIndex(n => n.id === id);
    
    if (index === -1) {
      ctx.status = 404;
      ctx.body = { success: false, message: '访客网络不存在' };
      return;
    }
    
    guestNetworks[index] = { ...guestNetworks[index], ...updatedNetwork };
    await writeJSON(GUEST_NETWORK_FILE, guestNetworks);
    ctx.body = { success: true, data: guestNetworks[index] };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { success: false, message: error.message };
  }
});

router.delete('/:id', async (ctx) => {
  try {
    const { id } = ctx.params;
    const guestNetworks = await readJSON(GUEST_NETWORK_FILE);
    const filteredNetworks = guestNetworks.filter(n => n.id !== id);
    
    if (filteredNetworks.length === guestNetworks.length) {
      ctx.status = 404;
      ctx.body = { success: false, message: '访客网络不存在' };
      return;
    }
    
    await writeJSON(GUEST_NETWORK_FILE, filteredNetworks);
    ctx.body = { success: true, message: '删除成功' };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { success: false, message: error.message };
  }
});

router.post('/:id/extend', async (ctx) => {
  try {
    const { id } = ctx.params;
    const { hours = 24 } = ctx.request.body;
    const guestNetworks = await readJSON(GUEST_NETWORK_FILE);
    const index = guestNetworks.findIndex(n => n.id === id);
    
    if (index === -1) {
      ctx.status = 404;
      ctx.body = { success: false, message: '访客网络不存在' };
      return;
    }
    
    const currentExpiry = new Date(guestNetworks[index].expiresAt);
    currentExpiry.setHours(currentExpiry.getHours() + hours);
    guestNetworks[index].expiresAt = currentExpiry.toISOString();
    
    await writeJSON(GUEST_NETWORK_FILE, guestNetworks);
    ctx.body = { success: true, data: guestNetworks[index] };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { success: false, message: error.message };
  }
});

module.exports = router;
