const { logger } = require('../utils/logger');

const errorMiddleware = async (ctx, next) => {
  try {
    await next();
    
    if (ctx.status === 404) {
      ctx.status = 404;
      ctx.body = {
        success: false,
        message: '请求的资源不存在'
      };
    }
  } catch (error) {
    logger.error('请求错误:', error);
    
    ctx.status = error.status || 500;
    ctx.body = {
      success: false,
      message: error.message || '服务器内部错误',
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    };
  }
};

const validationMiddleware = (schema) => {
  return async (ctx, next) => {
    try {
      const data = ctx.request.body;
      await schema.validateAsync(data, { abortEarly: false });
      await next();
    } catch (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: '参数验证失败',
        errors
      };
    }
  };
};

module.exports = { errorMiddleware, validationMiddleware };