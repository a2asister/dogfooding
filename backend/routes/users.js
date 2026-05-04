const express = require('express');
const bcrypt = require('bcryptjs');
const { readData, writeData } = require('../utils/fileStorage');
const { authenticateToken, checkPermission } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, checkPermission('system:user:read'), (req, res) => {
  try {
    const users = readData('users.json');
    const usersWithoutPassword = users.map(({ password, ...user }) => user);
    res.json({
      success: true,
      data: usersWithoutPassword
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

router.get('/:id', authenticateToken, checkPermission('system:user:read'), (req, res) => {
  try {
    const { id } = req.params;
    const users = readData('users.json');
    const user = users.find(u => u.id === id);

    if (!user) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }

    const { password, ...userWithoutPassword } = user;
    res.json({
      success: true,
      data: userWithoutPassword
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

router.post('/', authenticateToken, checkPermission('system:user:create'), async (req, res) => {
  try {
    const { username, password, name, roles, permissions, subsystems } = req.body;

    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: '用户名和密码不能为空' 
      });
    }

    const users = readData('users.json');
    
    if (users.find(u => u.username === username)) {
      return res.status(400).json({ 
        success: false, 
        message: '用户名已存在' 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: String(Date.now()),
      username,
      password: hashedPassword,
      name: name || username,
      roles: roles || [],
      permissions: permissions || [],
      subsystems: subsystems || []
    };

    users.push(newUser);
    writeData('users.json', users);

    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json({
      success: true,
      message: '用户创建成功',
      data: userWithoutPassword
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

router.put('/:id', authenticateToken, checkPermission('system:user:update'), async (req, res) => {
  try {
    const { id } = req.params;
    const { password, name, roles, permissions, subsystems } = req.body;

    const users = readData('users.json');
    const userIndex = users.findIndex(u => u.id === id);

    if (userIndex === -1) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }

    const updatedUser = { ...users[userIndex] };
    
    if (name) updatedUser.name = name;
    if (roles) updatedUser.roles = roles;
    if (permissions) updatedUser.permissions = permissions;
    if (subsystems) updatedUser.subsystems = subsystems;
    if (password) {
      updatedUser.password = await bcrypt.hash(password, 10);
    }

    users[userIndex] = updatedUser;
    writeData('users.json', users);

    const { password: _, ...userWithoutPassword } = updatedUser;
    res.json({
      success: true,
      message: '用户更新成功',
      data: userWithoutPassword
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

router.delete('/:id', authenticateToken, checkPermission('system:user:delete'), (req, res) => {
  try {
    const { id } = req.params;
    const users = readData('users.json');
    const userIndex = users.findIndex(u => u.id === id);

    if (userIndex === -1) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }

    users.splice(userIndex, 1);
    writeData('users.json', users);

    res.json({
      success: true,
      message: '用户删除成功'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

module.exports = router;
