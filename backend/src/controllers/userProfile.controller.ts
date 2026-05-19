import { Request, Response } from 'express';
import * as userProfileService from '../services/userProfile.service';
import { BehaviorType } from '../entities/UserBehavior';

export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const profile = await userProfileService.getUserProfile(userId);
    res.json(profile);
  } catch (error) {
    console.error('获取用户画像错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const getUserTags = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const tags = await userProfileService.getUserTags(userId);
    res.json({ tags });
  } catch (error) {
    console.error('获取用户标签错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const generateUserTags = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const tags = await userProfileService.generateUserTags(userId);
    res.json({ message: '标签生成成功', tags });
  } catch (error) {
    console.error('生成用户标签错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const recordBehavior = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { behaviorType, targetType, targetId, noteId, metadata } = req.body;
    const ip = req.ip;
    const userAgent = req.headers['user-agent'];

    await userProfileService.recordUserBehavior(
      userId,
      behaviorType as BehaviorType,
      targetType,
      targetId,
      noteId,
      metadata,
      ip,
      userAgent
    );

    res.json({ message: '行为记录成功' });
  } catch (error) {
    console.error('记录用户行为错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const getAllTags = async (_req: Request, res: Response): Promise<void> => {
  try {
    const { UserTag } = await import('../entities/UserTag');
    const { AppDataSource } = await import('../config/database');
    const tagRepository = AppDataSource.getRepository(UserTag);
    
    const tags = await tagRepository.find({
      where: { isActive: true },
      order: { category: 'ASC', userCount: 'DESC' },
    });

    res.json({ tags });
  } catch (error) {
    console.error('获取所有标签错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};
