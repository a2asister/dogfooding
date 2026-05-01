const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const dataStore = require('../utils/dataStore');
const { checkPermission } = require('../middleware/auth');

router.get('/', checkPermission(['git_integration:view']), (req, res) => {
  const integrations = dataStore.getAll('gitIntegrations.json');
  res.json({
    success: true,
    data: integrations,
    total: integrations.length
  });
});

router.get('/:id', checkPermission(['git_integration:view']), (req, res) => {
  const { id } = req.params;
  const integration = dataStore.getById('gitIntegrations.json', id);
  
  if (!integration) {
    return res.status(404).json({ error: 'Git集成配置不存在' });
  }
  
  res.json({
    success: true,
    data: {
      id: integration.id,
      name: integration.name,
      provider: integration.provider,
      repoUrl: integration.repoUrl,
      branch: integration.branch,
      status: integration.status,
      projectId: integration.projectId,
      createdAt: integration.createdAt,
      updatedAt: integration.updatedAt
    }
  });
});

router.post('/', checkPermission(['git_integration:create']), (req, res) => {
  const { name, provider, repoUrl, branch, token, username, projectId, status } = req.body;
  
  const newIntegration = {
    id: uuidv4(),
    name,
    provider: provider || 'github',
    repoUrl,
    branch: branch || 'main',
    token: token ? `masked_${token.slice(-4)}` : '',
    username: username || '',
    projectId,
    status: status || 'active',
    webhookSecret: uuidv4().slice(0, 16),
    createdBy: req.user.username,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  dataStore.create('gitIntegrations.json', newIntegration);
  
  res.status(201).json({
    success: true,
    message: 'Git集成创建成功',
    data: {
      id: newIntegration.id,
      name: newIntegration.name,
      provider: newIntegration.provider,
      repoUrl: newIntegration.repoUrl,
      branch: newIntegration.branch,
      status: newIntegration.status,
      webhookSecret: newIntegration.webhookSecret
    }
  });
});

router.put('/:id', checkPermission(['git_integration:edit']), (req, res) => {
  const { id } = req.params;
  const { name, provider, repoUrl, branch, token, username, status } = req.body;
  
  const updateData = {
    name,
    provider,
    repoUrl,
    branch,
    username,
    status,
    updatedAt: new Date().toISOString()
  };
  
  if (token) {
    updateData.token = `masked_${token.slice(-4)}`;
  }
  
  const updatedIntegration = dataStore.update('gitIntegrations.json', id, updateData);
  
  if (!updatedIntegration) {
    return res.status(404).json({ error: 'Git集成配置不存在' });
  }
  
  res.json({
    success: true,
    message: 'Git集成更新成功',
    data: {
      id: updatedIntegration.id,
      name: updatedIntegration.name,
      provider: updatedIntegration.provider,
      repoUrl: updatedIntegration.repoUrl,
      branch: updatedIntegration.branch,
      status: updatedIntegration.status
    }
  });
});

router.delete('/:id', checkPermission(['git_integration:delete']), (req, res) => {
  const { id } = req.params;
  
  const deleted = dataStore.remove('gitIntegrations.json', id);
  
  if (!deleted) {
    return res.status(404).json({ error: 'Git集成配置不存在' });
  }
  
  res.json({
    success: true,
    message: 'Git集成删除成功'
  });
});

router.post('/webhook/:integrationId', (req, res) => {
  const { integrationId } = req.params;
  const integration = dataStore.getById('gitIntegrations.json', integrationId);
  
  if (!integration) {
    return res.status(404).json({ error: '集成配置不存在' });
  }
  
  const event = req.headers['x-github-event'] || req.headers['x-gitlab-event'] || 'unknown';
  const payload = req.body;
  
  console.log(`Webhook received for ${integrationId}:`, { event, timestamp: new Date().toISOString() });
  
  res.json({
    success: true,
    message: 'Webhook已接收',
    event,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
