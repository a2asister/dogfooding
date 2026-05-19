import { Request, Response } from 'express';
import * as communityService from '../services/community.service';
import { CommunityType } from '../entities/Community';

export const createCommunity = async (req: Request, res: Response): Promise<void> => {
  try {
    const ownerId = req.user?.id;
    const { name, description, avatar, coverImage, type, category, rules, settings } = req.body;

    if (!ownerId) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const community = await communityService.createCommunity(ownerId, name, {
      description,
      avatar,
      coverImage,
      type: type as CommunityType,
      category,
      rules,
      settings,
    });

    res.status(201).json({ message: '社群创建成功', community });
  } catch (error) {
    console.error('创建社群错误:', error);
    res.status(500).json({ message: (error as Error).message || '服务器错误' });
  }
};

export const getCommunity = async (req: Request, res: Response): Promise<void> => {
  try {
    const { communityId } = req.params;
    const community = await communityService.getCommunity(communityId);
    if (!community) {
      res.status(404).json({ message: '社群不存在' });
      return;
    }
    res.json({ community });
  } catch (error) {
    console.error('获取社群错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const getUserCommunities = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { page = 1, pageSize = 20 } = req.query;

    if (!userId) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const result = await communityService.getUserCommunities(
      userId,
      Number(page),
      Number(pageSize)
    );

    res.json(result);
  } catch (error) {
    console.error('获取用户社群错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const getPublicCommunities = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, page = 1, pageSize = 20 } = req.query;

    const result = await communityService.getPublicCommunities(
      category as string,
      Number(page),
      Number(pageSize)
    );

    res.json(result);
  } catch (error) {
    console.error('获取公开社群错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const joinCommunity = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { communityId } = req.params;
    const { invitedBy } = req.body;

    if (!userId) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const member = await communityService.joinCommunity(communityId, userId, invitedBy);
    res.status(201).json({ message: member.status === 'pending' ? '申请已提交，等待审核' : '加入成功', member });
  } catch (error) {
    console.error('加入社群错误:', error);
    res.status(500).json({ message: (error as Error).message || '服务器错误' });
  }
};

export const leaveCommunity = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { communityId } = req.params;

    if (!userId) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const success = await communityService.leaveCommunity(communityId, userId);
    if (success) {
      res.json({ message: '已退出社群' });
    } else {
      res.status(404).json({ message: '社群不存在' });
    }
  } catch (error) {
    console.error('退出社群错误:', error);
    res.status(500).json({ message: (error as Error).message || '服务器错误' });
  }
};

export const getCommunityMembers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { communityId } = req.params;
    const { status, page = 1, pageSize = 50 } = req.query;

    const result = await communityService.getCommunityMembers(
      communityId,
      status as any,
      Number(page),
      Number(pageSize)
    );

    res.json(result);
  } catch (error) {
    console.error('获取社群成员错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const approveMember = async (req: Request, res: Response): Promise<void> => {
  try {
    const operatorId = req.user?.id;
    const { communityId, userId } = req.params;
    const { approved } = req.body;

    if (!operatorId) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const member = await communityService.approveMember(communityId, userId, operatorId, approved);
    res.json({ message: approved ? '已通过' : '已拒绝', member });
  } catch (error) {
    console.error('审核成员错误:', error);
    res.status(500).json({ message: (error as Error).message || '服务器错误' });
  }
};

export const updateCommunity = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { communityId } = req.params;

    if (!userId) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const community = await communityService.updateCommunity(communityId, userId, req.body);
    res.json({ message: '社群信息已更新', community });
  } catch (error) {
    console.error('更新社群错误:', error);
    res.status(500).json({ message: (error as Error).message || '服务器错误' });
  }
};

export const pinNote = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { communityId, noteId } = req.params;

    if (!userId) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const success = await communityService.pinNote(communityId, noteId, userId);
    res.json({ message: '已置顶' });
  } catch (error) {
    console.error('置顶笔记错误:', error);
    res.status(500).json({ message: (error as Error).message || '服务器错误' });
  }
};

export const unpinNote = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { communityId, noteId } = req.params;

    if (!userId) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const success = await communityService.unpinNote(communityId, noteId, userId);
    res.json({ message: '已取消置顶' });
  } catch (error) {
    console.error('取消置顶错误:', error);
    res.status(500).json({ message: (error as Error).message || '服务器错误' });
  }
};

export const deleteCommunity = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { communityId } = req.params;

    if (!userId) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const success = await communityService.deleteCommunity(communityId, userId);
    if (success) {
      res.json({ message: '社群已删除' });
    } else {
      res.status(404).json({ message: '社群不存在' });
    }
  } catch (error) {
    console.error('删除社群错误:', error);
    res.status(500).json({ message: (error as Error).message || '服务器错误' });
  }
};
