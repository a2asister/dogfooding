const jwt = require('jsonwebtoken');
const config = require('../config');
const { User } = require('../models');
const { logger } = require('../utils/logger');

const authMiddleware = async (ctx, next) => {
  try {
    const authorization = ctx.headers.authorization;
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      ctx.status = 401;
      ctx.body = {
        success: false,
        message: '未提供认证令牌'
      };
      return;
    }
    
    const token = authorization.replace('Bearer ', '');
    
    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      const user = await User.findByPk(decoded.id);
      
      if (!user) {
        ctx.status = 401;
        ctx.body = {
          success: false,
          message: '用户不存在'
        };
        return;
      }
      
      ctx.state.user = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      };
      
      await next();
    } catch (jwtError) {
      logger.error('JWT 验证失败:', jwtError);
      ctx.status = 401;
      ctx.body = {
        success: false,
        message: '令牌无效或已过期'
      };
    }
  } catch (error) {
    logger.error('认证中间件错误:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: '服务器内部错误'
    };
  }
};

const requireRole = (...roles) => {
  return async (ctx, next) => {
    const user = ctx.state.user;
    
    if (!user) {
      ctx.status = 401;
      ctx.body = {
        success: false,
        message: '未认证'
      };
      return;
    }
    
    if (!roles.includes(user.role)) {
      ctx.status = 403;
      ctx.body = {
        success: false,
        message: '权限不足'
      };
      return;
    }
    
    await next();
  };
};

module.exports = { authMiddleware, requireRole };