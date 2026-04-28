// 导入所有模型
const { Reservation, RESERVATION_STATUS, RESERVATION_CHANNEL } = require('./Reservation');
const { AccessLog } = require('./AccessLog');
const { sequelize, Sequelize } = require('../config/database');

// 导出模型和配置
module.exports = {
  // 数据库实例
  sequelize,
  Sequelize,
  
  // 模型
  Reservation,
  AccessLog,
  
  // 枚举
  RESERVATION_STATUS,
  RESERVATION_CHANNEL
};
