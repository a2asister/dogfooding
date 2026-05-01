const Router = require('@koa/router');
const { v4: uuidv4 } = require('uuid');
const { readData, writeData, generateRiskReport } = require('../utils/data');

const router = new Router();

// 获取所有报告
router.get('/', async (ctx) => {
  const { projectId, type } = ctx.query;
  const data = await readData();
  
  let reports = data.reports;
  
  if (projectId) {
    reports = reports.filter(r => r.projectId === projectId);
  }
  
  if (type) {
    reports = reports.filter(r => r.type === type);
  }
  
  ctx.body = {
    code: 200,
    data: reports
  };
});

// 获取单个报告
router.get('/:id', async (ctx) => {
  const { id } = ctx.params;
  const data = await readData();
  const report = data.reports.find(r => r.id === id);
  
  if (!report) {
    ctx.status = 404;
    ctx.body = {
      code: 404,
      message: '报告不存在'
    };
    return;
  }
  
  ctx.body = {
    code: 200,
    data: report
  };
});

// 创建报告
router.post('/', async (ctx) => {
  const reportData = ctx.request.body;
  const data = await readData();
  
  const newReport = {
    id: uuidv4(),
    ...reportData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  data.reports.push(newReport);
  await writeData(data);
  
  ctx.body = {
    code: 200,
    data: newReport,
    message: '报告创建成功'
  };
});

// 自动生成风险报告
router.post('/generate/:projectId', async (ctx) => {
  const { projectId } = ctx.params;
  const { type } = ctx.request.body;
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
  
  // 生成风险报告
  const reportContent = generateRiskReport(project, data, type || 'weekly');
  
  const newReport = {
    id: uuidv4(),
    projectId,
    projectName: project.name,
    type: type || 'weekly',
    title: `${project.name} - ${type === 'weekly' ? '每周' : type === 'monthly' ? '每月' : '季度'}风险报告`,
    content: reportContent,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  data.reports.push(newReport);
  await writeData(data);
  
  ctx.body = {
    code: 200,
    data: newReport,
    message: '风险报告生成成功'
  };
});

// 删除报告
router.delete('/:id', async (ctx) => {
  const { id } = ctx.params;
  const data = await readData();
  
  const reportIndex = data.reports.findIndex(r => r.id === id);
  
  if (reportIndex === -1) {
    ctx.status = 404;
    ctx.body = {
      code: 404,
      message: '报告不存在'
    };
    return;
  }
  
  data.reports.splice(reportIndex, 1);
  await writeData(data);
  
  ctx.body = {
    code: 200,
    message: '报告删除成功'
  };
});

module.exports = router;
