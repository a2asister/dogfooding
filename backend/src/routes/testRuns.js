const Router = require('koa-router');
const { getTestRuns, saveTestRuns } = require('../data/store');

const router = new Router({ prefix: '/test-runs' });

router.get('/', async (ctx) => {
  const { taskId, projectId, status, limit = 50 } = ctx.query;
  let testRuns = getTestRuns();
  
  if (taskId) {
    testRuns = testRuns.filter(tr => tr.taskId === taskId);
  }
  if (projectId) {
    testRuns = testRuns.filter(tr => tr.projectId === projectId);
  }
  if (status) {
    testRuns = testRuns.filter(tr => tr.status === status);
  }
  
  testRuns = testRuns.slice(0, parseInt(limit));
  
  ctx.body = {
    success: true,
    message: '获取测试运行列表成功',
    data: testRuns
  };
});

router.get('/:id', async (ctx) => {
  const { id } = ctx.params;
  const testRuns = getTestRuns();
  const testRun = testRuns.find(tr => tr.id === id);
  
  if (!testRun) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      message: '测试运行不存在',
      data: null
    };
    return;
  }
  
  ctx.body = {
    success: true,
    message: '获取测试运行详情成功',
    data: testRun
  };
});

router.get('/:id/logs', async (ctx) => {
  const { id } = ctx.params;
  const testRuns = getTestRuns();
  const testRun = testRuns.find(tr => tr.id === id);
  
  if (!testRun) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      message: '测试运行不存在',
      data: null
    };
    return;
  }
  
  ctx.body = {
    success: true,
    message: '获取运行日志成功',
    data: testRun.logs || []
  };
});

router.get('/:id/report', async (ctx) => {
  const { id } = ctx.params;
  const testRuns = getTestRuns();
  const testRun = testRuns.find(tr => tr.id === id);
  
  if (!testRun) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      message: '测试运行不存在',
      data: null
    };
    return;
  }
  
  const report = {
    summary: {
      total: testRun.totalCases || 0,
      passed: testRun.passedCases || 0,
      failed: testRun.failedCases || 0,
      skipped: testRun.skippedCases || 0,
      passRate: testRun.totalCases ? ((testRun.passedCases || 0) / testRun.totalCases * 100).toFixed(2) : 0,
      duration: testRun.duration || 0
    },
    cases: testRun.caseResults || [],
    logs: testRun.logs || [],
    problemDistribution: testRun.problemDistribution || {},
    performance: testRun.performance || null
  };
  
  ctx.body = {
    success: true,
    message: '获取测试报告成功',
    data: report
  };
});

router.delete('/:id', async (ctx) => {
  const { id } = ctx.params;
  const testRuns = getTestRuns();
  const index = testRuns.findIndex(tr => tr.id === id);
  
  if (index === -1) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      message: '测试运行不存在',
      data: null
    };
    return;
  }
  
  testRuns.splice(index, 1);
  saveTestRuns(testRuns);
  
  ctx.body = {
    success: true,
    message: '删除测试运行成功',
    data: null
  };
});

module.exports = router;
