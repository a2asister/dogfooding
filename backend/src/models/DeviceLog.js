const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const DeviceLog = sequelize.define('DeviceLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  device_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'devices',
      key: 'id'
    }
  },
  action: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  previous_state: {
    type: DataTypes.JSON,
    allowNull: true
  },
  new_state: {
    type: DataTypes.JSON,
    allowNull: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  trigger_type: {
    type: DataTypes.ENUM('manual', 'timer', 'automation', 'system'),
    defaultValue: 'manual'
  }
}, {
  tableName: 'device_logs',
  timestamps: true,
  updatedAt: false,
  createdAt: 'created_at'
});

module.exports = DeviceLog;