const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SystemLog = sequelize.define('SystemLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  level: {
    type: DataTypes.ENUM('debug', 'info', 'warn', 'error'),
    allowNull: false
  },
  module: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  details: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  tableName: 'system_logs',
  timestamps: true,
  updatedAt: false,
  createdAt: 'created_at'
});

module.exports = SystemLog;