const Router = require('@koa/router');
const { v4: uuidv4 } = require('uuid');
const { readData, writeData } = require('../utils/data');

const router = new Router();

// 获取所有项目
router.get('/', async (ctx) => {
  const data = await readData();
  ctx.body = {
    code: 200,
    data: data.projects
  };
});

// 获取单个项目
router.get('/:id', async (ctx) => {
  const { id } = ctx.params;
  const data = await readData();
  const project = data.projects.find(p => p.id === id);
  
  if (!project) {
    ctx.status = 404;
    ctx.body = {
      code: 404,
      message: '项目不存在'
    };
    return;
  }
  
  ctx.body = {
    code: 200,
    data: project
  };
});

// 创建项目
router.post('/', async (ctx) => {
  const projectData = ctx.request.body;
  const data = await readData();
  
  const newProject = {
    id: uuidv4(),
    ...projectData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  data.projects.push(newProject);
  await writeData(data);
  
  ctx.body = {
    code: 200,
    data: newProject,
    message: '项目创建成功'
  };
});

// 更新项目
router.put('/:id', async (ctx) => {
  const { id } = ctx.params;
  const updateData = ctx.request.body;
  const data = await readData();
  
  const projectIndex = data.projects.findIndex(p => p.id === id);
  
  if (projectIndex === -1) {
    ctx.status = 404;
    ctx.body = {
      code: 404,
      message: '项目不存在'
    };
    return;
  }
  
  data.projects[projectIndex] = {
    ...data.projects[projectIndex],
    ...updateData,
    updatedAt: new Date().toISOString()
  };
  
  await writeData(data);
  
  ctx.body = {
    code: 200,
    data: data.projects[projectIndex],
    message: '项目更新成功'
  };
});

// 删除项目
router.delete('/:id', async (ctx) => {
  const { id } = ctx.params;
  const data = await readData();
  
  const projectIndex = data.projects.findIndex(p => p.id === id);
  
  if (projectIndex === -1) {
    ctx.status = 404;
    ctx.body = {
      code: 404,
      message: '项目不存在'
    };
    return;
  }
  
  data.projects.splice(projectIndex, 1);
  await writeData(data);
  
  ctx.body = {
    code: 200,
    message: '项目删除成功'
  };
});

module.exports = router;
