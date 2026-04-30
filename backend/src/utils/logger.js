const winston = require('winston');
const config = require('../config');

const logger = winston.createLogger({
  level: config.logger.level,
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'smart-home-backend' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new winston.transports.File({
      filename: config.logger.file,
      maxsize: 5242880,
      maxFiles: 5
    })
  ]
});

const logToDatabase = async (level, module, message, details = null) => {
  try {
    const { SystemLog } = require('../models');
    await SystemLog.create({
      level,
      module,
      message,
      details
    });
  } catch (error) {
    logger.error('记录日志到数据库失败:', error);
  }
};

module.exports = { logger, logToDatabase };