const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const dataStore = require('../utils/dataStore');
const { checkPermission } = require('../middleware/auth');

router.get('/', checkPermission(['cicd:view']), (req, res) => {
  const pipelines = dataStore.getAll('cicdPipelines.json');
  res.json({
    success: true,
    data: pipelines,
    total: pipelines.length
  });
});

router.get('/:id', checkPermission(['cicd:view']), (req, res) => {
  const { id } = req.params;
  const pipeline = dataStore.getById('cicdPipelines.json', id);
  
  if (!pipeline) {
    return res.status(404).json({ error: 'CI/CD流水线不存在' });
  }
  
  res.json({
    success: true,
    data: pipeline
  });
});

router.post('/', checkPermission(['cicd:create']), (req, res) => {
  const { name, description, provider, projectId, repoId, stages, triggers, status, environment } = req.body;
  
  const newPipeline = {
    id: uuidv4(),
    name,
    description,
    provider: provider || 'github-actions',
    projectId,
    repoId,
    stages: stages || ['build', 'test', 'deploy'],
    triggers: triggers || ['push', 'pull_request'],
    status: status || 'active',
    environment: environment || 'staging',
    lastRun: null,
    lastStatus: null,
    createdBy: req.user.username,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  dataStore.create('cicdPipelines.json', newPipeline);
  
  res.status(201).json({
    success: true,
    message: 'CI/CD流水线创建成功',
    data: newPipeline
  });
});

router.put('/:id', checkPermission(['cicd:edit']), (req, res) => {
  const { id } = req.params;
  const { name, description, provider, stages, triggers, status, environment } = req.body;
  
  const updateData = {
    name,
    description,
    provider,
    stages,
    triggers,
    status,
    environment,
    updatedAt: new Date().toISOString()
  };
  
  const updatedPipeline = dataStore.update('cicdPipelines.json', id, updateData);
  
  if (!updatedPipeline) {
    return res.status(404).json({ error: 'CI/CD流水线不存在' });
  }
  
  res.json({
    success: true,
    message: 'CI/CD流水线更新成功',
    data: updatedPipeline
  });
});

router.delete('/:id', checkPermission(['cicd:delete']), (req, res) => {
  const { id } = req.params;
  
  const deleted = dataStore.remove('cicdPipelines.json', id);
  
  if (!deleted) {
    return res.status(404).json({ error: 'CI/CD流水线不存在' });
  }
  
  res.json({
    success: true,
    message: 'CI/CD流水线删除成功'
  });
});

router.post('/:id/trigger', checkPermission(['cicd:execute']), (req, res) => {
  const { id } = req.params;
  const pipeline = dataStore.getById('cicdPipelines.json', id);
  
  if (!pipeline) {
    return res.status(404).json({ error: 'CI/CD流水线不存在' });
  }
  
  const updatedPipeline = dataStore.update('cicdPipelines.json', id, {
    lastRun: new Date().toISOString(),
    lastStatus: 'running',
    updatedAt: new Date().toISOString()
  });
  
  res.json({
    success: true,
    message: 'CI/CD流水线已触发',
    runId: uuidv4(),
    triggerTime: new Date().toISOString()
  });
});

module.exports = router;
