import { Request, Response } from 'express';
import { statisticsModel } from '../models/statistics.model';

export const statisticsController = {
  getSummary: async (req: Request, res: Response): Promise<void> => {
    try {
      const { period = 'day' } = req.query;
      const summary = statisticsModel.getSummary(period as 'day' | 'week' | 'month');

      res.json({
        code: 0,
        message: 'success',
        data: summary
      });
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: '获取统计数据失败',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  getByDateRange: async (req: Request, res: Response): Promise<void> => {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        res.status(400).json({
          code: 400,
          message: '请提供开始和结束日期'
        });
        return;
      }

      const data = statisticsModel.getByDateRange(startDate as string, endDate as string);

      res.json({
        code: 0,
        message: 'success',
        data
      });
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: '获取统计数据失败',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  exportCSV: async (req: Request, res: Response): Promise<void> => {
    try {
      const { startDate, endDate, period = 'day' } = req.query;

      let data;
      if (startDate && endDate) {
        data = statisticsModel.getByDateRange(startDate as string, endDate as string);
      } else {
        const summary = statisticsModel.getSummary(period as 'day' | 'week' | 'month');
        data = summary.trend;
      }

      const headers = ['日期', 'PV', 'UV', '下载量', '预约量', '资讯阅读量', '活动点击量', '工单数'];
      const csvContent = [
        headers.join(','),
        ...data.map((row: any) => [
          row.date || row.stat_date,
          row.pv || 0,
          row.uv || 0,
          row.downloads || 0,
          row.reservations || 0,
          row.news_views || 0,
          row.event_clicks || 0,
          row.tickets || 0
        ].join(','))
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="statistics_${Date.now()}.csv"`);
      res.send('\uFEFF' + csvContent);
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: '导出失败',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
};
