import { Request, Response } from 'express';
import MonitoringPoint from '../models/MonitoringPoint';
import { Op } from 'sequelize';
import logger from '../utils/logger';

export const getAllMonitoringPoints = async (req: Request, res: Response) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;
    
    const where: any = {};
    
    if (status) {
      where.status = status;
    }
    
    if (search) {
      where.name = {
        [Op.like]: `%${search}%`,
      };
    }

    const offset = (Number(page) - 1) * Number(limit);
    
    const { count, rows } = await MonitoringPoint.findAndCountAll({
      where,
      limit: Number(limit),
      offset,
      order: [['created_at', 'DESC']],
    });

    res.json({
      success: true,
      data: {
        points: rows,
        pagination: {
          total: count,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(count / Number(limit)),
        },
      },
    });
  } catch (error) {
    logger.error('获取监测点列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取监测点列表失败',
    });
  }
};

export const getMonitoringPointById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const point = await MonitoringPoint.findByPk(id);
    
    if (!point) {
      res.status(404).json({
        success: false,
        message: '监测点不存在',
      });
      return;
    }

    res.json({
      success: true,
      data: point,
    });
  } catch (error) {
    logger.error('获取监测点详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取监测点详情失败',
    });
  }
};

export const createMonitoringPoint = async (req: Request, res: Response) => {
  try {
    const { name, latitude, longitude, status, location } = req.body;
    
    if (!name || latitude === undefined || longitude === undefined) {
      res.status(400).json({
        success: false,
        message: '缺少必要参数',
      });
      return;
    }

    const point = await MonitoringPoint.create({
      name,
      latitude,
      longitude,
      status: status || 'normal',
      location,
    });

    logger.info(`创建监测点: ${name}`);
    
    res.status(201).json({
      success: true,
      data: point,
      message: '监测点创建成功',
    });
  } catch (error) {
    logger.error('创建监测点失败:', error);
    res.status(500).json({
      success: false,
      message: '创建监测点失败',
    });
  }
};

export const updateMonitoringPoint = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, latitude, longitude, status, location } = req.body;
    
    const point = await MonitoringPoint.findByPk(id);
    
    if (!point) {
      res.status(404).json({
        success: false,
        message: '监测点不存在',
      });
      return;
    }

    await point.update({
      name,
      latitude,
      longitude,
      status,
      location,
    });

    logger.info(`更新监测点: ${id}`);

    res.json({
      success: true,
      data: point,
      message: '监测点更新成功',
    });
  } catch (error) {
    logger.error('更新监测点失败:', error);
    res.status(500).json({
      success: false,
      message: '更新监测点失败',
    });
  }
};

export const deleteMonitoringPoint = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const point = await MonitoringPoint.findByPk(id);
    
    if (!point) {
      res.status(404).json({
        success: false,
        message: '监测点不存在',
      });
      return;
    }

    await point.destroy();
    
    logger.info(`删除监测点: ${id}`);

    res.json({
      success: true,
      message: '监测点删除成功',
    });
  } catch (error) {
    logger.error('删除监测点失败:', error);
    res.status(500).json({
      success: false,
      message: '删除监测点失败',
    });
  }
};

export const getMonitoringPointsStatistics = async (req: Request, res: Response) => {
  try {
    const [normalCount, warningCount, dangerCount] = await Promise.all([
      MonitoringPoint.count({ where: { status: 'normal' } }),
      MonitoringPoint.count({ where: { status: 'warning' } }),
      MonitoringPoint.count({ where: { status: 'danger' } }),
    ]);

    res.json({
      success: true,
      data: {
        total: normalCount + warningCount + dangerCount,
        normal: normalCount,
        warning: warningCount,
        danger: dangerCount,
      },
    });
  } catch (error) {
    logger.error('获取监测点统计失败:', error);
    res.status(500).json({
      success: false,
      message: '获取监测点统计失败',
    });
  }
};
