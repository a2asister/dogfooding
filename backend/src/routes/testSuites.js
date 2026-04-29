const Router = require('koa-router');
const { v4: uuidv4 } = require('uuid');
const { getTestSuites, saveTestSuites } = require('../data/store');

const router = new Router({ prefix: '/test-suites' });

router.get('/', async (ctx) => {
  const { projectId } = ctx.query;
  let testSuites = getTestSuites();
  
  if (projectId) {
    testSuites = testSuites.filter(ts => ts.projectId === projectId);
  }
  
  ctx.body = {
    success: true,
    message: '获取测试套件列表成功',
    data: testSuites
  };
});

router.get('/:id', async (ctx) => {
  const { id } = ctx.params;
  const testSuites = getTestSuites();
  const testSuite = testSuites.find(ts => ts.id === id);
  
  if (!testSuite) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      message: '测试套件不存在',
      data: null
    };
    return;
  }
  
  ctx.body = {
    success: true,
    message: '获取测试套件详情成功',
    data: testSuite
  };
});

router.post('/', async (ctx) => {
  const { projectId, name, description, testCaseIds = [] } = ctx.request.body;
  
  if (!name || !projectId) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: '项目ID和套件名称不能为空',
      data: null
    };
    return;
  }
  
  const testSuites = getTestSuites();
  const newTestSuite = {
    id: uuidv4(),
    projectId,
    name,
    description,
    testCaseIds,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  testSuites.push(newTestSuite);
  saveTestSuites(testSuites);
  
  ctx.status = 201;
  ctx.body = {
    success: true,
    message: '创建测试套件成功',
    data: newTestSuite
  };
});

router.put('/:id', async (ctx) => {
  const { id } = ctx.params;
  const { name, description, testCaseIds } = ctx.request.body;
  
  const testSuites = getTestSuites();
  const index = testSuites.findIndex(ts => ts.id === id);
  
  if (index === -1) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      message: '测试套件不存在',
      data: null
    };
    return;
  }
  
  testSuites[index] = {
    ...testSuites[index],
    ...(name && { name }),
    ...(description !== undefined && { description }),
    ...(testCaseIds && { testCaseIds }),
    updatedAt: new Date().toISOString()
  };
  
  saveTestSuites(testSuites);
  
  ctx.body = {
    success: true,
    message: '更新测试套件成功',
    data: testSuites[index]
  };
});

router.delete('/:id', async (ctx) => {
  const { id } = ctx.params;
  const testSuites = getTestSuites();
  const index = testSuites.findIndex(ts => ts.id === id);
  
  if (index === -1) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      message: '测试套件不存在',
      data: null
    };
    return;
  }
  
  testSuites.splice(index, 1);
  saveTestSuites(testSuites);
  
  ctx.body = {
    success: true,
    message: '删除测试套件成功',
    data: null
  };
});

module.exports = router;
