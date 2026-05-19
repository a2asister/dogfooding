import { Request, Response } from 'express';
import * as promotionService from '../services/promotion.service';
import { PromotionPlanType, PromotionStatus, PromotionTargetAudience } from '../entities/Promotion';

export const createPromotion = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { noteId, planType, budget, durationHours, targetAudience, targetFilters } = req.body;

    if (!userId) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const promotion = await promotionService.createPromotion(
      userId,
      noteId,
      planType as PromotionPlanType,
      budget,
      {
        durationHours,
        targetAudience: targetAudience as PromotionTargetAudience,
        targetFilters,
      }
    );

    res.status(201).json({ message: '推广已创建', promotion });
  } catch (error) {
    console.error('创建推广错误:', error);
    res.status(500).json({ message: (error as Error).message || '服务器错误' });
  }
};

export const activatePromotion = async (req: Request, res: Response): Promise<void> => {
  try {
    const { promotionId } = req.params;

    const promotion = await promotionService.activatePromotion(promotionId);
    res.json({ message: '推广已激活', promotion });
  } catch (error) {
    console.error('激活推广错误:', error);
    res.status(500).json({ message: (error as Error).message || '服务器错误' });
  }
};

export const getPromotion = async (req: Request, res: Response): Promise<void> => {
  try {
    const { promotionId } = req.params;
    const promotion = await promotionService.getPromotion(promotionId);
    if (!promotion) {
      res.status(404).json({ message: '推广不存在' });
      return;
    }
    res.json({ promotion });
  } catch (error) {
    console.error('获取推广信息错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const getUserPromotions = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { status, page = 1, pageSize = 20 } = req.query;

    if (!userId) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const result = await promotionService.getUserPromotions(
      userId,
      status as PromotionStatus,
      Number(page),
      Number(pageSize)
    );

    res.json(result);
  } catch (error) {
    console.error('获取用户推广错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const pausePromotion = async (req: Request, res: Response): Promise<void> => {
  try {
    const { promotionId } = req.params;
    const promotion = await promotionService.pausePromotion(promotionId);
    res.json({ message: '推广已暂停', promotion });
  } catch (error) {
    console.error('暂停推广错误:', error);
    res.status(500).json({ message: (error as Error).message || '服务器错误' });
  }
};

export const resumePromotion = async (req: Request, res: Response): Promise<void> => {
  try {
    const { promotionId } = req.params;
    const promotion = await promotionService.resumePromotion(promotionId);
    res.json({ message: '推广已恢复', promotion });
  } catch (error) {
    console.error('恢复推广错误:', error);
    res.status(500).json({ message: (error as Error).message || '服务器错误' });
  }
};

export const cancelPromotion = async (req: Request, res: Response): Promise<void> => {
  try {
    const { promotionId } = req.params;
    const promotion = await promotionService.cancelPromotion(promotionId);
    res.json({ message: '推广已取消', promotion });
  } catch (error) {
    console.error('取消推广错误:', error);
    res.status(500).json({ message: (error as Error).message || '服务器错误' });
  }
};

export const getPromotionPerformance = async (req: Request, res: Response): Promise<void> => {
  try {
    const { promotionId } = req.params;
    const performance = await promotionService.getPromotionPerformance(promotionId);
    res.json(performance);
  } catch (error) {
    console.error('获取推广效果错误:', error);
    res.status(500).json({ message: (error as Error).message || '服务器错误' });
  }
};

export const getPromotionPlans = async (_req: Request, res: Response): Promise<void> => {
  try {
    const plans = promotionService.getPromotionPlans();
    res.json({ plans });
  } catch (error) {
    console.error('获取推广套餐错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};
