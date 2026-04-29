const Router = require('koa-router');
const { v4: uuidv4 } = require('uuid');
const { getEnvironments, saveEnvironments } = require('../data/store');

const router = new Router({ prefix: '/environments' });

router.get('/', async (ctx) => {
  const { projectId } = ctx.query;
  let environments = getEnvironments();
  
  if (projectId) {
    environments = environments.filter(e => e.projectId === projectId);
  }
  
  ctx.body = {
    success: true,
    message: '获取环境列表成功',
    data: environments
  };
});

router.get('/:id', async (ctx) => {
  const { id } = ctx.params;
  const environments = getEnvironments();
  const environment = environments.find(e => e.id === id);
  
  if (!environment) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      message: '环境不存在',
      data: null
    };
    return;
  }
  
  ctx.body = {
    success: true,
    message: '获取环境详情成功',
    data: environment
  };
});

router.post('/', async (ctx) => {
  const { projectId, name, description, baseUrl, variables = [], headers = {} } = ctx.request.body;
  
  if (!name || !projectId) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: '项目ID和环境名称不能为空',
      data: null
    };
    return;
  }
  
  const environments = getEnvironments();
  const newEnvironment = {
    id: uuidv4(),
    projectId,
    name,
    description,
    baseUrl,
    variables,
    headers,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  environments.push(newEnvironment);
  saveEnvironments(environments);
  
  ctx.status = 201;
  ctx.body = {
    success: true,
    message: '创建环境成功',
    data: newEnvironment
  };
});

router.put('/:id', async (ctx) => {
  const { id } = ctx.params;
  const { name, description, baseUrl, variables, headers } = ctx.request.body;
  
  const environments = getEnvironments();
  const index = environments.findIndex(e => e.id === id);
  
  if (index === -1) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      message: '环境不存在',
      data: null
    };
    return;
  }
  
  environments[index] = {
    ...environments[index],
    ...(name && { name }),
    ...(description !== undefined && { description }),
    ...(baseUrl !== undefined && { baseUrl }),
    ...(variables && { variables }),
    ...(headers && { headers }),
    updatedAt: new Date().toISOString()
  };
  
  saveEnvironments(environments);
  
  ctx.body = {
    success: true,
    message: '更新环境成功',
    data: environments[index]
  };
});

router.delete('/:id', async (ctx) => {
  const { id } = ctx.params;
  const environments = getEnvironments();
  const index = environments.findIndex(e => e.id === id);
  
  if (index === -1) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      message: '环境不存在',
      data: null
    };
    return;
  }
  
  environments.splice(index, 1);
  saveEnvironments(environments);
  
  ctx.body = {
    success: true,
    message: '删除环境成功',
    data: null
  };
});

module.exports = router;
