const Router = require('koa-router');
const { v4: uuidv4 } = require('uuid');
const { getDefects, saveDefects } = require('../data/store');

const router = new Router({ prefix: '/defects' });

router.get('/', async (ctx) => {
  const { projectId, testRunId, status, priority } = ctx.query;
  let defects = getDefects();
  
  if (projectId) {
    defects = defects.filter(d => d.projectId === projectId);
  }
  if (testRunId) {
    defects = defects.filter(d => d.testRunId === testRunId);
  }
  if (status) {
    defects = defects.filter(d => d.status === status);
  }
  if (priority) {
    defects = defects.filter(d => d.priority === priority);
  }
  
  ctx.body = {
    success: true,
    message: '获取缺陷列表成功',
    data: defects
  };
});

router.get('/:id', async (ctx) => {
  const { id } = ctx.params;
  const defects = getDefects();
  const defect = defects.find(d => d.id === id);
  
  if (!defect) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      message: '缺陷不存在',
      data: null
    };
    return;
  }
  
  ctx.body = {
    success: true,
    message: '获取缺陷详情成功',
    data: defect
  };
});

router.post('/', async (ctx) => {
  const {
    projectId,
    testRunId,
    caseResultId,
    title,
    description,
    severity = 'medium',
    priority = 'normal',
    assignee
  } = ctx.request.body;
  
  if (!title || !projectId) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: '项目ID和缺陷标题不能为空',
      data: null
    };
    return;
  }
  
  const defects = getDefects();
  const newDefect = {
    id: uuidv4(),
    projectId,
    testRunId,
    caseResultId,
    title,
    description,
    severity,
    priority,
    assignee,
    status: 'open',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  defects.push(newDefect);
  saveDefects(defects);
  
  ctx.status = 201;
  ctx.body = {
    success: true,
    message: '创建缺陷成功',
    data: newDefect
  };
});

router.put('/:id', async (ctx) => {
  const { id } = ctx.params;
  const { title, description, severity, priority, status, assignee } = ctx.request.body;
  
  const defects = getDefects();
  const index = defects.findIndex(d => d.id === id);
  
  if (index === -1) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      message: '缺陷不存在',
      data: null
    };
    return;
  }
  
  defects[index] = {
    ...defects[index],
    ...(title && { title }),
    ...(description !== undefined && { description }),
    ...(severity && { severity }),
    ...(priority && { priority }),
    ...(status && { status }),
    ...(assignee !== undefined && { assignee }),
    updatedAt: new Date().toISOString()
  };
  
  saveDefects(defects);
  
  ctx.body = {
    success: true,
    message: '更新缺陷成功',
    data: defects[index]
  };
});

router.delete('/:id', async (ctx) => {
  const { id } = ctx.params;
  const defects = getDefects();
  const index = defects.findIndex(d => d.id === id);
  
  if (index === -1) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      message: '缺陷不存在',
      data: null
    };
    return;
  }
  
  defects.splice(index, 1);
  saveDefects(defects);
  
  ctx.body = {
    success: true,
    message: '删除缺陷成功',
    data: null
  };
});

module.exports = router;
