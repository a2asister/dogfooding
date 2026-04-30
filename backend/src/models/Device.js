const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Device = sequelize.define('Device', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('light', 'appliance', 'window', 'door', 'security', 'sensor'),
    allowNull: false
  },
  brand: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  model: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('online', 'offline', 'error'),
    defaultValue: 'offline'
  },
  state: {
    type: DataTypes.JSON,
    allowNull: true
  },
  location: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  room: {
    type: DataTypes.STRING(100),
    allowNull: true
  }
}, {
  tableName: 'devices',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Device;