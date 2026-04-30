const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Alert = sequelize.define('Alert', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  device_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'devices',
      key: 'id'
    }
  },
  alert_type: {
    type: DataTypes.ENUM('device_offline', 'device_error', 'security_alert', 'high_energy', 'system'),
    allowNull: false
  },
  severity: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    defaultValue: 'medium'
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  is_read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  is_resolved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  resolved_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'alerts',
  timestamps: true,
  updatedAt: false,
  createdAt: 'created_at'
});

module.exports = Alert;