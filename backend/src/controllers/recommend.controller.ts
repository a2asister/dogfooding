import { Request, Response } from 'express';
import * as recommendService from '../services/recommend.service';

export const getPersonalizedFeed = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { page = 1, pageSize = 10 } = req.query;

    const result = await recommendService.getPersonalizedFeed(
      userId,
      Number(page),
      Number(pageSize)
    );

    res.json(result);
  } catch (error) {
    console.error('获取个性化推荐错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const getHotFeed = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, pageSize = 10 } = req.query;

    const result = await recommendService.getHotFeedWithBoost(
      Number(page),
      Number(pageSize)
    );

    res.json(result);
  } catch (error) {
    console.error('获取热门推荐错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const updateRecommendInteraction = async (req: Request, res: Response): Promise<void> => {
  try {
    const { recommendId } = req.params;
    const { interaction } = req.body;

    await recommendService.updateRecommendInteraction(
      recommendId,
      interaction
    );

    res.json({ message: '交互记录更新成功' });
  } catch (error) {
    console.error('更新推荐交互错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const getRecommendStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const stats = await recommendService.getRecommendStats(userId);
    res.json(stats);
  } catch (error) {
    console.error('获取推荐统计错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};
