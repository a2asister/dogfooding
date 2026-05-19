import { Request, Response } from 'express';
import * as operationService from '../services/operation.service';
import { BannerPosition, BannerType } from '../entities/Banner';
import { RankType } from '../entities/HotRank';
import { SupportType } from '../entities/FlowSupport';

export const createBanner = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, image, position, type, targetId, targetUrl, description, sort, isActive, startTime, endTime } = req.body;
    const creatorId = req.user?.id;

    const banner = await operationService.createBanner(
      title,
      image,
      position as BannerPosition,
      type as BannerType,
      targetId,
      targetUrl,
      description,
      sort,
      isActive,
      startTime ? new Date(startTime) : undefined,
      endTime ? new Date(endTime) : undefined,
      creatorId
    );

    res.json({ message: 'Banner创建成功', banner });
  } catch (error) {
    console.error('创建Banner错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const updateBanner = async (req: Request, res: Response): Promise<void> => {
  try {
    const { bannerId } = req.params;
    const updates = req.body;

    if (updates.startTime) {
      updates.startTime = new Date(updates.startTime);
    }
    if (updates.endTime) {
      updates.endTime = new Date(updates.endTime);
    }

    const banner = await operationService.updateBanner(bannerId, updates);
    res.json({ message: 'Banner更新成功', banner });
  } catch (error) {
    console.error('更新Banner错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const deleteBanner = async (req: Request, res: Response): Promise<void> => {
  try {
    const { bannerId } = req.params;
    await operationService.deleteBanner(bannerId);
    res.json({ message: 'Banner删除成功' });
  } catch (error) {
    console.error('删除Banner错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const getBanners = async (req: Request, res: Response): Promise<void> => {
  try {
    const { position, includeInactive } = req.query;

    const banners = await operationService.getBanners(
      position as BannerPosition,
      includeInactive === 'true'
    );

    res.json({ banners });
  } catch (error) {
    console.error('获取Banner错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const incrementBannerClick = async (req: Request, res: Response): Promise<void> => {
  try {
    const { bannerId } = req.params;
    await operationService.incrementBannerClick(bannerId);
    res.json({ message: '点击统计成功' });
  } catch (error) {
    console.error('Banner点击统计错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const generateHotRanks = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type, limit = 50 } = req.body;

    const ranks = await operationService.generateHotRanks(
      type as RankType,
      Number(limit)
    );

    res.json({ message: '榜单生成成功', count: ranks.length });
  } catch (error) {
    console.error('生成榜单错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const getHotRanks = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type, page = 1, pageSize = 20 } = req.query;

    const result = await operationService.getHotRanks(
      type as RankType,
      Number(page),
      Number(pageSize)
    );

    res.json(result);
  } catch (error) {
    console.error('获取榜单错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const manualBoostRank = async (req: Request, res: Response): Promise<void> => {
  try {
    const { rankId } = req.params;
    const { boostValue } = req.body;
    const operatorId = req.user?.id;

    if (!operatorId) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const rank = await operationService.manualBoostRank(
      rankId,
      operatorId,
      Number(boostValue)
    );

    res.json({ message: '榜单加权成功', rank });
  } catch (error) {
    console.error('榜单加权错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const pinRank = async (req: Request, res: Response): Promise<void> => {
  try {
    const { rankId } = req.params;
    const { isPinned } = req.body;
    const operatorId = req.user?.id;

    if (!operatorId) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const rank = await operationService.pinRank(
      rankId,
      operatorId,
      isPinned
    );

    res.json({ message: isPinned ? '置顶成功' : '取消置顶成功', rank });
  } catch (error) {
    console.error('榜单置顶错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const createFlowSupport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { noteId, type, boostMultiplier, reason, targetViews, startTime, endTime } = req.body;
    const operatorId = req.user?.id;

    const support = await operationService.createFlowSupport(
      noteId,
      type as SupportType,
      Number(boostMultiplier),
      operatorId,
      reason,
      targetViews ? Number(targetViews) : undefined,
      startTime ? new Date(startTime) : undefined,
      endTime ? new Date(endTime) : undefined
    );

    res.json({ message: '流量扶持创建成功', support });
  } catch (error) {
    console.error('创建流量扶持错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const cancelFlowSupport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { supportId } = req.params;
    const support = await operationService.cancelFlowSupport(supportId);
    res.json({ message: '流量扶持已取消', support });
  } catch (error) {
    console.error('取消流量扶持错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const getFlowSupports = async (req: Request, res: Response): Promise<void> => {
  try {
    const { noteId, status, page = 1, pageSize = 20 } = req.query;

    const result = await operationService.getFlowSupports(
      noteId as string,
      status as any,
      Number(page),
      Number(pageSize)
    );

    res.json(result);
  } catch (error) {
    console.error('获取流量扶持错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};
