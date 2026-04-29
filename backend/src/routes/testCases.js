const Router = require('koa-router');
const { v4: uuidv4 } = require('uuid');
const { getTestCases, saveTestCases } = require('../data/store');

const router = new Router({ prefix: '/test-cases' });

router.get('/', async (ctx) => {
  const { projectId, type, group } = ctx.query;
  let testCases = getTestCases();
  
  if (projectId) {
    testCases = testCases.filter(tc => tc.projectId === projectId);
  }
  if (type) {
    testCases = testCases.filter(tc => tc.type === type);
  }
  if (group) {
    testCases = testCases.filter(tc => tc.group === group);
  }
  
  ctx.body = {
    success: true,
    message: '获取测试用例列表成功',
    data: testCases
  };
});

router.get('/:id', async (ctx) => {
  const { id } = ctx.params;
  const testCases = getTestCases();
  const testCase = testCases.find(tc => tc.id === id);
  
  if (!testCase) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      message: '测试用例不存在',
      data: null
    };
    return;
  }
  
  ctx.body = {
    success: true,
    message: '获取测试用例详情成功',
    data: testCase
  };
});

router.post('/', async (ctx) => {
  const {
    projectId,
    name,
    description,
    type = 'api',
    group = 'default',
    steps = [],
    parameters = [],
    assertions = [],
    environmentId
  } = ctx.request.body;
  
  if (!name || !projectId) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: '项目ID和用例名称不能为空',
      data: null
    };
    return;
  }
  
  const testCases = getTestCases();
  const newTestCase = {
    id: uuidv4(),
    projectId,
    name,
    description,
    type,
    group,
    version: 1,
    versions: [{
      version: 1,
      steps,
      parameters,
      assertions,
      createdAt: new Date().toISOString()
    }],
    steps,
    parameters,
    assertions,
    environmentId,
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  testCases.push(newTestCase);
  saveTestCases(testCases);
  
  ctx.status = 201;
  ctx.body = {
    success: true,
    message: '创建测试用例成功',
    data: newTestCase
  };
});

router.put('/:id', async (ctx) => {
  const { id } = ctx.params;
  const { name, description, group, steps, parameters, assertions, environmentId } = ctx.request.body;
  
  const testCases = getTestCases();
  const index = testCases.findIndex(tc => tc.id === id);
  
  if (index === -1) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      message: '测试用例不存在',
      data: null
    };
    return;
  }
  
  const newVersion = testCases[index].version + 1;
  const updatedTestCase = {
    ...testCases[index],
    ...(name && { name }),
    ...(description !== undefined && { description }),
    ...(group && { group }),
    ...(steps && { steps }),
    ...(parameters && { parameters }),
    ...(assertions && { assertions }),
    ...(environmentId && { environmentId }),
    version: newVersion,
    updatedAt: new Date().toISOString()
  };
  
  if (steps || parameters || assertions) {
    updatedTestCase.versions = [
      ...testCases[index].versions,
      {
        version: newVersion,
        steps: steps || testCases[index].steps,
        parameters: parameters || testCases[index].parameters,
        assertions: assertions || testCases[index].assertions,
        createdAt: new Date().toISOString()
      }
    ];
  }
  
  testCases[index] = updatedTestCase;
  saveTestCases(testCases);
  
  ctx.body = {
    success: true,
    message: '更新测试用例成功',
    data: testCases[index]
  };
});

router.delete('/:id', async (ctx) => {
  const { id } = ctx.params;
  const testCases = getTestCases();
  const index = testCases.findIndex(tc => tc.id === id);
  
  if (index === -1) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      message: '测试用例不存在',
      data: null
    };
    return;
  }
  
  testCases.splice(index, 1);
  saveTestCases(testCases);
  
  ctx.body = {
    success: true,
    message: '删除测试用例成功',
    data: null
  };
});

router.post('/:id/clone', async (ctx) => {
  const { id } = ctx.params;
  const testCases = getTestCases();
  const original = testCases.find(tc => tc.id === id);
  
  if (!original) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      message: '测试用例不存在',
      data: null
    };
    return;
  }
  
  const clonedTestCase = {
    ...original,
    id: uuidv4(),
    name: `${original.name} (副本)`,
    version: 1,
    versions: [{
      version: 1,
      steps: original.steps,
      parameters: original.parameters,
      assertions: original.assertions,
      createdAt: new Date().toISOString()
    }],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  testCases.push(clonedTestCase);
  saveTestCases(testCases);
  
  ctx.status = 201;
  ctx.body = {
    success: true,
    message: '克隆测试用例成功',
    data: clonedTestCase
  };
});

module.exports = router;
