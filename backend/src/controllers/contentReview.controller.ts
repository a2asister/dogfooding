import { Request, Response } from 'express';
import * as contentReviewService from '../services/contentReview.service';
import { ReviewType, ReviewStatus } from '../entities/ReviewTask';
import { RestrictionType, RestrictionLevel } from '../entities/ContentRestriction';
import { UserRestrictionType, UserRestrictionScope } from '../entities/UserRestriction';
import { In } from 'typeorm';

export const getPendingTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type, page = 1, pageSize = 20 } = req.query;

    const result = await contentReviewService.getPendingReviewTasks(
      type as ReviewType,
      Number(page),
      Number(pageSize)
    );

    res.json(result);
  } catch (error) {
    console.error('获取待审核任务错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const reviewTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { taskId } = req.params;
    const reviewerId = req.user?.id;
    const { passed, reason } = req.body;

    if (!reviewerId) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const task = await contentReviewService.reviewTask(
      taskId,
      reviewerId,
      passed,
      reason
    );

    res.json({ message: passed ? '审核通过' : '审核驳回', task });
  } catch (error) {
    console.error('审核任务错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const batchReviewTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const { taskIds, passed, reason } = req.body;
    const reviewerId = req.user?.id;

    if (!reviewerId) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const results = [];
    for (const taskId of taskIds) {
      try {
        const task = await contentReviewService.reviewTask(
          taskId,
          reviewerId,
          passed,
          reason
        );
        results.push({ taskId, success: true, task });
      } catch (e) {
        results.push({ taskId, success: false, error: (e as Error).message });
      }
    }

    res.json({ message: '批量审核完成', results });
  } catch (error) {
    console.error('批量审核错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const createContentRestriction = async (req: Request, res: Response): Promise<void> => {
  try {
    const { noteId, type, level, reasons, remark } = req.body;
    const operatorId = req.user?.id;

    const restriction = await contentReviewService.createContentRestriction(
      noteId,
      type as RestrictionType,
      level as RestrictionLevel,
      reasons,
      operatorId,
      remark
    );

    res.json({ message: '内容限制创建成功', restriction });
  } catch (error) {
    console.error('创建内容限制错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const createUserRestriction = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, type, reason, scope, durationHours } = req.body;
    const operatorId = req.user?.id;

    const restriction = await contentReviewService.createUserRestriction(
      userId,
      type as UserRestrictionType,
      reason,
      scope as UserRestrictionScope,
      operatorId,
      durationHours
    );

    res.json({ message: '用户限制创建成功', restriction });
  } catch (error) {
    console.error('创建用户限制错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const liftUserRestriction = async (req: Request, res: Response): Promise<void> => {
  try {
    const { restrictionId } = req.params;
    const { reason } = req.body;
    const operatorId = req.user?.id;

    if (!operatorId) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const restriction = await contentReviewService.liftUserRestriction(
      restrictionId,
      operatorId,
      reason
    );

    res.json({ message: '用户限制已解除', restriction });
  } catch (error) {
    console.error('解除用户限制错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const checkUserRestriction = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { scope } = req.query;

    if (!userId) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const result = await contentReviewService.checkUserRestriction(
      userId,
      scope as UserRestrictionScope
    );

    res.json(result);
  } catch (error) {
    console.error('检查用户限制错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const detectContentViolation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { content } = req.body;

    const result = contentReviewService.detectViolation(content);

    res.json(result);
  } catch (error) {
    console.error('内容违规检测错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const getReviewLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { taskId, page = 1, pageSize = 20 } = req.query;

    const { ReviewLog } = await import('../entities/ReviewLog');
    const { AppDataSource } = await import('../config/database');
    const logRepository = AppDataSource.getRepository(ReviewLog);

    const whereCondition: any = {};
    if (taskId) {
      whereCondition.taskId = taskId;
    }

    const [logs, total] = await logRepository.findAndCount({
      where: whereCondition,
      relations: ['operator'],
      order: { createdAt: 'DESC' },
      skip: (Number(page) - 1) * Number(pageSize),
      take: Number(pageSize),
    });

    res.json({ logs, total, page: Number(page), pageSize: Number(pageSize) });
  } catch (error) {
    console.error('获取审核日志错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const getContentRestrictions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { noteId, page = 1, pageSize = 20 } = req.query;

    const { ContentRestriction } = await import('../entities/ContentRestriction');
    const { AppDataSource } = await import('../config/database');
    const restrictionRepository = AppDataSource.getRepository(ContentRestriction);

    const whereCondition: any = { isActive: true };
    if (noteId) {
      whereCondition.noteId = noteId;
    }

    const [restrictions, total] = await restrictionRepository.findAndCount({
      where: whereCondition,
      relations: ['operator'],
      order: { createdAt: 'DESC' },
      skip: (Number(page) - 1) * Number(pageSize),
      take: Number(pageSize),
    });

    res.json({ restrictions, total, page: Number(page), pageSize: Number(pageSize) });
  } catch (error) {
    console.error('获取内容限制错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const getUserRestrictions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, page = 1, pageSize = 20 } = req.query;

    const { UserRestriction } = await import('../entities/UserRestriction');
    const { AppDataSource } = await import('../config/database');
    const restrictionRepository = AppDataSource.getRepository(UserRestriction);

    const whereCondition: any = {};
    if (userId) {
      whereCondition.userId = userId;
    }

    const [restrictions, total] = await restrictionRepository.findAndCount({
      where: whereCondition,
      relations: ['operator'],
      order: { createdAt: 'DESC' },
      skip: (Number(page) - 1) * Number(pageSize),
      take: Number(pageSize),
    });

    res.json({ restrictions, total, page: Number(page), pageSize: Number(pageSize) });
  } catch (error) {
    console.error('获取用户限制错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};
