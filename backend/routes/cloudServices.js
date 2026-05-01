const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const dataStore = require('../utils/dataStore');
const { checkPermission } = require('../middleware/auth');

router.get('/', checkPermission(['cloud:view']), (req, res) => {
  const services = dataStore.getAll('cloudServices.json');
  res.json({
    success: true,
    data: services,
    total: services.length
  });
});

router.get('/:id', checkPermission(['cloud:view']), (req, res) => {
  const { id } = req.params;
  const service = dataStore.getById('cloudServices.json', id);
  
  if (!service) {
    return res.status(404).json({ error: '云服务配置不存在' });
  }
  
  res.json({
    success: true,
    data: {
      id: service.id,
      name: service.name,
      provider: service.provider,
      serviceType: service.serviceType,
      region: service.region,
      status: service.status,
      projectId: service.projectId,
      createdAt: service.createdAt,
      updatedAt: service.updatedAt
    }
  });
});

router.post('/', checkPermission(['cloud:create']), (req, res) => {
  const { name, provider, serviceType, region, accessKey, secretKey, projectId, status, config } = req.body;
  
  const newService = {
    id: uuidv4(),
    name,
    provider: provider || 'aws',
    serviceType: serviceType || 'ec2',
    region: region || 'us-east-1',
    accessKey: accessKey ? `AKIA_${accessKey.slice(-4)}` : '',
    projectId,
    status: status || 'active',
    config: config || {},
    createdBy: req.user.username,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  dataStore.create('cloudServices.json', newService);
  
  res.status(201).json({
    success: true,
    message: '云服务配置创建成功',
    data: {
      id: newService.id,
      name: newService.name,
      provider: newService.provider,
      serviceType: newService.serviceType,
      region: newService.region,
      status: newService.status
    }
  });
});

router.put('/:id', checkPermission(['cloud:edit']), (req, res) => {
  const { id } = req.params;
  const { name, provider, serviceType, region, accessKey, secretKey, status, config } = req.body;
  
  const updateData = {
    name,
    provider,
    serviceType,
    region,
    status,
    config,
    updatedAt: new Date().toISOString()
  };
  
  if (accessKey) {
    updateData.accessKey = `AKIA_${accessKey.slice(-4)}`;
  }
  
  const updatedService = dataStore.update('cloudServices.json', id, updateData);
  
  if (!updatedService) {
    return res.status(404).json({ error: '云服务配置不存在' });
  }
  
  res.json({
    success: true,
    message: '云服务配置更新成功',
    data: {
      id: updatedService.id,
      name: updatedService.name,
      provider: updatedService.provider,
      serviceType: updatedService.serviceType,
      region: updatedService.region,
      status: updatedService.status
    }
  });
});

router.delete('/:id', checkPermission(['cloud:delete']), (req, res) => {
  const { id } = req.params;
  
  const deleted = dataStore.remove('cloudServices.json', id);
  
  if (!deleted) {
    return res.status(404).json({ error: '云服务配置不存在' });
  }
  
  res.json({
    success: true,
    message: '云服务配置删除成功'
  });
});

router.get('/:id/status', checkPermission(['cloud:view']), (req, res) => {
  const { id } = req.params;
  const service = dataStore.getById('cloudServices.json', id);
  
  if (!service) {
    return res.status(404).json({ error: '云服务配置不存在' });
  }
  
  res.json({
    success: true,
    data: {
      id: service.id,
      name: service.name,
      provider: service.provider,
      serviceType: service.serviceType,
      region: service.region,
      status: service.status,
      checkedAt: new Date().toISOString(),
      metrics: {
        cpu: Math.random() * 100,
        memory: Math.random() * 100,
        instances: 2
      }
    }
  });
});

module.exports = router;
