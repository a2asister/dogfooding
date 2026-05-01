const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const dataStore = require('../utils/dataStore');
const { checkPermission } = require('../middleware/auth');

router.get('/', checkPermission(['api_doc:view']), (req, res) => {
  const docs = dataStore.getAll('apiDocs.json');
  res.json({
    success: true,
    data: docs,
    total: docs.length
  });
});

router.get('/:id', checkPermission(['api_doc:view']), (req, res) => {
  const { id } = req.params;
  const doc = dataStore.getById('apiDocs.json', id);
  
  if (!doc) {
    return res.status(404).json({ error: 'API文档不存在' });
  }
  
  res.json({
    success: true,
    data: doc
  });
});

router.post('/', checkPermission(['api_doc:create']), (req, res) => {
  const { title, description, version, type, projectId, status, tags, content, baseUrl } = req.body;
  
  const newDoc = {
    id: uuidv4(),
    title,
    description,
    version: version || '1.0.0',
    type: type || 'openapi',
    projectId,
    status: status || 'draft',
    tags: tags || [],
    content: content || '',
    baseUrl: baseUrl || '',
    createdBy: req.user.username,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  dataStore.create('apiDocs.json', newDoc);
  
  res.status(201).json({
    success: true,
    message: 'API文档创建成功',
    data: newDoc
  });
});

router.put('/:id', checkPermission(['api_doc:edit']), (req, res) => {
  const { id } = req.params;
  const { title, description, version, type, status, tags, content, baseUrl } = req.body;
  
  const updatedDoc = dataStore.update('apiDocs.json', id, {
    title,
    description,
    version,
    type,
    status,
    tags,
    content,
    baseUrl,
    updatedAt: new Date().toISOString()
  });
  
  if (!updatedDoc) {
    return res.status(404).json({ error: 'API文档不存在' });
  }
  
  res.json({
    success: true,
    message: 'API文档更新成功',
    data: updatedDoc
  });
});

router.delete('/:id', checkPermission(['api_doc:delete']), (req, res) => {
  const { id } = req.params;
  
  const deleted = dataStore.remove('apiDocs.json', id);
  
  if (!deleted) {
    return res.status(404).json({ error: 'API文档不存在' });
  }
  
  res.json({
    success: true,
    message: 'API文档删除成功'
  });
});

module.exports = router;
