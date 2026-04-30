import { Request, Response } from 'express';
import WaterQualityData from '../models/WaterQualityData';
import MonitoringPoint from '../models/MonitoringPoint';
import { Op, fn, col } from 'sequelize';
import logger from '../utils/logger';
import dayjs from 'dayjs';

export const getWaterQualityData = async (req: Request, res: Response) => {
  try {
    const { monitoringPointId, startDate, endDate, page = 1, limit = 20 } = req.query;
    
    const where: any = {};
    
    if (monitoringPointId) {
      where.monitoring_point_id = monitoringPointId;
    }
    
    if (startDate || endDate) {
      where.collected_at = {};
      if (startDate) {
        where.collected_at[Op.gte] = dayjs(startDate as string).startOf('day').toDate();
      }
      if (endDate) {
        where.collected_at[Op.lte] = dayjs(endDate as string).endOf('day').toDate();
      }
    }

    const offset = (Number(page) - 1) * Number(limit);
    
    const { count, rows } = await WaterQualityData.findAndCountAll({
      where,
      include: [
        {
          model: MonitoringPoint,
          as: 'monitoringPoint',
          attributes: ['id', 'name', 'status'],
        },
      ],
      limit: Number(limit),
      offset,
      order: [['collected_at', 'DESC']],
    });

    res.json({
      success: true,
      data: {
        data: rows,
        pagination: {
          total: count,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(count / Number(limit)),
        },
      },
    });
  } catch (error) {
    logger.error('获取水质数据失败:', error);
    res.status(500).json({
      success: false,
      message: '获取水质数据失败',
    });
  }
};

export const getLatestWaterQuality = async (req: Request, res: Response) => {
  try {
    const { monitoringPointId } = req.query;
    
    const where: any = {};
    if (monitoringPointId) {
      where.monitoring_point_id = monitoringPointId;
    }

    const latestData = await WaterQualityData.findOne({
      where,
      include: [
        {
          model: MonitoringPoint,
          as: 'monitoringPoint',
          attributes: ['id', 'name', 'status'],
        },
      ],
      order: [['collected_at', 'DESC']],
    });

    res.json({
      success: true,
      data: latestData,
    });
  } catch (error) {
    logger.error('获取最新水质数据失败:', error);
    res.status(500).json({
      success: false,
      message: '获取最新水质数据失败',
    });
  }
};

export const getWaterQualityStatistics = async (req: Request, res: Response) => {
  try {
    const { monitoringPointId, startDate, endDate } = req.query;
    
    const where: any = {};
    
    if (monitoringPointId) {
      where.monitoring_point_id = monitoringPointId;
    }
    
    if (startDate || endDate) {
      where.collected_at = {};
      if (startDate) {
        where.collected_at[Op.gte] = dayjs(startDate as string).startOf('day').toDate();
      }
      if (endDate) {
        where.collected_at[Op.lte] = dayjs(endDate as string).endOf('day').toDate();
      }
    }

    const statistics = await WaterQualityData.findOne({
      where,
      attributes: [
        [fn('AVG', col('ph')), 'avgPh'],
        [fn('MIN', col('ph')), 'minPh'],
        [fn('MAX', col('ph')), 'maxPh'],
        [fn('AVG', col('temperature')), 'avgTemperature'],
        [fn('MIN', col('temperature')), 'minTemperature'],
        [fn('MAX', col('temperature')), 'maxTemperature'],
        [fn('AVG', col('turbidity')), 'avgTurbidity'],
        [fn('MIN', col('turbidity')), 'minTurbidity'],
        [fn('MAX', col('turbidity')), 'maxTurbidity'],
        [fn('AVG', col('dissolved_oxygen')), 'avgDissolvedOxygen'],
        [fn('MIN', col('dissolved_oxygen')), 'minDissolvedOxygen'],
        [fn('MAX', col('dissolved_oxygen')), 'maxDissolvedOxygen'],
      ],
      raw: true,
    });

    res.json({
      success: true,
      data: statistics,
    });
  } catch (error) {
    logger.error('获取水质统计数据失败:', error);
    res.status(500).json({
      success: false,
      message: '获取水质统计数据失败',
    });
  }
};

export const getWaterQualityTrend = async (req: Request, res: Response) => {
  try {
    const { monitoringPointId, startDate, endDate, interval = 'hour' } = req.query;
    
    const where: any = {};
    
    if (monitoringPointId) {
      where.monitoring_point_id = monitoringPointId;
    }
    
    if (startDate || endDate) {
      where.collected_at = {};
      if (startDate) {
        where.collected_at[Op.gte] = dayjs(startDate as string).startOf('day').toDate();
      }
      if (endDate) {
        where.collected_at[Op.lte] = dayjs(endDate as string).endOf('day').toDate();
      }
    }

    const groupClause = interval === 'hour' 
      ? fn('DATE_FORMAT', col('collected_at'), '%Y-%m-%d %H:00')
      : fn('DATE_FORMAT', col('collected_at'), '%Y-%m-%d');

    const trendData = await WaterQualityData.findAll({
      where,
      attributes: [
        [groupClause, 'time'],
        [fn('AVG', col('ph')), 'ph'],
        [fn('AVG', col('temperature')), 'temperature'],
        [fn('AVG', col('turbidity')), 'turbidity'],
        [fn('AVG', col('dissolved_oxygen')), 'dissolvedOxygen'],
      ],
      group: ['time'],
      order: [[col('time'), 'ASC']],
      raw: true,
    });

    res.json({
      success: true,
      data: trendData,
    });
  } catch (error) {
    logger.error('获取水质趋势数据失败:', error);
    res.status(500).json({
      success: false,
      message: '获取水质趋势数据失败',
    });
  }
};

export const createWaterQualityData = async (req: Request, res: Response) => {
  try {
    const {
      monitoring_point_id,
      ph,
      temperature,
      turbidity,
      dissolved_oxygen,
      conductivity,
      ammonia_nitrogen,
      total_phosphorus,
      collected_at,
    } = req.body;
    
    if (!monitoring_point_id || !collected_at) {
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

    const data = await WaterQualityData.create({
      monitoring_point_id,
      ph,
      temperature,
      turbidity,
      dissolved_oxygen,
      conductivity,
      ammonia_nitrogen,
      total_phosphorus,
      collected_at: new Date(collected_at),
    });

    logger.info(`创建水质数据: 监测点ID=${monitoring_point_id}`);

    res.status(201).json({
      success: true,
      data,
      message: '水质数据创建成功',
    });
  } catch (error) {
    logger.error('创建水质数据失败:', error);
    res.status(500).json({
      success: false,
      message: '创建水质数据失败',
    });
  }
};
