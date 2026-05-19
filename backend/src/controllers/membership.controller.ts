import { Request, Response } from 'express';
import * as membershipService from '../services/membership.service';
import * as contentProtectionService from '../services/contentProtection.service';
import { NotePermission } from '../entities/Note';
import { ProtectionType, CopyProtectionLevel } from '../entities/ContentProtection';

export const getMembershipPlans = async (_req: Request, res: Response): Promise<void> => {
  try {
    const plans = await membershipService.getMembershipPlans();
    res.json({ plans });
  } catch (error) {
    console.error('获取会员套餐错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const createMembershipPlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const plan = await membershipService.createMembershipPlan(req.body);
    res.status(201).json({ message: '会员套餐创建成功', plan });
  } catch (error) {
    console.error('创建会员套餐错误:', error);
    res.status(500).json({ message: (error as Error).message || '服务器错误' });
  }
};

export const updateMembershipPlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const { planId } = req.params;
    const plan = await membershipService.updateMembershipPlan(planId, req.body);
    res.json({ message: '会员套餐更新成功', plan });
  } catch (error) {
    console.error('更新会员套餐错误:', error);
    res.status(500).json({ message: (error as Error).message || '服务器错误' });
  }
};

export const deleteMembershipPlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const { planId } = req.params;
    await membershipService.deleteMembershipPlan(planId);
    res.json({ message: '会员套餐已删除' });
  } catch (error) {
    console.error('删除会员套餐错误:', error);
    res.status(500).json({ message: (error as Error).message || '服务器错误' });
  }
};

export const getUserMembership = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const membership = await membershipService.getUserMembership(userId);
    res.json({ membership });
  } catch (error) {
    console.error('获取用户会员信息错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const getMembershipHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { page = 1, pageSize = 20 } = req.query;

    if (!userId) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const result = await membershipService.getUserMembershipHistory(
      userId,
      Number(page),
      Number(pageSize)
    );

    res.json(result);
  } catch (error) {
    console.error('获取会员历史错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const cancelAutoRenew = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const membership = await membershipService.cancelMembershipAutoRenew(userId);
    res.json({ message: '已取消自动续费', membership });
  } catch (error) {
    console.error('取消自动续费错误:', error);
    res.status(500).json({ message: (error as Error).message || '服务器错误' });
  }
};

export const checkFeatureAccess = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { feature } = req.query;

    if (!userId) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const result = await membershipService.checkUserFeatureAccess(
      userId,
      feature as string
    );

    res.json(result);
  } catch (error) {
    console.error('检查功能权限错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const createContentProtection = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { noteId, protectionType, copyProtectionLevel } = req.body;

    if (!userId) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const protection = await contentProtectionService.createContentProtection(
      noteId,
      userId,
      {
        protectionType: protectionType as ProtectionType,
        copyProtectionLevel: copyProtectionLevel as CopyProtectionLevel,
        ...req.body,
      }
    );

    res.status(201).json({ message: '内容保护已启用', protection });
  } catch (error) {
    console.error('创建内容保护错误:', error);
    res.status(500).json({ message: (error as Error).message || '服务器错误' });
  }
};

export const getNoteContentProtection = async (req: Request, res: Response): Promise<void> => {
  try {
    const { noteId } = req.params;
    const userId = req.user?.id;

    const result = await contentProtectionService.getProtectedNoteContent(noteId, userId);
    res.json(result);
  } catch (error) {
    console.error('获取受保护内容错误:', error);
    res.status(500).json({ message: (error as Error).message || '服务器错误' });
  }
};

export const removeContentProtection = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { noteId } = req.params;
    const { protectionType } = req.body;

    if (!userId) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const success = await contentProtectionService.removeContentProtection(
      noteId,
      protectionType as ProtectionType
    );

    if (success) {
      res.json({ message: '内容保护已关闭' });
    } else {
      res.status(404).json({ message: '内容保护不存在' });
    }
  } catch (error) {
    console.error('关闭内容保护错误:', error);
    res.status(500).json({ message: (error as Error).message || '服务器错误' });
  }
};

export const getProtectedNotes = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { page = 1, pageSize = 20 } = req.query;

    if (!userId) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const result = await contentProtectionService.getProtectedNotes(
      userId,
      Number(page),
      Number(pageSize)
    );

    res.json(result);
  } catch (error) {
    console.error('获取受保护笔记错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const analyzeContentProtection = async (req: Request, res: Response): Promise<void> => {
  try {
    const { content } = req.body;
    const result = await contentProtectionService.analyzeContentProtection(content);
    res.json(result);
  } catch (error) {
    console.error('分析内容保护错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const setNotePrivate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { AppDataSource } = await import('../config/database');
    const { Note } = await import('../entities/Note');
    const noteRepository = AppDataSource.getRepository(Note);

    const userId = req.user?.id;
    const { noteId, price } = req.body;

    if (!userId) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const note = await noteRepository.findOne({
      where: { id: noteId },
      relations: ['author'],
    });

    if (!note) {
      res.status(404).json({ message: '笔记不存在' });
      return;
    }

    if (note.author.id !== userId) {
      res.status(403).json({ message: '无权设置此笔记' });
      return;
    }

    note.permission = NotePermission.FOLLOWERS_ONLY;
    await noteRepository.save(note);

    await contentProtectionService.createContentProtection(noteId, userId, {
      protectionType: ProtectionType.PAYWALL,
      copyProtectionLevel: CopyProtectionLevel.STRONG,
      accessRules: { paywallPrice: price },
    });

    res.json({ message: '笔记已设置为付费私密', note });
  } catch (error) {
    console.error('设置付费笔记错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const purchaseMembership = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { planId } = req.body;

    if (!userId) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const result = await membershipService.purchaseMembership(userId, planId);
    res.status(201).json(result);
  } catch (error) {
    console.error('购买会员错误:', error);
    res.status(500).json({ message: (error as Error).message || '服务器错误' });
  }
};

export const getMembershipBenefits = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const result = await membershipService.getMembershipBenefitsForUser(userId);
    res.json(result);
  } catch (error) {
    console.error('获取会员权益错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const getExpiringMemberships = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { days = 7 } = req.query;

    if (!userId) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const memberships = await membershipService.getUserExpiringMemberships(userId, Number(days));
    res.json({ memberships });
  } catch (error) {
    console.error('获取即将到期会员错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};
