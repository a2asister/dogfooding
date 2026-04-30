const User = require('./User');
const Device = require('./Device');
const Scene = require('./Scene');
const SceneDevice = require('./SceneDevice');
const TimedTask = require('./TimedTask');
const AutomationRule = require('./AutomationRule');
const DeviceLog = require('./DeviceLog');
const EnergyStat = require('./EnergyStat');
const Alert = require('./Alert');
const SystemLog = require('./SystemLog');

// 定义模型关系
Scene.belongsToMany(Device, {
  through: SceneDevice,
  foreignKey: 'scene_id',
  otherKey: 'device_id'
});

Device.belongsToMany(Scene, {
  through: SceneDevice,
  foreignKey: 'device_id',
  otherKey: 'scene_id'
});

Scene.hasMany(SceneDevice, {
  foreignKey: 'scene_id',
  as: 'sceneDevices'
});

SceneDevice.belongsTo(Scene, {
  foreignKey: 'scene_id'
});

Device.hasMany(SceneDevice, {
  foreignKey: 'device_id',
  as: 'sceneDevices'
});

SceneDevice.belongsTo(Device, {
  foreignKey: 'device_id'
});

Device.hasMany(DeviceLog, {
  foreignKey: 'device_id',
  as: 'logs'
});

DeviceLog.belongsTo(Device, {
  foreignKey: 'device_id'
});

User.hasMany(DeviceLog, {
  foreignKey: 'user_id',
  as: 'deviceLogs'
});

DeviceLog.belongsTo(User, {
  foreignKey: 'user_id'
});

Device.hasMany(EnergyStat, {
  foreignKey: 'device_id',
  as: 'energyStats'
});

EnergyStat.belongsTo(Device, {
  foreignKey: 'device_id'
});

Device.hasMany(Alert, {
  foreignKey: 'device_id',
  as: 'alerts'
});

Alert.belongsTo(Device, {
  foreignKey: 'device_id'
});

// TimedTask 关联关系
TimedTask.belongsTo(Scene, {
  foreignKey: 'scene_id',
  as: 'Scene'
});

TimedTask.belongsTo(Device, {
  foreignKey: 'device_id',
  as: 'Device'
});

Scene.hasMany(TimedTask, {
  foreignKey: 'scene_id',
  as: 'timedTasks'
});

Device.hasMany(TimedTask, {
  foreignKey: 'device_id',
  as: 'timedTasks'
});

module.exports = {
  User,
  Device,
  Scene,
  SceneDevice,
  TimedTask,
  AutomationRule,
  DeviceLog,
  EnergyStat,
  Alert,
  SystemLog
};