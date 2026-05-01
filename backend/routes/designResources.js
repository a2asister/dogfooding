const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const dataStore = require('../utils/dataStore');
const { checkPermission } = require('../middleware/auth');

router.get('/', checkPermission(['design:view']), (req, res) => {
  const resources = dataStore.getAll('designResources.json');
  res.json({
    success: true,
    data: resources,
    total: resources.length
  });
});

router.get('/:id', checkPermission(['design:view']), (req, res) => {
  const { id } = req.params;
  const resource = dataStore.getById('designResources.json', id);
  
  if (!resource) {
    return res.status(404).json({ error: '设计资源不存在' });
  }
  
  res.json({
    success: true,
    data: resource
  });
});

router.post('/', checkPermission(['design:create']), (req, res) => {
  const { name, description, type, projectId, status, tags, url, fileUrl, version } = req.body;
  
  const newResource = {
    id: uuidv4(),
    name,
    description,
    type: type || 'figma',
    projectId,
    status: status || 'draft',
    tags: tags || [],
    url,
    fileUrl,
    version: version || '1.0.0',
    createdBy: req.user.username,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  dataStore.create('designResources.json', newResource);
  
  res.status(201).json({
    success: true,
    message: '设计资源创建成功',
    data: newResource
  });
});

router.put('/:id', checkPermission(['design:edit']), (req, res) => {
  const { id } = req.params;
  const { name, description, type, status, tags, url, fileUrl, version } = req.body;
  
  const updatedResource = dataStore.update('designResources.json', id, {
    name,
    description,
    type,
    status,
    tags,
    url,
    fileUrl,
    version,
    updatedAt: new Date().toISOString()
  });
  
  if (!updatedResource) {
    return res.status(404).json({ error: '设计资源不存在' });
  }
  
  res.json({
    success: true,
    message: '设计资源更新成功',
    data: updatedResource
  });
});

router.delete('/:id', checkPermission(['design:delete']), (req, res) => {
  const { id } = req.params;
  
  const deleted = dataStore.remove('designResources.json', id);
  
  if (!deleted) {
    return res.status(404).json({ error: '设计资源不存在' });
  }
  
  res.json({
    success: true,
    message: '设计资源删除成功'
  });
});

module.exports = router;
