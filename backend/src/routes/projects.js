const Router = require('koa-router');
const { v4: uuidv4 } = require('uuid');
const { getProjects, saveProjects } = require('../data/store');

const router = new Router({ prefix: '/projects' });

router.get('/', async (ctx) => {
  const projects = getProjects();
  ctx.body = {
    success: true,
    message: '获取项目列表成功',
    data: projects
  };
});

router.get('/:id', async (ctx) => {
  const { id } = ctx.params;
  const projects = getProjects();
  const project = projects.find(p => p.id === id);
  
  if (!project) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      message: '项目不存在',
      data: null
    };
    return;
  }
  
  ctx.body = {
    success: true,
    message: '获取项目详情成功',
    data: project
  };
});

router.post('/', async (ctx) => {
  const { name, description, owner, members = [] } = ctx.request.body;
  
  if (!name) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: '项目名称不能为空',
      data: null
    };
    return;
  }
  
  const projects = getProjects();
  const newProject = {
    id: uuidv4(),
    name,
    description,
    owner,
    members,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  projects.push(newProject);
  saveProjects(projects);
  
  ctx.status = 201;
  ctx.body = {
    success: true,
    message: '创建项目成功',
    data: newProject
  };
});

router.put('/:id', async (ctx) => {
  const { id } = ctx.params;
  const { name, description, members } = ctx.request.body;
  
  const projects = getProjects();
  const index = projects.findIndex(p => p.id === id);
  
  if (index === -1) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      message: '项目不存在',
      data: null
    };
    return;
  }
  
  projects[index] = {
    ...projects[index],
    ...(name && { name }),
    ...(description !== undefined && { description }),
    ...(members && { members }),
    updatedAt: new Date().toISOString()
  };
  
  saveProjects(projects);
  
  ctx.body = {
    success: true,
    message: '更新项目成功',
    data: projects[index]
  };
});

router.delete('/:id', async (ctx) => {
  const { id } = ctx.params;
  const projects = getProjects();
  const index = projects.findIndex(p => p.id === id);
  
  if (index === -1) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      message: '项目不存在',
      data: null
    };
    return;
  }
  
  projects.splice(index, 1);
  saveProjects(projects);
  
  ctx.body = {
    success: true,
    message: '删除项目成功',
    data: null
  };
});

module.exports = router;
