const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SceneDevice = sequelize.define('SceneDevice', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  scene_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'scenes',
      key: 'id'
    }
  },
  device_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'devices',
      key: 'id'
    }
  },
  target_state: {
    type: DataTypes.JSON,
    allowNull: false
  }
}, {
  tableName: 'scene_devices',
  timestamps: false
});

module.exports = SceneDevice;