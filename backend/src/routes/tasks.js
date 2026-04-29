const Router = require('koa-router');
const { v4: uuidv4 } = require('uuid');
const { getTasks, saveTasks } = require('../data/store');
const { scheduleTask, cancelScheduledTask } = require('../services/scheduler');

const router = new Router({ prefix: '/tasks' });

router.get('/', async (ctx) => {
  const { projectId, mode, status } = ctx.query;
  let tasks = getTasks();
  
  if (projectId) {
    tasks = tasks.filter(t => t.projectId === projectId);
  }
  if (mode) {
    tasks = tasks.filter(t => t.mode === mode);
  }
  if (status) {
    tasks = tasks.filter(t => t.status === status);
  }
  
  ctx.body = {
    success: true,
    message: '获取任务列表成功',
    data: tasks
  };
});

router.get('/:id', async (ctx) => {
  const { id } = ctx.params;
  const tasks = getTasks();
  const task = tasks.find(t => t.id === id);
  
  if (!task) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      message: '任务不存在',
      data: null
    };
    return;
  }
  
  ctx.body = {
    success: true,
    message: '获取任务详情成功',
    data: task
  };
});

router.post('/', async (ctx) => {
  const {
    projectId,
    name,
    description,
    mode = 'manual',
    testSuiteIds = [],
    testCaseIds = [],
    environmentId,
    cronExpression,
    ciTriggerToken
  } = ctx.request.body;
  
  if (!name || !projectId) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: '项目ID和任务名称不能为空',
      data: null
    };
    return;
  }
  
  if (mode === 'scheduled' && !cronExpression) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: '定时任务需要提供 cron 表达式',
      data: null
    };
    return;
  }
  
  const tasks = getTasks();
  const newTask = {
    id: uuidv4(),
    projectId,
    name,
    description,
    mode,
    testSuiteIds,
    testCaseIds,
    environmentId,
    cronExpression,
    ciTriggerToken: mode === 'ci' ? (ciTriggerToken || uuidv4()) : null,
    status: mode === 'scheduled' ? 'active' : 'idle',
    lastRunAt: null,
    nextRunAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  tasks.push(newTask);
  saveTasks(tasks);
  
  if (mode === 'scheduled') {
    scheduleTask(newTask);
  }
  
  ctx.status = 201;
  ctx.body = {
    success: true,
    message: '创建任务成功',
    data: newTask
  };
});

router.put('/:id', async (ctx) => {
  const { id } = ctx.params;
  const { name, description, mode, testSuiteIds, testCaseIds, environmentId, cronExpression, status } = ctx.request.body;
  
  const tasks = getTasks();
  const index = tasks.findIndex(t => t.id === id);
  
  if (index === -1) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      message: '任务不存在',
      data: null
    };
    return;
  }
  
  const oldTask = tasks[index];
  
  if (oldTask.mode === 'scheduled') {
    cancelScheduledTask(oldTask.id);
  }
  
  tasks[index] = {
    ...oldTask,
    ...(name && { name }),
    ...(description !== undefined && { description }),
    ...(mode && { mode }),
    ...(testSuiteIds && { testSuiteIds }),
    ...(testCaseIds && { testCaseIds }),
    ...(environmentId !== undefined && { environmentId }),
    ...(cronExpression && { cronExpression }),
    ...(status && { status }),
    updatedAt: new Date().toISOString()
  };
  
  if (tasks[index].mode === 'scheduled' && tasks[index].status === 'active') {
    scheduleTask(tasks[index]);
  }
  
  saveTasks(tasks);
  
  ctx.body = {
    success: true,
    message: '更新任务成功',
    data: tasks[index]
  };
});

router.delete('/:id', async (ctx) => {
  const { id } = ctx.params;
  const tasks = getTasks();
  const index = tasks.findIndex(t => t.id === id);
  
  if (index === -1) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      message: '任务不存在',
      data: null
    };
    return;
  }
  
  const task = tasks[index];
  if (task.mode === 'scheduled') {
    cancelScheduledTask(task.id);
  }
  
  tasks.splice(index, 1);
  saveTasks(tasks);
  
  ctx.body = {
    success: true,
    message: '删除任务成功',
    data: null
  };
});

router.post('/:id/run', async (ctx) => {
  const { id } = ctx.params;
  const tasks = getTasks();
  const task = tasks.find(t => t.id === id);
  
  if (!task) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      message: '任务不存在',
      data: null
    };
    return;
  }
  
  const { executeTask } = require('../services/executor');
  const testRun = await executeTask(task);
  
  ctx.status = 201;
  ctx.body = {
    success: true,
    message: '任务已启动',
    data: testRun
  };
});

router.post('/ci/:token', async (ctx) => {
  const { token } = ctx.params;
  const tasks = getTasks();
  const task = tasks.find(t => t.ciTriggerToken === token && t.mode === 'ci');
  
  if (!task) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      message: 'CI 任务不存在',
      data: null
    };
    return;
  }
  
  const { executeTask } = require('../services/executor');
  const testRun = await executeTask(task);
  
  ctx.status = 201;
  ctx.body = {
    success: true,
    message: 'CI 任务已启动',
    data: testRun
  };
});

module.exports = router;
