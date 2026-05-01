const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const dataStore = require('../utils/dataStore');
const { checkPermission } = require('../middleware/auth');

router.get('/', checkPermission(['code_repo:view']), (req, res) => {
  const repos = dataStore.getAll('codeRepos.json');
  res.json({
    success: true,
    data: repos,
    total: repos.length
  });
});

router.get('/:id', checkPermission(['code_repo:view']), (req, res) => {
  const { id } = req.params;
  const repo = dataStore.getById('codeRepos.json', id);
  
  if (!repo) {
    return res.status(404).json({ error: '代码仓库不存在' });
  }
  
  res.json({
    success: true,
    data: repo
  });
});

router.post('/', checkPermission(['code_repo:create']), (req, res) => {
  const { name, description, url, type, owner, status, tags, gitProvider } = req.body;
  
  const newRepo = {
    id: uuidv4(),
    name,
    description,
    url,
    type: type || 'git',
    owner: owner || req.user.username,
    status: status || 'active',
    tags: tags || [],
    gitProvider: gitProvider || 'github',
    createdBy: req.user.username,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  dataStore.create('codeRepos.json', newRepo);
  
  res.status(201).json({
    success: true,
    message: '代码仓库创建成功',
    data: newRepo
  });
});

router.put('/:id', checkPermission(['code_repo:edit']), (req, res) => {
  const { id } = req.params;
  const { name, description, url, type, status, tags } = req.body;
  
  const updatedRepo = dataStore.update('codeRepos.json', id, {
    name,
    description,
    url,
    type,
    status,
    tags,
    updatedAt: new Date().toISOString()
  });
  
  if (!updatedRepo) {
    return res.status(404).json({ error: '代码仓库不存在' });
  }
  
  res.json({
    success: true,
    message: '代码仓库更新成功',
    data: updatedRepo
  });
});

router.delete('/:id', checkPermission(['code_repo:delete']), (req, res) => {
  const { id } = req.params;
  
  const deleted = dataStore.remove('codeRepos.json', id);
  
  if (!deleted) {
    return res.status(404).json({ error: '代码仓库不存在' });
  }
  
  res.json({
    success: true,
    message: '代码仓库删除成功'
  });
});

module.exports = router;
