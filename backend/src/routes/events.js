const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');

router.post('/trigger', async (req, res) => {
  try {
    const { eventName, data } = req.body;
    const scheduler = req.app.locals.scheduler;

    if (!eventName) {
      return res.status(400).json({ error: 'eventName is required' });
    }

    const triggeredCount = await scheduler.triggerEvent(eventName, data || {});
    
    res.json({ 
      eventName, 
      triggeredCount,
      timestamp: Date.now()
    });
  } catch (error) {
    logger.error('Failed to trigger event:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/register', (req, res) => {
  try {
    const { eventName, workflowId, options } = req.body;
    const scheduler = req.app.locals.scheduler;

    if (!eventName || !workflowId) {
      return res.status(400).json({ error: 'eventName and workflowId are required' });
    }

    const listenerId = scheduler.registerEventListener(eventName, workflowId, options || {});
    
    res.json({ 
      listenerId, 
      eventName, 
      workflowId 
    });
  } catch (error) {
    logger.error('Failed to register event listener:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/:listenerId/remove', (req, res) => {
  try {
    const { listenerId } = req.params;
    const scheduler = req.app.locals.scheduler;

    const removed = scheduler.removeEventListener(listenerId);
    
    if (!removed) {
      return res.status(404).json({ error: 'Listener not found' });
    }

    res.json({ success: true });
  } catch (error) {
    logger.error('Failed to remove event listener:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/', (req, res) => {
  try {
    const { eventName } = req.query;
    const scheduler = req.app.locals.scheduler;

    const listeners = scheduler.getEventListeners(eventName || null);
    
    res.json(listeners);
  } catch (error) {
    logger.error('Failed to list event listeners:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;