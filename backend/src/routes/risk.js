const Router = require('@koa/router');
const { v4: uuidv4 } = require('uuid');
const { readData, writeData, analyzeRisks } = require('../utils/data');

const router = new Router();

// 获取所有风险
router.get('/', async (ctx) => {
  const { projectId, type, status, level } = ctx.query;
  const data = await readData();
  
  let risks = data.risks;
  
  if (projectId) {
    risks = risks.filter(r => r.projectId === projectId);
  }
  
  if (type) {
    risks = risks.filter(r => r.type === type);
  }
  
  if (status) {
    risks = risks.filter(r => r.status === status);
  }
  
  if (level) {
    risks = risks.filter(r => r.level === level);
  }
  
  ctx.body = {
    code: 200,
    data: risks
  };
});

// 获取单个风险
router.get('/:id', async (ctx) => {
  const { id } = ctx.params;
  const data = await readData();
  const risk = data.risks.find(r => r.id === id);
  
  if (!risk) {
    ctx.status = 404;
    ctx.body = {
      code: 404,
      message: '风险不存在'
    };
    return;
  }
  
  ctx.body = {
    code: 200,
    data: risk
  };
});

// 创建风险
router.post('/', async (ctx) => {
  const riskData = ctx.request.body;
  const data = await readData();
  
  const newRisk = {
    id: uuidv4(),
    ...riskData,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  data.risks.push(newRisk);
  await writeData(data);
  
  ctx.body = {
    code: 200,
    data: newRisk,
    message: '风险创建成功'
  };
});

// 更新风险
router.put('/:id', async (ctx) => {
  const { id } = ctx.params;
  const updateData = ctx.request.body;
  const data = await readData();
  
  const riskIndex = data.risks.findIndex(r => r.id === id);
  
  if (riskIndex === -1) {
    ctx.status = 404;
    ctx.body = {
      code: 404,
      message: '风险不存在'
    };
    return;
  }
  
  data.risks[riskIndex] = {
    ...data.risks[riskIndex],
    ...updateData,
    updatedAt: new Date().toISOString()
  };
  
  await writeData(data);
  
  ctx.body = {
    code: 200,
    data: data.risks[riskIndex],
    message: '风险更新成功'
  };
});

// 删除风险
router.delete('/:id', async (ctx) => {
  const { id } = ctx.params;
  const data = await readData();
  
  const riskIndex = data.risks.findIndex(r => r.id === id);
  
  if (riskIndex === -1) {
    ctx.status = 404;
    ctx.body = {
      code: 404,
      message: '风险不存在'
    };
    return;
  }
  
  data.risks.splice(riskIndex, 1);
  await writeData(data);
  
  ctx.body = {
    code: 200,
    message: '风险删除成功'
  };
});

// 自动分析项目风险
router.post('/analyze/:projectId', async (ctx) => {
  const { projectId } = ctx.params;
  const data = await readData();
  
  const project = data.projects.find(p => p.id === projectId);
  
  if (!project) {
    ctx.status = 404;
    ctx.body = {
      code: 404,
      message: '项目不存在'
    };
    return;
  }
  
  // 分析风险
  const analyzedRisks = analyzeRisks(project, data);
  
  // 添加到风险列表
  analyzedRisks.forEach(risk => {
    data.risks.push(risk);
  });
  
  await writeData(data);
  
  ctx.body = {
    code: 200,
    data: analyzedRisks,
    message: '风险分析完成'
  };
});

module.exports = router;
