const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const dataStore = require('../utils/dataStore');
const { checkPermission } = require('../middleware/auth');

router.get('/', checkPermission(['test_case:view']), (req, res) => {
  const testCases = dataStore.getAll('testCases.json');
  res.json({
    success: true,
    data: testCases,
    total: testCases.length
  });
});

router.get('/:id', checkPermission(['test_case:view']), (req, res) => {
  const { id } = req.params;
  const testCase = dataStore.getById('testCases.json', id);
  
  if (!testCase) {
    return res.status(404).json({ error: '测试用例不存在' });
  }
  
  res.json({
    success: true,
    data: testCase
  });
});

router.post('/', checkPermission(['test_case:create']), (req, res) => {
  const { title, description, module, priority, type, preconditions, steps, expectedResult, status, tags, projectId } = req.body;
  
  const newTestCase = {
    id: uuidv4(),
    title,
    description,
    module,
    priority: priority || 'medium',
    type: type || 'functional',
    preconditions: preconditions || '',
    steps: steps || [],
    expectedResult: expectedResult || '',
    status: status || 'draft',
    tags: tags || [],
    projectId,
    createdBy: req.user.username,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  dataStore.create('testCases.json', newTestCase);
  
  res.status(201).json({
    success: true,
    message: '测试用例创建成功',
    data: newTestCase
  });
});

router.put('/:id', checkPermission(['test_case:edit']), (req, res) => {
  const { id } = req.params;
  const { title, description, module, priority, type, preconditions, steps, expectedResult, status, tags } = req.body;
  
  const updatedTestCase = dataStore.update('testCases.json', id, {
    title,
    description,
    module,
    priority,
    type,
    preconditions,
    steps,
    expectedResult,
    status,
    tags,
    updatedAt: new Date().toISOString()
  });
  
  if (!updatedTestCase) {
    return res.status(404).json({ error: '测试用例不存在' });
  }
  
  res.json({
    success: true,
    message: '测试用例更新成功',
    data: updatedTestCase
  });
});

router.delete('/:id', checkPermission(['test_case:delete']), (req, res) => {
  const { id } = req.params;
  
  const deleted = dataStore.remove('testCases.json', id);
  
  if (!deleted) {
    return res.status(404).json({ error: '测试用例不存在' });
  }
  
  res.json({
    success: true,
    message: '测试用例删除成功'
  });
});

module.exports = router;
