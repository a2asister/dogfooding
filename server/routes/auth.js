const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

router.post('/register', async (req, res) => {
  try {
    const { username, email, password, name } = req.body;
    
    const existingUser = await User.findOne({
      $or: [{ username }, { email }]
    });
    
    if (existingUser) {
      return res.status(400).json({ error: '用户名或邮箱已存在' });
    }
    
    const user = new User({
      username,
      email,
      password,
      name: name || username,
      roles: ['user']
    });
    
    await user.save();
    
    const token = jwt.sign(
      { userId: user._id, username: user.username, roles: user.roles },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      message: '注册成功',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
        roles: user.roles
      },
      token
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const user = await User.findOne({
      $or: [{ username }, { email: username }]
    });
    
    if (!user) {
      return res.status(401).json({ error: '用户不存在' });
    }
    
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: '密码错误' });
    }
    
    if (!user.isActive) {
      return res.status(401).json({ error: '账号已被禁用' });
    }
    
    const token = jwt.sign(
      { userId: user._id, username: user.username, roles: user.roles },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      message: '登录成功',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
        roles: user.roles,
        department: user.department
      },
      token
    });
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/refresh', async (req, res) => {
  try {
    const { token } = req.body;
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ error: '用户不存在' });
    }
    
    const newToken = jwt.sign(
      { userId: user._id, username: user.username, roles: user.roles },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      token: newToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
        roles: user.roles
      }
    });
  } catch (error) {
    res.status(401).json({ error: 'Token 无效' });
  }
});

module.exports = router;
