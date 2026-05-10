const express = require('express');
const router = express.Router({ mergeParams: true });
const store = require('../data/store');
const logger = require('../utils/logger');

router.get('/', (req, res) => {
  try {
    const { workflowId } = req.params;
    const versions = store.getVersions(workflowId);
    res.json(versions);
  } catch (error) {
    logger.error('Failed to list versions:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/', (req, res) => {
  try {
    const { workflowId } = req.params;
    const { name, description, graph, config } = req.body;

    if (!graph) {
      return res.status(400).json({ error: 'Workflow graph is required' });
    }

    const existingVersions = store.getVersions(workflowId);
    const versionNum = existingVersions.length + 1;

    const version = store.createVersion(workflowId, {
      name: name || `Version ${versionNum}`,
      description: description || '',
      version: versionNum,
      graph,
      config: config || {
        timeoutMs: 300000,
        alerts: { enabled: true }
      }
    });

    logger.info(`Created version ${versionNum} for workflow: ${workflowId}`);
    res.status(201).json(version);
  } catch (error) {
    logger.error('Failed to create version:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/:versionId/activate', (req, res) => {
  try {
    const { workflowId, versionId } = req.params;
    const { canaryRatio = 100 } = req.body;

    const version = store.activateVersion(workflowId, versionId, canaryRatio);

    if (!version) {
      return res.status(404).json({ error: 'Version not found' });
    }

    logger.info(`Activated version ${versionId} for workflow: ${workflowId} with canary ratio: ${canaryRatio}%`);
    res.json(version);
  } catch (error) {
    logger.error('Failed to activate version:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/:versionId/rollback', (req, res) => {
  try {
    const { workflowId, versionId } = req.params;
    const versions = store.getVersions(workflowId);
    
    const currentIndex = versions.findIndex(v => v.id === versionId);
    if (currentIndex <= 0) {
      return res.status(400).json({ error: 'No previous version to rollback to' });
    }

    const previousVersion = versions[currentIndex - 1];
    const version = store.activateVersion(workflowId, previousVersion.id, 100);

    logger.info(`Rolled back to version ${previousVersion.id} for workflow: ${workflowId}`);
    res.json(version);
  } catch (error) {
    logger.error('Failed to rollback version:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/active', (req, res) => {
  try {
    const { workflowId } = req.params;
    const activeVersion = store.getActiveVersion(workflowId);
    
    if (!activeVersion) {
      return res.status(404).json({ error: 'No active version found' });
    }

    res.json(activeVersion);
  } catch (error) {
    logger.error('Failed to get active version:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;