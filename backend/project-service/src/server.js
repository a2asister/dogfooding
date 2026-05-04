const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const cors = require('koa-cors');
const DataStore = require('@oa/data-store');

const app = new Koa();
const router = new Router();
const projectStore = new DataStore('project-projects');
const taskStore = new DataStore('project-tasks');
const milestoneStore = new DataStore('project-milestones');

app.use(cors());
app.use(bodyParser());

router.get('/api/health', (ctx) => {
  ctx.body = { status: 'ok', service: 'project-service', timestamp: new Date().toISOString() };
});

router.get('/api/projects', (ctx) => {
  const projects = projectStore.findAll();
  ctx.body = { success: true, data: projects };
});

router.get('/api/projects/:id', (ctx) => {
  const project = projectStore.findById(ctx.params.id);
  if (!project) {
    ctx.status = 404;
    ctx.body = { success: false, message: 'Project not found' };
    return;
  }
  ctx.body = { success: true, data: project };
});

router.post('/api/projects', (ctx) => {
  const project = projectStore.create(ctx.request.body);
  ctx.status = 201;
  ctx.body = { success: true, data: project };
});

router.put('/api/projects/:id', (ctx) => {
  const project = projectStore.update(ctx.params.id, ctx.request.body);
  if (!project) {
    ctx.status = 404;
    ctx.body = { success: false, message: 'Project not found' };
    return;
  }
  ctx.body = { success: true, data: project };
});

router.delete('/api/projects/:id', (ctx) => {
  const success = projectStore.delete(ctx.params.id);
  if (!success) {
    ctx.status = 404;
    ctx.body = { success: false, message: 'Project not found' };
    return;
  }
  ctx.body = { success: true };
});

router.get('/api/tasks', (ctx) => {
  const tasks = taskStore.findAll();
  ctx.body = { success: true, data: tasks };
});

router.post('/api/tasks', (ctx) => {
  const task = taskStore.create(ctx.request.body);
  ctx.status = 201;
  ctx.body = { success: true, data: task };
});

router.get('/api/milestones', (ctx) => {
  const milestones = milestoneStore.findAll();
  ctx.body = { success: true, data: milestones };
});

router.post('/api/milestones', (ctx) => {
  const milestone = milestoneStore.create(ctx.request.body);
  ctx.status = 201;
  ctx.body = { success: true, data: milestone };
});

app.use(router.routes()).use(router.allowedMethods());

const PORT = 3005;
app.listen(PORT, () => {
  console.log(`Project Service running on port ${PORT}`);
});
