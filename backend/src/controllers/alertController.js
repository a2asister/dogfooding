const { Alert, Device } = require('../models');
const { logger, logToDatabase } = require('../utils/logger');
const { Op } = require('sequelize');

const getAllAlerts = async (ctx) => {
  try {
    const { is_read, is_resolved, severity, alert_type, page = 1, pageSize = 10 } = ctx.query;
    
    const where = {};
    if (is_read !== undefined) where.is_read = is_read === 'true';
    if (is_resolved !== undefined) where.is_resolved = is_resolved === 'true';
    if (severity) where.severity = severity;
    if (alert_type) where.alert_type = alert_type;
    
    const offset = (page - 1) * pageSize;
    const limit = parseInt(pageSize);
    
    const { count, rows: alerts } = await Alert.findAndCountAll({
      where,
      include: [{ model: Device, attributes: ['id', 'name', 'type'] }],
      offset,
      limit,
      order: [['created_at', 'DESC']]
    });
    
    ctx.body = {
      success: true,
      data: {
        alerts,
        pagination: {
          page: parseInt(page),
          pageSize: limit,
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      }
    };
  } catch (error) {
    logger.error('获取告警列表错误:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: '获取告警列表失败'
    };
  }
};

const getAlertById = async (ctx) => {
  try {
    const { id } = ctx.params;
    const alert = await Alert.findByPk(id, {
      include: [{ model: Device, attributes: ['id', 'name', 'type', 'state'] }]
    });
    
    if (!alert) {
      ctx.status = 404;
      ctx.body = {
        success: false,
        message: '告警不存在'
      };
      return;
    }
    
    if (!alert.is_read) {
      await alert.update({ is_read: true });
    }
    
    ctx.body = {
      success: true,
      data: alert
    };
  } catch (error) {
    logger.error('获取告警详情错误:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: '获取告警详情失败'
    };
  }
};

const markAsRead = async (ctx) => {
  try {
    const { id } = ctx.params;
    
    const alert = await Alert.findByPk(id);
    
    if (!alert) {
      ctx.status = 404;
      ctx.body = {
        success: false,
        message: '告警不存在'
      };
      return;
    }
    
    await alert.update({ is_read: true });
    
    logger.info(`用户 ${ctx.state.user.username} 标记告警为已读: ${alert.title}`);
    
    ctx.body = {
      success: true,
      message: '告警已标记为已读'
    };
  } catch (error) {
    logger.error('标记告警已读错误:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: '标记告警已读失败'
    };
  }
};

const markAllAsRead = async (ctx) => {
  try {
    await Alert.update(
      { is_read: true },
      { where: { is_read: false } }
    );
    
    logger.info(`用户 ${ctx.state.user.username} 标记所有告警为已读`);
    
    ctx.body = {
      success: true,
      message: '所有告警已标记为已读'
    };
  } catch (error) {
    logger.error('标记所有告警已读错误:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: '标记所有告警已读失败'
    };
  }
};

const resolveAlert = async (ctx) => {
  try {
    const { id } = ctx.params;
    
    const alert = await Alert.findByPk(id);
    
    if (!alert) {
      ctx.status = 404;
      ctx.body = {
        success: false,
        message: '告警不存在'
      };
      return;
    }
    
    await alert.update({ 
      is_resolved: true,
      resolved_at: new Date()
    });
    
    logger.info(`用户 ${ctx.state.user.username} 处理了告警: ${alert.title}`);
    
    ctx.body = {
      success: true,
      message: '告警已处理'
    };
  } catch (error) {
    logger.error('处理告警错误:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: '处理告警失败'
    };
  }
};

const getAlertStats = async (ctx) => {
  try {
    const totalAlerts = await Alert.count();
    const unreadAlerts = await Alert.count({ where: { is_read: false } });
    const unresolvedAlerts = await Alert.count({ where: { is_resolved: false } });
    
    const bySeverity = await Alert.findAll({
      attributes: ['severity', [Alert.sequelize.fn('COUNT', Alert.sequelize.col('id')), 'count']],
      group: ['severity']
    });
    
    const byType = await Alert.findAll({
      attributes: ['alert_type', [Alert.sequelize.fn('COUNT', Alert.sequelize.col('id')), 'count']],
      group: ['alert_type']
    });
    
    ctx.body = {
      success: true,
      data: {
        total: totalAlerts,
        unread: unreadAlerts,
        unresolved: unresolvedAlerts,
        bySeverity,
        byType
      }
    };
  } catch (error) {
    logger.error('获取告警统计错误:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: '获取告警统计失败'
    };
  }
};

module.exports = {
  getAllAlerts,
  getAlertById,
  markAsRead,
  markAllAsRead,
  resolveAlert,
  getAlertStats
};