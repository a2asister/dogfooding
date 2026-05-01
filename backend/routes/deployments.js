const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const dataStore = require('../utils/dataStore');
const { checkPermission } = require('../middleware/auth');

router.get('/', checkPermission(['deployment:view']), (req, res) => {
  const deployments = dataStore.getAll('deploymentRecords.json');
  res.json({
    success: true,
    data: deployments,
    total: deployments.length
  });
});

router.get('/:id', checkPermission(['deployment:view']), (req, res) => {
  const { id } = req.params;
  const deployment = dataStore.getById('deploymentRecords.json', id);
  
  if (!deployment) {
    return res.status(404).json({ error: '部署记录不存在' });
  }
  
  res.json({
    success: true,
    data: deployment
  });
});

router.post('/', checkPermission(['deployment:create']), (req, res) => {
  const { projectId, environment, version, commitHash, branch, status, cloudProvider, region, instanceCount, deployer, logs } = req.body;
  
  const newDeployment = {
    id: uuidv4(),
    projectId,
    environment: environment || 'staging',
    version: version || '1.0.0',
    commitHash: commitHash || '',
    branch: branch || 'main',
    status: status || 'pending',
    cloudProvider: cloudProvider || 'aws',
    region: region || 'us-east-1',
    instanceCount: instanceCount || 1,
    deployer: deployer || req.user.username,
    logs: logs || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    completedAt: status === 'success' ? new Date().toISOString() : null
  };
  
  dataStore.create('deploymentRecords.json', newDeployment);
  
  res.status(201).json({
    success: true,
    message: '部署记录创建成功',
    data: newDeployment
  });
});

router.put('/:id', checkPermission(['deployment:edit']), (req, res) => {
  const { id } = req.params;
  const { status, logs } = req.body;
  
  const updateData = {
    status,
    logs,
    updatedAt: new Date().toISOString()
  };
  
  if (status === 'success' || status === 'failed') {
    updateData.completedAt = new Date().toISOString();
  }
  
  const updatedDeployment = dataStore.update('deploymentRecords.json', id, updateData);
  
  if (!updatedDeployment) {
    return res.status(404).json({ error: '部署记录不存在' });
  }
  
  res.json({
    success: true,
    message: '部署记录更新成功',
    data: updatedDeployment
  });
});

router.delete('/:id', checkPermission(['deployment:delete']), (req, res) => {
  const { id } = req.params;
  
  const deleted = dataStore.remove('deploymentRecords.json', id);
  
  if (!deleted) {
    return res.status(404).json({ error: '部署记录不存在' });
  }
  
  res.json({
    success: true,
    message: '部署记录删除成功'
  });
});

module.exports = router;
