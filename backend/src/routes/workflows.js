const express = require('express');
const router = express.Router();
const store = require('../data/store');
const logger = require('../utils/logger');

router.get('/', (req, res) => {
  try {
    const { status } = req.query;
    const workflows = store.listWorkflows(status ? { status } : {});
    res.json(workflows);
  } catch (error) {
    logger.error('Failed to list workflows:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/', (req, res) => {
  try {
    const { name, description, category, tags } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Workflow name is required' });
    }

    const workflow = store.createWorkflow({
      name,
      description: description || '',
      category: category || 'general',
      tags: tags || []
    });

    logger.info(`Created workflow: ${workflow.id}`);
    res.status(201).json(workflow);
  } catch (error) {
    logger.error('Failed to create workflow:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', (req, res) => {
  try {
    const workflow = store.getWorkflow(req.params.id);
    
    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    res.json(workflow);
  } catch (error) {
    logger.error('Failed to get workflow:', error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, category, tags, status } = req.body;
    
    const workflow = store.updateWorkflow(id, {
      name,
      description,
      category,
      tags,
      status
    });

    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    logger.info(`Updated workflow: ${id}`);
    res.json(workflow);
  } catch (error) {
    logger.error('Failed to update workflow:', error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const scheduler = req.app.locals.scheduler;
    
    scheduler.cancelWorkflowJobs(id);
    scheduler.removeWorkflowEventListeners(id);
    
    const deleted = store.deleteWorkflow(id);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    logger.info(`Deleted workflow: ${id}`);
    res.json({ success: true });
  } catch (error) {
    logger.error('Failed to delete workflow:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;