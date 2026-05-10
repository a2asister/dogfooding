const express = require('express');
const router = express.Router();
const store = require('../data/store');
const logger = require('../utils/logger');

router.get('/', (req, res) => {
  try {
    const { workflowId } = req.query;
    
    if (workflowId) {
      const executions = store.listExecutions(workflowId);
      return res.json(executions);
    }

    res.status(400).json({ error: 'workflowId is required' });
  } catch (error) {
    logger.error('Failed to list executions:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/run', async (req, res) => {
  try {
    const { workflowId, versionId, data } = req.body;
    const engineManager = req.app.locals.engineManager;

    if (!workflowId) {
      return res.status(400).json({ error: 'workflowId is required' });
    }

    const workflow = store.getWorkflow(workflowId);
    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    let execution;
    if (versionId) {
      execution = await engineManager.startWorkflow(workflowId, versionId, 'manual', data || {});
    } else {
      execution = await engineManager.runVersion(workflowId, 'manual', data || {});
    }

    res.json(execution);
  } catch (error) {
    logger.error('Failed to run workflow:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', (req, res) => {
  try {
    const execution = store.getExecution(req.params.id);
    
    if (!execution) {
      return res.status(404).json({ error: 'Execution not found' });
    }

    res.json(execution);
  } catch (error) {
    logger.error('Failed to get execution:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/cancel', (req, res) => {
  try {
    const engineManager = req.app.locals.engineManager;
    const cancelled = engineManager.cancelExecution(req.params.id);
    
    if (!cancelled) {
      return res.status(404).json({ error: 'Execution not found or already completed' });
    }

    res.json({ success: true, cancelled: true });
  } catch (error) {
    logger.error('Failed to cancel execution:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id/logs', (req, res) => {
  try {
    const execution = store.getExecution(req.params.id);
    
    if (!execution) {
      return res.status(404).json({ error: 'Execution not found' });
    }

    res.json(execution.logs || []);
  } catch (error) {
    logger.error('Failed to get execution logs:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id/nodes', (req, res) => {
  try {
    const execution = store.getExecution(req.params.id);
    
    if (!execution) {
      return res.status(404).json({ error: 'Execution not found' });
    }

    res.json(execution.nodeStates || {});
  } catch (error) {
    logger.error('Failed to get node states:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;