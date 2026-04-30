const { Device, DeviceLog } = require('../models');
const { logger, logToDatabase } = require('../utils/logger');
const { Op } = require('sequelize');

const getAllDevices = async (ctx) => {
  try {
    const { type, status, room, page = 1, pageSize = 10 } = ctx.query;
    
    const where = {};
    if (type) where.type = type;
    if (status) where.status = status;
    if (room) where.room = room;
    
    const offset = (page - 1) * pageSize;
    const limit = parseInt(pageSize);
    
    const { count, rows: devices } = await Device.findAndCountAll({
      where,
      offset,
      limit,
      order: [['created_at', 'DESC']]
    });
    
    ctx.body = {
      success: true,
      data: {
        devices,
        pagination: {
          page: parseInt(page),
          pageSize: limit,
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      }
    };
  } catch (error) {
    logger.error('获取设备列表错误:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: '获取设备列表失败'
    };
  }
};

const getDeviceById = async (ctx) => {
  try {
    const { id } = ctx.params;
    const device = await Device.findByPk(id);
    
    if (!device) {
      ctx.status = 404;
      ctx.body = {
        success: false,
        message: '设备不存在'
      };
      return;
    }
    
    ctx.body = {
      success: true,
      data: device
    };
  } catch (error) {
    logger.error('获取设备详情错误:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: '获取设备详情失败'
    };
  }
};

const createDevice = async (ctx) => {
  try {
    const { name, type, brand, model, location, room } = ctx.request.body;
    const userId = ctx.state.user.id;
    
    const device = await Device.create({
      name,
      type,
      brand,
      model,
      location,
      room,
      status: 'offline',
      state: {}
    });
    
    logger.info(`用户 ${ctx.state.user.username} 创建了设备: ${name}`);
    await logToDatabase('info', 'device', `创建设备 ${name}`, { deviceId: device.id });
    
    ctx.status = 201;
    ctx.body = {
      success: true,
      message: '设备创建成功',
      data: device
    };
  } catch (error) {
    logger.error('创建设备错误:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: '创建设备失败'
    };
  }
};

const updateDevice = async (ctx) => {
  try {
    const { id } = ctx.params;
    const { name, type, brand, model, location, room } = ctx.request.body;
    
    const device = await Device.findByPk(id);
    
    if (!device) {
      ctx.status = 404;
      ctx.body = {
        success: false,
        message: '设备不存在'
      };
      return;
    }
    
    await device.update({
      name,
      type,
      brand,
      model,
      location,
      room
    });
    
    logger.info(`用户 ${ctx.state.user.username} 更新了设备: ${device.name}`);
    await logToDatabase('info', 'device', `更新设备 ${device.name}`, { deviceId: device.id });
    
    ctx.body = {
      success: true,
      message: '设备更新成功',
      data: device
    };
  } catch (error) {
    logger.error('更新设备错误:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: '更新设备失败'
    };
  }
};

const deleteDevice = async (ctx) => {
  try {
    const { id } = ctx.params;
    
    const device = await Device.findByPk(id);
    
    if (!device) {
      ctx.status = 404;
      ctx.body = {
        success: false,
        message: '设备不存在'
      };
      return;
    }
    
    const deviceName = device.name;
    await device.destroy();
    
    logger.info(`用户 ${ctx.state.user.username} 删除了设备: ${deviceName}`);
    await logToDatabase('info', 'device', `删除设备 ${deviceName}`, { deviceId: id });
    
    ctx.body = {
      success: true,
      message: '设备删除成功'
    };
  } catch (error) {
    logger.error('删除设备错误:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: '删除设备失败'
    };
  }
};

const controlDevice = async (ctx) => {
  try {
    const { id } = ctx.params;
    const { state } = ctx.request.body;
    const userId = ctx.state.user.id;
    
    const device = await Device.findByPk(id);
    
    if (!device) {
      ctx.status = 404;
      ctx.body = {
        success: false,
        message: '设备不存在'
      };
      return;
    }
    
    const previousState = device.state;
    const newState = { ...previousState, ...state };
    
    await device.update({ state: newState });
    
    await DeviceLog.create({
      device_id: device.id,
      action: 'control',
      previous_state: previousState,
      new_state: newState,
      user_id: userId,
      trigger_type: 'manual'
    });
    
    logger.info(`用户 ${ctx.state.user.username} 控制了设备: ${device.name}, 状态: ${JSON.stringify(state)}`);
    await logToDatabase('info', 'device', `控制设备 ${device.name}`, { deviceId: device.id, state });
    
    ctx.body = {
      success: true,
      message: '设备控制成功',
      data: device
    };
  } catch (error) {
    logger.error('控制设备错误:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: '控制设备失败'
    };
  }
};

const getDeviceStats = async (ctx) => {
  try {
    const totalDevices = await Device.count();
    const onlineDevices = await Device.count({ where: { status: 'online' } });
    const offlineDevices = await Device.count({ where: { status: 'offline' } });
    const errorDevices = await Device.count({ where: { status: 'error' } });
    
    const deviceTypes = await Device.findAll({
      attributes: ['type', [Device.sequelize.fn('COUNT', Device.sequelize.col('id')), 'count']],
      group: ['type']
    });
    
    const rooms = await Device.findAll({
      attributes: ['room', [Device.sequelize.fn('COUNT', Device.sequelize.col('id')), 'count']],
      group: ['room']
    });
    
    ctx.body = {
      success: true,
      data: {
        total: totalDevices,
        online: onlineDevices,
        offline: offlineDevices,
        error: errorDevices,
        byType: deviceTypes,
        byRoom: rooms
      }
    };
  } catch (error) {
    logger.error('获取设备统计错误:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: '获取设备统计失败'
    };
  }
};

module.exports = {
  getAllDevices,
  getDeviceById,
  createDevice,
  updateDevice,
  deleteDevice,
  controlDevice,
  getDeviceStats
};