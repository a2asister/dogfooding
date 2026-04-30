const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TimedTask = sequelize.define('TimedTask', {
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
  cron_expression: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  scene_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'scenes',
      key: 'id'
    }
  },
  device_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'devices',
      key: 'id'
    }
  },
  target_state: {
    type: DataTypes.JSON,
    allowNull: true
  },
  is_enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  last_run: {
    type: DataTypes.DATE,
    allowNull: true
  },
  next_run: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'timed_tasks',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = TimedTask;