const { Scene, SceneDevice, Device, DeviceLog } = require('../models');
const { logger, logToDatabase } = require('../utils/logger');

const getAllScenes = async (ctx) => {
  try {
    const { is_active, page = 1, pageSize = 10 } = ctx.query;
    
    const where = {};
    if (is_active !== undefined) where.is_active = is_active === 'true';
    
    const offset = (page - 1) * pageSize;
    const limit = parseInt(pageSize);
    
    const { count, rows: scenes } = await Scene.findAndCountAll({
      where,
      include: [{
        model: Device,
        through: { attributes: ['target_state'] },
        attributes: ['id', 'name', 'type']
      }],
      offset,
      limit,
      order: [['created_at', 'DESC']]
    });
    
    ctx.body = {
      success: true,
      data: {
        scenes,
        pagination: {
          page: parseInt(page),
          pageSize: limit,
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      }
    };
  } catch (error) {
    logger.error('获取场景列表错误:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: '获取场景列表失败'
    };
  }
};

const getSceneById = async (ctx) => {
  try {
    const { id } = ctx.params;
    const scene = await Scene.findByPk(id, {
      include: [{
        model: Device,
        through: { attributes: ['target_state'] },
        attributes: ['id', 'name', 'type', 'state']
      }]
    });
    
    if (!scene) {
      ctx.status = 404;
      ctx.body = {
        success: false,
        message: '场景不存在'
      };
      return;
    }
    
    ctx.body = {
      success: true,
      data: scene
    };
  } catch (error) {
    logger.error('获取场景详情错误:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: '获取场景详情失败'
    };
  }
};

const createScene = async (ctx) => {
  try {
    const { name, description, icon, devices } = ctx.request.body;
    const userId = ctx.state.user.id;
    
    const scene = await Scene.create({
      name,
      description,
      icon,
      is_active: true
    });
    
    if (devices && Array.isArray(devices) && devices.length > 0) {
      const seenDeviceIds = new Set();
      
      for (const deviceItem of devices) {
        if (!deviceItem.device_id) continue;
        
        if (seenDeviceIds.has(deviceItem.device_id)) {
          logger.warn(`重复的设备ID: ${deviceItem.device_id}，已跳过`);
          continue;
        }
        
        seenDeviceIds.add(deviceItem.device_id);
        
        await SceneDevice.create({
          scene_id: scene.id,
          device_id: deviceItem.device_id,
          target_state: deviceItem.target_state || {}
        });
      }
    }
    
    logger.info(`用户 ${ctx.state.user.username} 创建了场景: ${name}`);
    await logToDatabase('info', 'scene', `创建场景 ${name}`, { sceneId: scene.id });
    
    ctx.status = 201;
    ctx.body = {
      success: true,
      message: '场景创建成功',
      data: scene
    };
  } catch (error) {
    logger.error('创建场景错误:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: '创建场景失败'
    };
  }
};

const updateScene = async (ctx) => {
  try {
    const { id } = ctx.params;
    const { name, description, icon, is_active, devices } = ctx.request.body;
    
    const scene = await Scene.findByPk(id);
    
    if (!scene) {
      ctx.status = 404;
      ctx.body = {
        success: false,
        message: '场景不存在'
      };
      return;
    }
    
    await scene.update({
      name,
      description,
      icon,
      is_active
    });
    
    if (Array.isArray(devices)) {
      await SceneDevice.destroy({ where: { scene_id: id } });
      
      if (devices.length > 0) {
        const seenDeviceIds = new Set();
        
        for (const deviceItem of devices) {
          if (!deviceItem.device_id) continue;
          
          if (seenDeviceIds.has(deviceItem.device_id)) {
            logger.warn(`重复的设备ID: ${deviceItem.device_id}，已跳过`);
            continue;
          }
          
          seenDeviceIds.add(deviceItem.device_id);
          
          await SceneDevice.create({
            scene_id: scene.id,
            device_id: deviceItem.device_id,
            target_state: deviceItem.target_state || {}
          });
        }
      }
    }
    
    logger.info(`用户 ${ctx.state.user.username} 更新了场景: ${scene.name}`);
    await logToDatabase('info', 'scene', `更新场景 ${scene.name}`, { sceneId: scene.id });
    
    ctx.body = {
      success: true,
      message: '场景更新成功',
      data: scene
    };
  } catch (error) {
    logger.error('更新场景错误:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: '更新场景失败'
    };
  }
};

const deleteScene = async (ctx) => {
  try {
    const { id } = ctx.params;
    
    const scene = await Scene.findByPk(id);
    
    if (!scene) {
      ctx.status = 404;
      ctx.body = {
        success: false,
        message: '场景不存在'
      };
      return;
    }
    
    const sceneName = scene.name;
    await SceneDevice.destroy({ where: { scene_id: id } });
    await scene.destroy();
    
    logger.info(`用户 ${ctx.state.user.username} 删除了场景: ${sceneName}`);
    await logToDatabase('info', 'scene', `删除场景 ${sceneName}`, { sceneId: id });
    
    ctx.body = {
      success: true,
      message: '场景删除成功'
    };
  } catch (error) {
    logger.error('删除场景错误:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: '删除场景失败'
    };
  }
};

const executeScene = async (ctx) => {
  try {
    const { id } = ctx.params;
    const userId = ctx.state.user.id;
    
    const scene = await Scene.findByPk(id, {
      include: [{
        model: Device,
        through: { attributes: ['target_state'] }
      }]
    });
    
    if (!scene) {
      ctx.status = 404;
      ctx.body = {
        success: false,
        message: '场景不存在'
      };
      return;
    }
    
    const executedDevices = [];
    
    for (const device of scene.Devices) {
      const sceneDevice = device.SceneDevice;
      const targetState = sceneDevice.target_state;
      const previousState = device.state;
      
      await device.update({ state: { ...previousState, ...targetState } });
      
      await DeviceLog.create({
        device_id: device.id,
        action: 'scene_execution',
        previous_state: previousState,
        new_state: { ...previousState, ...targetState },
        user_id: userId,
        trigger_type: 'manual'
      });
      
      executedDevices.push({
        id: device.id,
        name: device.name,
        state: { ...previousState, ...targetState }
      });
    }
    
    logger.info(`用户 ${ctx.state.user.username} 执行了场景: ${scene.name}`);
    await logToDatabase('info', 'scene', `执行场景 ${scene.name}`, { sceneId: scene.id, devices: executedDevices });
    
    ctx.body = {
      success: true,
      message: '场景执行成功',
      data: {
        scene: scene,
        executedDevices
      }
    };
  } catch (error) {
    logger.error('执行场景错误:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: '执行场景失败'
    };
  }
};

module.exports = {
  getAllScenes,
  getSceneById,
  createScene,
  updateScene,
  deleteScene,
  executeScene
};