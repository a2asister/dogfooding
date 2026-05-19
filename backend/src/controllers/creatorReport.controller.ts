import { Request, Response } from 'express';
import * as creatorReportService from '../services/creatorReport.service';
import { ReportType } from '../entities/CreatorReport';

export const generateCreatorReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { reportType, date } = req.body;

    if (!userId) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const report = await creatorReportService.generateCreatorReport(
      userId,
      reportType as ReportType,
      date ? new Date(date) : undefined
    );

    res.status(201).json({ message: '报告已生成', report });
  } catch (error) {
    console.error('生成创作者报告错误:', error);
    res.status(500).json({ message: (error as Error).message || '服务器错误' });
  }
};

export const getCreatorReports = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { reportType, page = 1, pageSize = 20 } = req.query;

    if (!userId) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const result = await creatorReportService.getCreatorReports(
      userId,
      reportType as ReportType,
      Number(page),
      Number(pageSize)
    );

    res.json(result);
  } catch (error) {
    console.error('获取创作者报告错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const getLatestReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { reportType } = req.query;

    if (!userId) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const report = await creatorReportService.getLatestCreatorReport(userId, (reportType as ReportType) || ReportType.WEEKLY);
    res.json({ report });
  } catch (error) {
    console.error('获取最新报告错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const generateAllDailyReports = async (_req: Request, res: Response): Promise<void> => {
  try {
    await creatorReportService.generateAllDailyReports();
    res.json({ message: '所有创作者日报已生成' });
  } catch (error) {
    console.error('生成所有日报错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const generateWeeklyReports = async (_req: Request, res: Response): Promise<void> => {
  try {
    await creatorReportService.generateWeeklyReports();
    res.json({ message: '创作者周报已生成' });
  } catch (error) {
    console.error('生成周报错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};
