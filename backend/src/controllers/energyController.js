const { EnergyStat, Device } = require('../models');
const { logger } = require('../utils/logger');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');

const getEnergyStats = async (ctx) => {
  try {
    const { device_id, start_date, end_date, period = 'day' } = ctx.query;
    
    const where = {};
    if (device_id) where.device_id = device_id;
    
    if (start_date && end_date) {
      where.date = {
        [Op.between]: [start_date, end_date]
      };
    }
    
    let stats;
    
    if (period === 'month') {
      stats = await EnergyStat.findAll({
        where,
        attributes: [
          [sequelize.fn('YEAR', sequelize.col('date')), 'year'],
          [sequelize.fn('MONTH', sequelize.col('date')), 'month'],
          [sequelize.fn('SUM', sequelize.col('energy_consumed')), 'total_energy'],
          [sequelize.fn('SUM', sequelize.col('power_on_time')), 'total_time']
        ],
        group: ['year', 'month'],
        order: [['year', 'DESC'], ['month', 'DESC']],
        include: [{ model: Device, attributes: ['id', 'name', 'type'] }]
      });
    } else if (period === 'week') {
      stats = await EnergyStat.findAll({
        where,
        attributes: [
          [sequelize.fn('YEAR', sequelize.col('date')), 'year'],
          [sequelize.fn('WEEK', sequelize.col('date')), 'week'],
          [sequelize.fn('SUM', sequelize.col('energy_consumed')), 'total_energy'],
          [sequelize.fn('SUM', sequelize.col('power_on_time')), 'total_time']
        ],
        group: ['year', 'week'],
        order: [['year', 'DESC'], ['week', 'DESC']],
        include: [{ model: Device, attributes: ['id', 'name', 'type'] }]
      });
    } else {
      stats = await EnergyStat.findAll({
        where,
        order: [['date', 'DESC']],
        include: [{ model: Device, attributes: ['id', 'name', 'type'] }]
      });
    }
    
    ctx.body = {
      success: true,
      data: stats
    };
  } catch (error) {
    logger.error('获取能耗统计错误:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: '获取能耗统计失败'
    };
  }
};

const getEnergySummary = async (ctx) => {
  try {
    const { device_id, start_date, end_date } = ctx.query;
    
    const where = {};
    if (device_id) where.device_id = device_id;
    
    if (start_date && end_date) {
      where.date = {
        [Op.between]: [start_date, end_date]
      };
    }
    
    const summary = await EnergyStat.findOne({
      where,
      attributes: [
        [sequelize.fn('SUM', sequelize.col('energy_consumed')), 'total_energy'],
        [sequelize.fn('SUM', sequelize.col('power_on_time')), 'total_time'],
        [sequelize.fn('AVG', sequelize.col('energy_consumed')), 'avg_daily_energy'],
        [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('device_id'))), 'devices_count']
      ]
    });
    
    const topDevices = await EnergyStat.findAll({
      where,
      attributes: [
        'device_id',
        [sequelize.fn('SUM', sequelize.col('energy_consumed')), 'total_energy']
      ],
      include: [{ model: Device, attributes: ['id', 'name', 'type'] }],
      group: ['device_id'],
      order: [[sequelize.fn('SUM', sequelize.col('energy_consumed')), 'DESC']],
      limit: 5
    });
    
    ctx.body = {
      success: true,
      data: {
        summary: summary.toJSON(),
        topDevices
      }
    };
  } catch (error) {
    logger.error('获取能耗汇总错误:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: '获取能耗汇总失败'
    };
  }
};

module.exports = {
  getEnergyStats,
  getEnergySummary
};