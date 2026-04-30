const Router = require('koa-router');
const { readJSON, writeJSON } = require('../models/database');

const router = new Router();
const ACCESS_CONTROL_FILE = 'accessControl.json';
const BLACKLIST_FILE = 'blacklist.json';
const WHITELIST_FILE = 'whitelist.json';

router.get('/rules', async (ctx) => {
  try {
    const rules = await readJSON(ACCESS_CONTROL_FILE);
    ctx.body = { success: true, data: rules };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { success: false, message: error.message };
  }
});

router.post('/rules', async (ctx) => {
  try {
    const rule = ctx.request.body;
    const rules = await readJSON(ACCESS_CONTROL_FILE);
    rule.id = Date.now().toString();
    rule.createdAt = new Date().toISOString();
    rules.push(rule);
    await writeJSON(ACCESS_CONTROL_FILE, rules);
    ctx.body = { success: true, data: rule };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { success: false, message: error.message };
  }
});

router.put('/rules/:id', async (ctx) => {
  try {
    const { id } = ctx.params;
    const updatedRule = ctx.request.body;
    const rules = await readJSON(ACCESS_CONTROL_FILE);
    const index = rules.findIndex(r => r.id === id);
    
    if (index === -1) {
      ctx.status = 404;
      ctx.body = { success: false, message: '规则不存在' };
      return;
    }
    
    rules[index] = { ...rules[index], ...updatedRule };
    await writeJSON(ACCESS_CONTROL_FILE, rules);
    ctx.body = { success: true, data: rules[index] };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { success: false, message: error.message };
  }
});

router.delete('/rules/:id', async (ctx) => {
  try {
    const { id } = ctx.params;
    const rules = await readJSON(ACCESS_CONTROL_FILE);
    const filteredRules = rules.filter(r => r.id !== id);
    
    if (filteredRules.length === rules.length) {
      ctx.status = 404;
      ctx.body = { success: false, message: '规则不存在' };
      return;
    }
    
    await writeJSON(ACCESS_CONTROL_FILE, filteredRules);
    ctx.body = { success: true, message: '删除成功' };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { success: false, message: error.message };
  }
});

router.get('/blacklist', async (ctx) => {
  try {
    const blacklist = await readJSON(BLACKLIST_FILE);
    ctx.body = { success: true, data: blacklist };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { success: false, message: error.message };
  }
});

router.post('/blacklist', async (ctx) => {
  try {
    const item = ctx.request.body;
    const blacklist = await readJSON(BLACKLIST_FILE);
    item.id = Date.now().toString();
    item.createdAt = new Date().toISOString();
    blacklist.push(item);
    await writeJSON(BLACKLIST_FILE, blacklist);
    ctx.body = { success: true, data: item };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { success: false, message: error.message };
  }
});

router.delete('/blacklist/:id', async (ctx) => {
  try {
    const { id } = ctx.params;
    const blacklist = await readJSON(BLACKLIST_FILE);
    const filteredList = blacklist.filter(item => item.id !== id);
    
    if (filteredList.length === blacklist.length) {
      ctx.status = 404;
      ctx.body = { success: false, message: '项目不存在' };
      return;
    }
    
    await writeJSON(BLACKLIST_FILE, filteredList);
    ctx.body = { success: true, message: '删除成功' };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { success: false, message: error.message };
  }
});

router.get('/whitelist', async (ctx) => {
  try {
    const whitelist = await readJSON(WHITELIST_FILE);
    ctx.body = { success: true, data: whitelist };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { success: false, message: error.message };
  }
});

router.post('/whitelist', async (ctx) => {
  try {
    const item = ctx.request.body;
    const whitelist = await readJSON(WHITELIST_FILE);
    item.id = Date.now().toString();
    item.createdAt = new Date().toISOString();
    whitelist.push(item);
    await writeJSON(WHITELIST_FILE, whitelist);
    ctx.body = { success: true, data: item };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { success: false, message: error.message };
  }
});

router.delete('/whitelist/:id', async (ctx) => {
  try {
    const { id } = ctx.params;
    const whitelist = await readJSON(WHITELIST_FILE);
    const filteredList = whitelist.filter(item => item.id !== id);
    
    if (filteredList.length === whitelist.length) {
      ctx.status = 404;
      ctx.body = { success: false, message: '项目不存在' };
      return;
    }
    
    await writeJSON(WHITELIST_FILE, filteredList);
    ctx.body = { success: true, message: '删除成功' };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { success: false, message: error.message };
  }
});

module.exports = router;
