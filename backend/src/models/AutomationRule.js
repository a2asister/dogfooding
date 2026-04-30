const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AutomationRule = sequelize.define('AutomationRule', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  trigger_type: {
    type: DataTypes.ENUM('device_state', 'time', 'sensor_value', 'manual'),
    allowNull: false
  },
  trigger_conditions: {
    type: DataTypes.JSON,
    allowNull: false
  },
  action_type: {
    type: DataTypes.ENUM('scene', 'device', 'notification'),
    allowNull: false
  },
  action_config: {
    type: DataTypes.JSON,
    allowNull: false
  },
  is_enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'automation_rules',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = AutomationRule;