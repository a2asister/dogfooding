const { TimedTask, Scene, Device } = require('../models');
const { logger, logToDatabase } = require('../utils/logger');

const getAllTasks = async (ctx) => {
  try {
    const { is_enabled, page = 1, pageSize = 10 } = ctx.query;
    
    const where = {};
    if (is_enabled !== undefined) where.is_enabled = is_enabled === 'true';
    
    const offset = (page - 1) * pageSize;
    const limit = parseInt(pageSize);
    
    const { count, rows: tasks } = await TimedTask.findAndCountAll({
      where,
      include: [
        { model: Scene, attributes: ['id', 'name'] },
        { model: Device, attributes: ['id', 'name'] }
      ],
      offset,
      limit,
      order: [['created_at', 'DESC']]
    });
    
    ctx.body = {
      success: true,
      data: {
        tasks,
        pagination: {
          page: parseInt(page),
          pageSize: limit,
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      }
    };
  } catch (error) {
    logger.error('获取定时任务列表错误:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: '获取定时任务列表失败'
    };
  }
};

const getTaskById = async (ctx) => {
  try {
    const { id } = ctx.params;
    const task = await TimedTask.findByPk(id, {
      include: [
        { model: Scene, attributes: ['id', 'name'] },
        { model: Device, attributes: ['id', 'name'] }
      ]
    });
    
    if (!task) {
      ctx.status = 404;
      ctx.body = {
        success: false,
        message: '定时任务不存在'
      };
      return;
    }
    
    ctx.body = {
      success: true,
      data: task
    };
  } catch (error) {
    logger.error('获取定时任务详情错误:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: '获取定时任务详情失败'
    };
  }
};

const createTask = async (ctx) => {
  try {
    const { name, description, cron_expression, scene_id, device_id, target_state } = ctx.request.body;
    const userId = ctx.state.user.id;
    
    const task = await TimedTask.create({
      name,
      description,
      cron_expression,
      scene_id,
      device_id,
      target_state,
      is_enabled: true
    });
    
    logger.info(`用户 ${ctx.state.user.username} 创建了定时任务: ${name}`);
    await logToDatabase('info', 'timed_task', `创建定时任务 ${name}`, { taskId: task.id });
    
    ctx.status = 201;
    ctx.body = {
      success: true,
      message: '定时任务创建成功',
      data: task
    };
  } catch (error) {
    logger.error('创建定时任务错误:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: '创建定时任务失败'
    };
  }
};

const updateTask = async (ctx) => {
  try {
    const { id } = ctx.params;
    const { name, description, cron_expression, scene_id, device_id, target_state, is_enabled } = ctx.request.body;
    
    const task = await TimedTask.findByPk(id);
    
    if (!task) {
      ctx.status = 404;
      ctx.body = {
        success: false,
        message: '定时任务不存在'
      };
      return;
    }
    
    await task.update({
      name,
      description,
      cron_expression,
      scene_id,
      device_id,
      target_state,
      is_enabled
    });
    
    logger.info(`用户 ${ctx.state.user.username} 更新了定时任务: ${task.name}`);
    await logToDatabase('info', 'timed_task', `更新定时任务 ${task.name}`, { taskId: task.id });
    
    ctx.body = {
      success: true,
      message: '定时任务更新成功',
      data: task
    };
  } catch (error) {
    logger.error('更新定时任务错误:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: '更新定时任务失败'
    };
  }
};

const deleteTask = async (ctx) => {
  try {
    const { id } = ctx.params;
    
    const task = await TimedTask.findByPk(id);
    
    if (!task) {
      ctx.status = 404;
      ctx.body = {
        success: false,
        message: '定时任务不存在'
      };
      return;
    }
    
    const taskName = task.name;
    await task.destroy();
    
    logger.info(`用户 ${ctx.state.user.username} 删除了定时任务: ${taskName}`);
    await logToDatabase('info', 'timed_task', `删除定时任务 ${taskName}`, { taskId: id });
    
    ctx.body = {
      success: true,
      message: '定时任务删除成功'
    };
  } catch (error) {
    logger.error('删除定时任务错误:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: '删除定时任务失败'
    };
  }
};

const toggleTask = async (ctx) => {
  try {
    const { id } = ctx.params;
    const { is_enabled } = ctx.request.body;
    
    const task = await TimedTask.findByPk(id);
    
    if (!task) {
      ctx.status = 404;
      ctx.body = {
        success: false,
        message: '定时任务不存在'
      };
      return;
    }
    
    await task.update({ is_enabled });
    
    const status = is_enabled ? '启用' : '禁用';
    logger.info(`用户 ${ctx.state.user.username} ${status}了定时任务: ${task.name}`);
    await logToDatabase('info', 'timed_task', `${status}定时任务 ${task.name}`, { taskId: task.id });
    
    ctx.body = {
      success: true,
      message: `定时任务已${status}`,
      data: task
    };
  } catch (error) {
    logger.error('切换定时任务状态错误:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: '切换定时任务状态失败'
    };
  }
};

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  toggleTask
};