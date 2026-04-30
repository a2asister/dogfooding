const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const EnergyStat = sequelize.define('EnergyStat', {
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
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  energy_consumed: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  power_on_time: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'energy_stats',
  timestamps: true,
  updatedAt: false,
  createdAt: 'created_at'
});

module.exports = EnergyStat;