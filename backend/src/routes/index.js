const Router = require('koa-router');
const projects = require('./projects');
const testCases = require('./testCases');
const testSuites = require('./testSuites');
const tasks = require('./tasks');
const testRuns = require('./testRuns');
const environments = require('./environments');
const users = require('./users');
const parameters = require('./parameters');
const defects = require('./defects');

const router = new Router({ prefix: '/api' });

router.use(projects.routes(), projects.allowedMethods());
router.use(testCases.routes(), testCases.allowedMethods());
router.use(testSuites.routes(), testSuites.allowedMethods());
router.use(tasks.routes(), tasks.allowedMethods());
router.use(testRuns.routes(), testRuns.allowedMethods());
router.use(environments.routes(), environments.allowedMethods());
router.use(users.routes(), users.allowedMethods());
router.use(parameters.routes(), parameters.allowedMethods());
router.use(defects.routes(), defects.allowedMethods());

router.get('/health', async (ctx) => {
  ctx.body = {
    success: true,
    message: 'Service is healthy',
    data: {
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    }
  };
});

module.exports = router;
