const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const config = require('../config');
const { logger, logToDatabase } = require('../utils/logger');

const login = async (ctx) => {
  try {
    const { username, password } = ctx.request.body;
    
    const user = await User.findOne({ where: { username } });
    
    if (!user) {
      ctx.status = 401;
      ctx.body = {
        success: false,
        message: '用户名或密码错误'
      };
      return;
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      ctx.status = 401;
      ctx.body = {
        success: false,
        message: '用户名或密码错误'
      };
      return;
    }
    
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
    
    logger.info(`用户 ${username} 登录成功`);
    await logToDatabase('info', 'auth', `用户 ${username} 登录成功`);
    
    ctx.body = {
      success: true,
      message: '登录成功',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      }
    };
  } catch (error) {
    logger.error('登录错误:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: '登录失败'
    };
  }
};

const register = async (ctx) => {
  try {
    const { username, password, email } = ctx.request.body;
    
    const existingUser = await User.findOne({ where: { username } });
    
    if (existingUser) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: '用户名已存在'
      };
      return;
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await User.create({
      username,
      password: hashedPassword,
      email,
      role: 'user'
    });
    
    logger.info(`用户 ${username} 注册成功`);
    await logToDatabase('info', 'auth', `用户 ${username} 注册成功`);
    
    ctx.status = 201;
    ctx.body = {
      success: true,
      message: '注册成功',
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    };
  } catch (error) {
    logger.error('注册错误:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: '注册失败'
    };
  }
};

const getCurrentUser = async (ctx) => {
  try {
    const user = ctx.state.user;
    
    ctx.body = {
      success: true,
      data: user
    };
  } catch (error) {
    logger.error('获取当前用户错误:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: '获取用户信息失败'
    };
  }
};

const changePassword = async (ctx) => {
  try {
    const { oldPassword, newPassword } = ctx.request.body;
    const userId = ctx.state.user.id;
    
    const user = await User.findByPk(userId);
    
    if (!user) {
      ctx.status = 404;
      ctx.body = {
        success: false,
        message: '用户不存在'
      };
      return;
    }
    
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    
    if (!isPasswordValid) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: '原密码错误'
      };
      return;
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await user.update({ password: hashedPassword });
    
    logger.info(`用户 ${user.username} 密码修改成功`);
    await logToDatabase('info', 'auth', `用户 ${user.username} 密码修改成功`);
    
    ctx.body = {
      success: true,
      message: '密码修改成功'
    };
  } catch (error) {
    logger.error('修改密码错误:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: '修改密码失败'
    };
  }
};

module.exports = {
  login,
  register,
  getCurrentUser,
  changePassword
};