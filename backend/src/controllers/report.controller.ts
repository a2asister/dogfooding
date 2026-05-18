import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Report, ReportType, ReportStatus } from '../entities/Report';

const reportRepository = AppDataSource.getRepository(Report);

export const createReport = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const { type, targetId, reason, description, images } = req.body;

    if (!type || !targetId || !reason) {
      res.status(400).json({ message: '参数不完整' });
      return;
    }

    if (!Object.values(ReportType).includes(type)) {
      res.status(400).json({ message: '无效的举报类型' });
      return;
    }

    const existingReport = await reportRepository.findOne({
      where: {
        reporterId: req.user.id,
        type,
        targetId,
      },
    });

    if (existingReport) {
      res.status(400).json({ message: '您已举报过此内容' });
      return;
    }

    const report = reportRepository.create({
      type,
      targetId,
      reason,
      description: description || '',
      images: images || [],
      reporterId: req.user.id,
      updatedAt: new Date(),
    });

    await reportRepository.save(report);

    res.status(201).json({
      message: '举报成功，我们将尽快处理',
      report,
    });
  } catch (error) {
    console.error('创建举报错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const getReportList = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      res.status(403).json({ message: '无权限访问' });
      return;
    }

    const { status, type, page = 1, pageSize = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(pageSize);

    let whereCondition: any = {};
    if (status) whereCondition.status = status;
    if (type) whereCondition.type = type;

    const [reports, total] = await reportRepository.findAndCount({
      where: whereCondition,
      relations: ['reporter', 'note', 'comment', 'reportedUser'],
      order: { createdAt: 'DESC' },
      skip,
      take: Number(pageSize),
    });

    res.json({
      list: reports.map(r => ({
        id: r.id,
        type: r.type,
        targetId: r.targetId,
        reason: r.reason,
        description: r.description,
        images: r.images,
        status: r.status,
        handleResult: r.handleResult,
        reporter: {
          id: r.reporter.id,
          nickname: r.reporter.nickname,
          avatar: r.reporter.avatar,
        },
        note: r.note ? {
          id: r.note.id,
          title: r.note.title,
        } : null,
        comment: r.comment ? {
          id: r.comment.id,
          content: r.comment.content.substring(0, 50),
        } : null,
        reportedUser: r.reportedUser ? {
          id: r.reportedUser.id,
          nickname: r.reportedUser.nickname,
          avatar: r.reportedUser.avatar,
        } : null,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      })),
      total,
      page: Number(page),
      pageSize: Number(pageSize),
    });
  } catch (error) {
    console.error('获取举报列表错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const handleReport = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      res.status(403).json({ message: '无权限操作' });
      return;
    }

    const { id } = req.params;
    const { status, handleResult } = req.body;

    const report = await reportRepository.findOne({ where: { id } });
    if (!report) {
      res.status(404).json({ message: '举报不存在' });
      return;
    }

    if (status && Object.values(ReportStatus).includes(status)) {
      report.status = status;
    }
    if (handleResult !== undefined) {
      report.handleResult = handleResult;
    }
    report.updatedAt = new Date();

    await reportRepository.save(report);

    res.json({
      message: '处理成功',
      report,
    });
  } catch (error) {
    console.error('处理举报错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const getUserReportList = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const { page = 1, pageSize = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(pageSize);

    const [reports, total] = await reportRepository.findAndCount({
      where: { reporterId: req.user.id },
      order: { createdAt: 'DESC' },
      skip,
      take: Number(pageSize),
    });

    res.json({
      list: reports.map(r => ({
        id: r.id,
        type: r.type,
        targetId: r.targetId,
        reason: r.reason,
        status: r.status,
        handleResult: r.handleResult,
        createdAt: r.createdAt,
      })),
      total,
      page: Number(page),
      pageSize: Number(pageSize),
    });
  } catch (error) {
    console.error('获取用户举报列表错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};
