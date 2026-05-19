import { Request, Response } from 'express';
import * as analyticsService from '../services/analytics.service';

export const getOverview = async (_req: Request, res: Response): Promise<void> => {
  try {
    const overview = await analyticsService.getOverview();
    res.json({ overview });
  } catch (error) {
    console.error('获取数据概览错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const getDailyStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;

    const stats = await analyticsService.getDailyStatsRange(
      new Date(startDate as string),
      new Date(endDate as string)
    );

    res.json({ stats });
  } catch (error) {
    console.error('获取每日统计错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const getRetentionStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;

    const retention = await analyticsService.getRetentionStats(
      new Date(startDate as string),
      new Date(endDate as string)
    );

    res.json(retention);
  } catch (error) {
    console.error('获取留存统计错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const getEngagementStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;

    const engagement = await analyticsService.getEngagementStats(
      new Date(startDate as string),
      new Date(endDate as string)
    );

    res.json(engagement);
  } catch (error) {
    console.error('获取互动统计错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const getContentPerformance = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page, pageSize, startDate, endDate, sortBy } = req.query;

    const performance = await analyticsService.getContentPerformance({
      page: page ? parseInt(page as string) : undefined,
      pageSize: pageSize ? parseInt(pageSize as string) : undefined,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      sortBy: sortBy as any,
    });

    res.json(performance);
  } catch (error) {
    console.error('获取内容表现错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const generateDailyStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const { date } = req.body;
    const stats = await analyticsService.generateDailyStats(date ? new Date(date) : undefined);
    res.status(201).json({ message: '统计数据已生成', stats });
  } catch (error) {
    console.error('生成每日统计错误:', error);
    res.status(500).json({ message: (error as Error).message || '服务器错误' });
  }
};

export const getStatsRange = async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;

    const result = await analyticsService.getStatsRange(
      new Date(startDate as string),
      new Date(endDate as string)
    );

    res.json(result);
  } catch (error) {
    console.error('获取统计范围错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const getRealtimeStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const stats = await analyticsService.getRealtimeStats();
    res.json(stats);
  } catch (error) {
    console.error('获取实时统计错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const recordTrafficSource = async (req: Request, res: Response): Promise<void> => {
  try {
    const { source, medium, campaign, keyword, referralUrl, visits, uniqueVisitors, newUsers } = req.body;

    const trafficSource = await analyticsService.recordTrafficSource(source, medium, {
      campaign,
      keyword,
      referralUrl,
      visits,
      uniqueVisitors,
      newUsers,
    });

    res.status(201).json({ message: '流量来源已记录', trafficSource });
  } catch (error) {
    console.error('记录流量来源错误:', error);
    res.status(500).json({ message: (error as Error).message || '服务器错误' });
  }
};

export const getTrafficSources = async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;

    const sources = await analyticsService.getTrafficSources(
      new Date(startDate as string),
      new Date(endDate as string)
    );

    res.json({ sources });
  } catch (error) {
    console.error('获取流量来源错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};
