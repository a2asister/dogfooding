const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');

router.post('/schedule', (req, res) => {
  try {
    const { workflowId, cronExpression, runAt, data } = req.body;
    const scheduler = req.app.locals.scheduler;

    if (!workflowId) {
      return res.status(400).json({ error: 'workflowId is required' });
    }

    let jobId;
    if (runAt) {
      jobId = scheduler.scheduleOneTime(workflowId, new Date(runAt), { data });
      res.json({ jobId, type: 'one-time', runAt });
    } else if (cronExpression) {
      jobId = scheduler.scheduleTask(workflowId, cronExpression, { data });
      res.json({ jobId, type: 'recurring', cronExpression });
    } else {
      res.status(400).json({ error: 'Either cronExpression or runAt is required' });
    }
  } catch (error) {
    logger.error('Failed to schedule task:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/:jobId/cancel', (req, res) => {
  try {
    const { jobId } = req.params;
    const scheduler = req.app.locals.scheduler;

    const cancelled = scheduler.cancelJob(jobId);
    
    if (!cancelled) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json({ success: true });
  } catch (error) {
    logger.error('Failed to cancel job:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/', (req, res) => {
  try {
    const { workflowId } = req.query;
    const scheduler = req.app.locals.scheduler;
    
    let jobs = Array.from(scheduler.jobs.entries());
    
    if (workflowId) {
      jobs = jobs.filter(([_, data]) => data.workflowId === workflowId);
    }

    const result = jobs.map(([jobId, data]) => ({
      jobId,
      workflowId: data.workflowId,
      isOneTime: data.isOneTime,
      cronExpression: data.cronExpression,
      date: data.date,
      createdAt: data.createdAt
    }));

    res.json(result);
  } catch (error) {
    logger.error('Failed to list jobs:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;