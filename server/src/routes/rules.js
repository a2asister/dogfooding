const Router = require('koa-router');
const { readJsonFile, writeJsonFile, generateId } = require('../utils/data-store');

const router = new Router();
const RULES_FILE = 'rules.json';

router.get('/', async (ctx) => {
  const { category, enabled, search } = ctx.query;
  const data = readJsonFile(RULES_FILE);
  let rules = data.rules || [];

  if (category) {
    rules = rules.filter(r => r.category === category);
  }
  if (enabled !== undefined) {
    rules = rules.filter(r => r.enabled === (enabled === 'true'));
  }
  if (search) {
    const searchLower = search.toLowerCase();
    rules = rules.filter(r => 
      r.name.toLowerCase().includes(searchLower) ||
      r.description.toLowerCase().includes(searchLower)
    );
  }

  ctx.body = {
    success: true,
    data: rules
  };
});

router.get('/:id', async (ctx) => {
  const { id } = ctx.params;
  const data = readJsonFile(RULES_FILE);
  const rule = (data.rules || []).find(r => r.id === id);

  if (!rule) {
    ctx.status = 404;
    ctx.body = { success: false, message: '规则不存在' };
    return;
  }

  ctx.body = {
    success: true,
    data: rule
  };
});

router.post('/', async (ctx) => {
  const { name, category, description, keywords, riskLevel } = ctx.request.body;
  const data = readJsonFile(RULES_FILE);
  
  const newRule = {
    id: generateId(),
    name,
    category,
    description,
    keywords: keywords || [],
    riskLevel: riskLevel || 'medium',
    enabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  if (!data.rules) data.rules = [];
  data.rules.unshift(newRule);
  writeJsonFile(RULES_FILE, data);

  ctx.body = {
    success: true,
    data: newRule
  };
});

router.put('/:id', async (ctx) => {
  const { id } = ctx.params;
  const { name, category, description, keywords, riskLevel, enabled } = ctx.request.body;
  const data = readJsonFile(RULES_FILE);
  const rules = data.rules || [];
  const index = rules.findIndex(r => r.id === id);

  if (index === -1) {
    ctx.status = 404;
    ctx.body = { success: false, message: '规则不存在' };
    return;
  }

  if (name !== undefined) rules[index].name = name;
  if (category !== undefined) rules[index].category = category;
  if (description !== undefined) rules[index].description = description;
  if (keywords !== undefined) rules[index].keywords = keywords;
  if (riskLevel !== undefined) rules[index].riskLevel = riskLevel;
  if (enabled !== undefined) rules[index].enabled = enabled;
  
  rules[index].updatedAt = new Date().toISOString();

  writeJsonFile(RULES_FILE, data);

  ctx.body = {
    success: true,
    data: rules[index]
  };
});

router.delete('/:id', async (ctx) => {
  const { id } = ctx.params;
  const data = readJsonFile(RULES_FILE);
  const rules = data.rules || [];
  const index = rules.findIndex(r => r.id === id);

  if (index === -1) {
    ctx.status = 404;
    ctx.body = { success: false, message: '规则不存在' };
    return;
  }

  rules.splice(index, 1);
  writeJsonFile(RULES_FILE, data);

  ctx.body = {
    success: true,
    message: '规则已删除'
  };
});

router.get('/categories/list', async (ctx) => {
  const categories = ['关键词', '政治', '广告', '联系信息', '其他'];
  
  ctx.body = {
    success: true,
    data: categories
  };
});

module.exports = router;
