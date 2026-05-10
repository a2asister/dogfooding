const express = require('express');
const router = express.Router();

const workflowRoutes = require('./workflows');
const versionRoutes = require('./versions');
const executionRoutes = require('./executions');
const schedulerRoutes = require('./scheduler');
const eventRoutes = require('./events');

router.use('/workflows', workflowRoutes);
router.use('/workflows/:workflowId/versions', versionRoutes);
router.use('/executions', executionRoutes);
router.use('/scheduler', schedulerRoutes);
router.use('/events', eventRoutes);

router.get('/', (req, res) => {
  res.json({
    name: 'Workflow Automation Platform API',
    version: '1.0.0',
    endpoints: {
      workflows: '/api/workflows',
      versions: '/api/workflows/:id/versions',
      executions: '/api/executions',
      scheduler: '/api/scheduler',
      events: '/api/events'
    }
  });
});

module.exports = router;