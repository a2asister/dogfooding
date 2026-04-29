const Router = require('koa-router');
const { v4: uuidv4 } = require('uuid');
const { getParameters, saveParameters } = require('../data/store');

const router = new Router({ prefix: '/parameters' });

router.get('/', async (ctx) => {
  const { projectId, type } = ctx.query;
  let parameters = getParameters();
  
  if (projectId) {
    parameters = parameters.filter(p => p.projectId === projectId);
  }
  if (type) {
    parameters = parameters.filter(p => p.type === type);
  }
  
  ctx.body = {
    success: true,
    message: '获取参数列表成功',
    data: parameters
  };
});

router.get('/:id', async (ctx) => {
  const { id } = ctx.params;
  const parameters = getParameters();
  const parameter = parameters.find(p => p.id === id);
  
  if (!parameter) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      message: '参数不存在',
      data: null
    };
    return;
  }
  
  ctx.body = {
    success: true,
    message: '获取参数详情成功',
    data: parameter
  };
});

router.post('/', async (ctx) => {
  const { projectId, name, key, value, type = 'common', description } = ctx.request.body;
  
  if (!name || !key || !projectId) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: '项目ID、参数名称和键不能为空',
      data: null
    };
    return;
  }
  
  const parameters = getParameters();
  const newParameter = {
    id: uuidv4(),
    projectId,
    name,
    key,
    value,
    type,
    description,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  parameters.push(newParameter);
  saveParameters(parameters);
  
  ctx.status = 201;
  ctx.body = {
    success: true,
    message: '创建参数成功',
    data: newParameter
  };
});

router.put('/:id', async (ctx) => {
  const { id } = ctx.params;
  const { name, value, type, description } = ctx.request.body;
  
  const parameters = getParameters();
  const index = parameters.findIndex(p => p.id === id);
  
  if (index === -1) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      message: '参数不存在',
      data: null
    };
    return;
  }
  
  parameters[index] = {
    ...parameters[index],
    ...(name && { name }),
    ...(value !== undefined && { value }),
    ...(type && { type }),
    ...(description !== undefined && { description }),
    updatedAt: new Date().toISOString()
  };
  
  saveParameters(parameters);
  
  ctx.body = {
    success: true,
    message: '更新参数成功',
    data: parameters[index]
  };
});

router.delete('/:id', async (ctx) => {
  const { id } = ctx.params;
  const parameters = getParameters();
  const index = parameters.findIndex(p => p.id === id);
  
  if (index === -1) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      message: '参数不存在',
      data: null
    };
    return;
  }
  
  parameters.splice(index, 1);
  saveParameters(parameters);
  
  ctx.body = {
    success: true,
    message: '删除参数成功',
    data: null
  };
});

module.exports = router;
