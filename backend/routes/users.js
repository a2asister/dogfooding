const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const dataStore = require('../utils/dataStore');
const { checkPermission } = require('../middleware/auth');

router.get('/', checkPermission(['user:view']), (req, res) => {
  const users = dataStore.getAll('users.json');
  const sanitizedUsers = users.map(user => ({
    id: user.id,
    username: user.username,
    name: user.name,
    email: user.email,
    role: user.role,
    permissions: user.permissions || [],
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  }));
  
  res.json({
    success: true,
    data: sanitizedUsers,
    total: sanitizedUsers.length
  });
});

router.get('/:id', checkPermission(['user:view']), (req, res) => {
  const { id } = req.params;
  const user = dataStore.getById('users.json', id);
  
  if (!user) {
    return res.status(404).json({ error: '用户不存在' });
  }
  
  const sanitizedUser = {
    id: user.id,
    username: user.username,
    name: user.name,
    email: user.email,
    role: user.role,
    permissions: user.permissions || [],
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
  
  res.json({
    success: true,
    data: sanitizedUser
  });
});

router.post('/', checkPermission(['user:create']), (req, res) => {
  const { username, password, name, email, role, permissions } = req.body;
  
  const users = dataStore.getAll('users.json');
  const existingUser = users.find(u => u.username === username);
  
  if (existingUser) {
    return res.status(400).json({ error: '用户名已存在' });
  }
  
  const hashedPassword = bcrypt.hashSync(password, 10);
  
  const newUser = {
    id: Date.now().toString(),
    username,
    password: hashedPassword,
    name,
    email,
    role: role || 'developer',
    permissions: permissions || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  dataStore.create('users.json', newUser);
  
  res.status(201).json({
    success: true,
    message: '用户创建成功',
    data: {
      id: newUser.id,
      username: newUser.username,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role
    }
  });
});

router.put('/:id', checkPermission(['user:edit']), (req, res) => {
  const { id } = req.params;
  const { name, email, role, permissions, password } = req.body;
  
  const updateData = {
    name,
    email,
    role,
    permissions,
    updatedAt: new Date().toISOString()
  };
  
  if (password) {
    updateData.password = bcrypt.hashSync(password, 10);
  }
  
  const updatedUser = dataStore.update('users.json', id, updateData);
  
  if (!updatedUser) {
    return res.status(404).json({ error: '用户不存在' });
  }
  
  res.json({
    success: true,
    message: '用户更新成功',
    data: {
      id: updatedUser.id,
      username: updatedUser.username,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role
    }
  });
});

router.delete('/:id', checkPermission(['user:delete']), (req, res) => {
  const { id } = req.params;
  
  const deleted = dataStore.remove('users.json', id);
  
  if (!deleted) {
    return res.status(404).json({ error: '用户不存在' });
  }
  
  res.json({
    success: true,
    message: '用户删除成功'
  });
});

module.exports = router;
