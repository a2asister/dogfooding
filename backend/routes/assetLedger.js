const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const dataStore = require('../utils/dataStore');
const { checkPermission } = require('../middleware/auth');

router.get('/', checkPermission(['ledger:view']), (req, res) => {
  const ledger = dataStore.getAll('assetLedger.json');
  res.json({
    success: true,
    data: ledger,
    total: ledger.length
  });
});

router.get('/summary', checkPermission(['ledger:view']), (req, res) => {
  const codeRepos = dataStore.getAll('codeRepos.json');
  const apiDocs = dataStore.getAll('apiDocs.json');
  const designResources = dataStore.getAll('designResources.json');
  const testCases = dataStore.getAll('testCases.json');
  const deployments = dataStore.getAll('deploymentRecords.json');
  const gitIntegrations = dataStore.getAll('gitIntegrations.json');
  const cicdPipelines = dataStore.getAll('cicdPipelines.json');
  const cloudServices = dataStore.getAll('cloudServices.json');
  
  const summary = {
    totalAssets: codeRepos.length + apiDocs.length + designResources.length + testCases.length + deployments.length + gitIntegrations.length + cicdPipelines.length + cloudServices.length,
    byType: {
      codeRepos: { count: codeRepos.length, label: '代码仓库' },
      apiDocs: { count: apiDocs.length, label: 'API文档' },
      designResources: { count: designResources.length, label: '设计资源' },
      testCases: { count: testCases.length, label: '测试用例' },
      deployments: { count: deployments.length, label: '部署记录' },
      gitIntegrations: { count: gitIntegrations.length, label: 'Git集成' },
      cicdPipelines: { count: cicdPipelines.length, label: 'CI/CD流水线' },
      cloudServices: { count: cloudServices.length, label: '云服务' }
    },
    status: {
      active: codeRepos.filter(r => r.status === 'active').length + 
              apiDocs.filter(d => d.status === 'published').length +
              cloudServices.filter(s => s.status === 'active').length,
      draft: apiDocs.filter(d => d.status === 'draft').length +
             testCases.filter(t => t.status === 'draft').length,
      pending: deployments.filter(d => d.status === 'pending').length
    },
    lastUpdated: new Date().toISOString()
  };
  
  res.json({
    success: true,
    data: summary
  });
});

router.get('/:id', checkPermission(['ledger:view']), (req, res) => {
  const { id } = req.params;
  const ledger = dataStore.getById('assetLedger.json', id);
  
  if (!ledger) {
    return res.status(404).json({ error: '资产台账记录不存在' });
  }
  
  res.json({
    success: true,
    data: ledger
  });
});

router.post('/generate', checkPermission(['ledger:create']), (req, res) => {
  const { assetType, assetId, action, description } = req.body;
  
  const newRecord = {
    id: uuidv4(),
    assetType,
    assetId,
    action,
    description,
    operator: req.user.username,
    timestamp: new Date().toISOString(),
    createdAt: new Date().toISOString()
  };
  
  dataStore.create('assetLedger.json', newRecord);
  
  res.status(201).json({
    success: true,
    message: '资产台账记录创建成功',
    data: newRecord
  });
});

router.post('/auto-generate', checkPermission(['ledger:create']), (req, res) => {
  const codeRepos = dataStore.getAll('codeRepos.json');
  const apiDocs = dataStore.getAll('apiDocs.json');
  const designResources = dataStore.getAll('designResources.json');
  const testCases = dataStore.getAll('testCases.json');
  const deployments = dataStore.getAll('deploymentRecords.json');
  
  const records = [];
  
  codeRepos.forEach(repo => {
    records.push({
      id: uuidv4(),
      assetType: 'code_repo',
      assetId: repo.id,
      action: 'register',
      description: `注册代码仓库: ${repo.name}`,
      operator: repo.createdBy || 'system',
      timestamp: repo.createdAt,
      createdAt: new Date().toISOString()
    });
  });
  
  apiDocs.forEach(doc => {
    records.push({
      id: uuidv4(),
      assetType: 'api_doc',
      assetId: doc.id,
      action: 'register',
      description: `注册API文档: ${doc.title}`,
      operator: doc.createdBy || 'system',
      timestamp: doc.createdAt,
      createdAt: new Date().toISOString()
    });
  });
  
  designResources.forEach(resource => {
    records.push({
      id: uuidv4(),
      assetType: 'design_resource',
      assetId: resource.id,
      action: 'register',
      description: `注册设计资源: ${resource.name}`,
      operator: resource.createdBy || 'system',
      timestamp: resource.createdAt,
      createdAt: new Date().toISOString()
    });
  });
  
  testCases.forEach(testCase => {
    records.push({
      id: uuidv4(),
      assetType: 'test_case',
      assetId: testCase.id,
      action: 'register',
      description: `注册测试用例: ${testCase.title}`,
      operator: testCase.createdBy || 'system',
      timestamp: testCase.createdAt,
      createdAt: new Date().toISOString()
    });
  });
  
  deployments.forEach(deployment => {
    records.push({
      id: uuidv4(),
      assetType: 'deployment',
      assetId: deployment.id,
      action: deployment.status === 'success' ? 'deploy_success' : 'deploy_' + deployment.status,
      description: `部署记录: ${deployment.environment} - ${deployment.version}`,
      operator: deployment.deployer || 'system',
      timestamp: deployment.createdAt,
      createdAt: new Date().toISOString()
    });
  });
  
  const currentLedger = dataStore.getAll('assetLedger.json');
  const allRecords = [...currentLedger, ...records];
  dataStore.writeData('assetLedger.json', { items: allRecords });
  
  res.json({
    success: true,
    message: `自动生成 ${records.length} 条资产台账记录`,
    count: records.length,
    timestamp: new Date().toISOString()
  });
});

router.delete('/:id', checkPermission(['ledger:delete']), (req, res) => {
  const { id } = req.params;
  
  const deleted = dataStore.remove('assetLedger.json', id);
  
  if (!deleted) {
    return res.status(404).json({ error: '资产台账记录不存在' });
  }
  
  res.json({
    success: true,
    message: '资产台账记录删除成功'
  });
});

module.exports = router;
