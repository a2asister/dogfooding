import { Request, Response } from 'express';
import Alert from '../models/Alert';
import MonitoringPoint from '../models/MonitoringPoint';
import PollutionEvent from '../models/PollutionEvent';
import { Op } from 'sequelize';
import logger from '../utils/logger';

export const getAllAlerts = async (req: Request, res: Response) => {
  try {
    const { alertType, isHandled, isRead, level, page = 1, limit = 20 } = req.query;
    
    const where: any = {};
    
    if (alertType) {
      where.alert_type = alertType;
    }
    
    if (isHandled !== undefined) {
      where.is_handled = isHandled === 'true';
    }
    
    if (isRead !== undefined) {
      where.is_read = isRead === 'true';
    }
    
    if (level) {
      where.level = level;
    }

    const offset = (Number(page) - 1) * Number(limit);
    
    const { count, rows } = await Alert.findAndCountAll({
      where,
      include: [
        {
          model: MonitoringPoint,
          as: 'monitoringPoint',
          attributes: ['id', 'name', 'status'],
        },
        {
          model: PollutionEvent,
          as: 'pollutionEvent',
          attributes: ['id', 'event_type', 'severity', 'status'],
        },
      ],
      limit: Number(limit),
      offset,
      order: [['triggered_at', 'DESC']],
    });

    res.json({
      success: true,
      data: {
        alerts: rows,
        pagination: {
          total: count,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(count / Number(limit)),
        },
      },
    });
  } catch (error) {
    logger.error('获取预警列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取预警列表失败',
    });
  }
};

export const getAlertById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const alert = await Alert.findByPk(id, {
      include: [
        {
          model: MonitoringPoint,
          as: 'monitoringPoint',
          attributes: ['id', 'name', 'status'],
        },
        {
          model: PollutionEvent,
          as: 'pollutionEvent',
          attributes: ['id', 'event_type', 'severity', 'description', 'status'],
        },
      ],
    });
    
    if (!alert) {
      res.status(404).json({
        success: false,
        message: '预警不存在',
      });
      return;
    }

    res.json({
      success: true,
      data: alert,
    });
  } catch (error) {
    logger.error('获取预警详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取预警详情失败',
    });
  }
};

export const createAlert = async (req: Request, res: Response) => {
  try {
    const {
      monitoring_point_id,
      pollution_event_id,
      alert_type,
      message,
      level,
    } = req.body;
    
    if (!monitoring_point_id || !alert_type || !message || !level) {
      res.status(400).json({
        success: false,
        message: '缺少必要参数',
      });
      return;
    }

    const monitoringPoint = await MonitoringPoint.findByPk(monitoring_point_id);
    if (!monitoringPoint) {
      res.status(404).json({
        success: false,
        message: '监测点不存在',
      });
      return;
    }

    const alert = await Alert.create({
      monitoring_point_id,
      pollution_event_id,
      alert_type,
      message,
      level,
    });

    logger.info(`创建预警: ${message}`);

    res.status(201).json({
      success: true,
      data: alert,
      message: '预警创建成功',
    });
  } catch (error) {
    logger.error('创建预警失败:', error);
    res.status(500).json({
      success: false,
      message: '创建预警失败',
    });
  }
};

export const updateAlert = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { is_read, is_handled } = req.body;
    
    const alert = await Alert.findByPk(id);
    
    if (!alert) {
      res.status(404).json({
        success: false,
        message: '预警不存在',
      });
      return;
    }

    const updateData: any = {};
    if (is_read !== undefined) {
      updateData.is_read = is_read;
    }
    if (is_handled !== undefined) {
      updateData.is_handled = is_handled;
      if (is_handled) {
        updateData.handled_at = new Date();
      }
    }

    await alert.update(updateData);

    logger.info(`更新预警: ${id}`);

    res.json({
      success: true,
      data: alert,
      message: '预警更新成功',
    });
  } catch (error) {
    logger.error('更新预警失败:', error);
    res.status(500).json({
      success: false,
      message: '更新预警失败',
    });
  }
};

export const getAlertsStatistics = async (req: Request, res: Response) => {
  try {
    const [infoCount, warningCount, dangerCount, unhandledCount, unreadCount] = await Promise.all([
      Alert.count({ where: { alert_type: 'info' } }),
      Alert.count({ where: { alert_type: 'warning' } }),
      Alert.count({ where: { alert_type: 'danger' } }),
      Alert.count({ where: { is_handled: false } }),
      Alert.count({ where: { is_read: false } }),
    ]);

    res.json({
      success: true,
      data: {
        total: infoCount + warningCount + dangerCount,
        info: infoCount,
        warning: warningCount,
        danger: dangerCount,
        unhandled: unhandledCount,
        unread: unreadCount,
      },
    });
  } catch (error) {
    logger.error('获取预警统计失败:', error);
    res.status(500).json({
      success: false,
      message: '获取预警统计失败',
    });
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const alert = await Alert.findByPk(id);
    
    if (!alert) {
      res.status(404).json({
        success: false,
        message: '预警不存在',
      });
      return;
    }

    await alert.update({ is_read: true });

    res.json({
      success: true,
      message: '标记为已读成功',
    });
  } catch (error) {
    logger.error('标记预警为已读失败:', error);
    res.status(500).json({
      success: false,
      message: '标记预警为已读失败',
    });
  }
};

export const handleAlert = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const alert = await Alert.findByPk(id);
    
    if (!alert) {
      res.status(404).json({
        success: false,
        message: '预警不存在',
      });
      return;
    }

    await alert.update({ is_handled: true, handled_at: new Date() });

    logger.info(`处理预警: ${id}`);

    res.json({
      success: true,
      message: '预警处理成功',
    });
  } catch (error) {
    logger.error('处理预警失败:', error);
    res.status(500).json({
      success: false,
      message: '处理预警失败',
    });
  }
};
