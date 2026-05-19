import { Request, Response } from 'express';
import * as creatorService from '../services/creator.service';
import { VerificationType } from '../entities/CreatorVerification';

export const getCreatorOverview = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const overview = await creatorService.getCreatorOverview(userId);
    res.json(overview);
  } catch (error) {
    console.error('获取创作者概览错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const getCreatorDataRange = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { startDate, endDate } = req.query;

    if (!userId) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const result = await creatorService.getCreatorDataRange(
      userId,
      new Date(startDate as string),
      new Date(endDate as string)
    );

    res.json(result);
  } catch (error) {
    console.error('获取创作者数据错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const generateDailyData = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { date } = req.body;

    if (!userId) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const data = await creatorService.generateCreatorDailyData(
      userId,
      date ? new Date(date) : undefined
    );

    res.json({ message: '数据生成成功', data });
  } catch (error) {
    console.error('生成创作者数据错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const applyForVerification = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { type, realName, materials, description, idCard, organizationName, organizationLicense } = req.body;

    if (!userId) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const verification = await creatorService.applyForVerification(
      userId,
      type as VerificationType,
      realName,
      materials,
      description,
      idCard,
      organizationName,
      organizationLicense
    );

    res.json({ message: '认证申请已提交', verification });
  } catch (error) {
    console.error('提交认证申请错误:', error);
    res.status(500).json({ message: (error as Error).message || '服务器错误' });
  }
};

export const reviewVerification = async (req: Request, res: Response): Promise<void> => {
  try {
    const { verificationId } = req.params;
    const { passed, reviewNote, level, badgeText, badgeIcon, validDays } = req.body;
    const reviewerId = req.user?.id;

    if (!reviewerId) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const verification = await creatorService.reviewVerification(
      verificationId,
      reviewerId,
      passed,
      reviewNote,
      level,
      badgeText,
      badgeIcon,
      validDays
    );

    res.json({ message: passed ? '认证通过' : '认证驳回', verification });
  } catch (error) {
    console.error('审核认证申请错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const getVerifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, page = 1, pageSize = 20 } = req.query;

    const result = await creatorService.getCreatorVerifications(
      status as any,
      Number(page),
      Number(pageSize)
    );

    res.json(result);
  } catch (error) {
    console.error('获取认证申请错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const getMyVerification = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const { CreatorVerification, VerificationStatus } = await import('../entities/CreatorVerification');
    const { AppDataSource } = await import('../config/database');
    const verificationRepository = AppDataSource.getRepository(CreatorVerification);

    const verification = await verificationRepository.findOne({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    res.json({ verification });
  } catch (error) {
    console.error('获取我的认证信息错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};
