const Router = require('@koa/router');
const { v4: uuidv4 } = require('uuid');
const { readData, writeData } = require('../utils/data');

const router = new Router();

// 获取所有规则
router.get('/', async (ctx) => {
  const { category, enabled } = ctx.query;
  const data = await readData();
  
  let rules = data.riskRules;
  
  if (category) {
    rules = rules.filter(r => r.category === category);
  }
  
  if (enabled !== undefined) {
    rules = rules.filter(r => r.enabled === (enabled === 'true'));
  }
  
  ctx.body = {
    code: 200,
    data: rules
  };
});

// 获取单个规则
router.get('/:id', async (ctx) => {
  const { id } = ctx.params;
  const data = await readData();
  const rule = data.riskRules.find(r => r.id === id);
  
  if (!rule) {
    ctx.status = 404;
    ctx.body = {
      code: 404,
      message: '规则不存在'
    };
    return;
  }
  
  ctx.body = {
    code: 200,
    data: rule
  };
});

// 创建规则
router.post('/', async (ctx) => {
  const ruleData = ctx.request.body;
  const data = await readData();
  
  const newRule = {
    id: uuidv4(),
    ...ruleData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  data.riskRules.push(newRule);
  await writeData(data);
  
  ctx.body = {
    code: 200,
    data: newRule,
    message: '规则创建成功'
  };
});

// 更新规则
router.put('/:id', async (ctx) => {
  const { id } = ctx.params;
  const updateData = ctx.request.body;
  const data = await readData();
  
  const ruleIndex = data.riskRules.findIndex(r => r.id === id);
  
  if (ruleIndex === -1) {
    ctx.status = 404;
    ctx.body = {
      code: 404,
      message: '规则不存在'
    };
    return;
  }
  
  data.riskRules[ruleIndex] = {
    ...data.riskRules[ruleIndex],
    ...updateData,
    updatedAt: new Date().toISOString()
  };
  
  await writeData(data);
  
  ctx.body = {
    code: 200,
    data: data.riskRules[ruleIndex],
    message: '规则更新成功'
  };
});

// 删除规则
router.delete('/:id', async (ctx) => {
  const { id } = ctx.params;
  const data = await readData();
  
  const ruleIndex = data.riskRules.findIndex(r => r.id === id);
  
  if (ruleIndex === -1) {
    ctx.status = 404;
    ctx.body = {
      code: 404,
      message: '规则不存在'
    };
    return;
  }
  
  data.riskRules.splice(ruleIndex, 1);
  await writeData(data);
  
  ctx.body = {
    code: 200,
    message: '规则删除成功'
  };
});

module.exports = router;
