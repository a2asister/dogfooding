import { Request, Response } from 'express';
import * as earningService from '../services/earning.service';
import { EarningStatus } from '../entities/Earning';
import { WithdrawalMethod } from '../entities/Withdrawal';

export const getEarningsSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const summary = await earningService.getUserEarningsSummary(userId);
    res.json(summary);
  } catch (error) {
    console.error('获取收益概览错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const getEarnings = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { status, page = 1, pageSize = 20 } = req.query;

    if (!userId) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const result = await earningService.getUserEarnings(
      userId,
      status as EarningStatus,
      Number(page),
      Number(pageSize)
    );

    res.json(result);
  } catch (error) {
    console.error('获取收益记录错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const getEarningsByDateRange = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { startDate, endDate } = req.query;

    if (!userId) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const result = await earningService.getEarningsByDateRange(
      userId,
      new Date(startDate as string),
      new Date(endDate as string)
    );

    res.json(result);
  } catch (error) {
    console.error('获取日期范围收益错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const createWithdrawal = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { amount, method, accountInfo } = req.body;

    if (!userId) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const withdrawal = await earningService.createWithdrawal(
      userId,
      amount,
      method as WithdrawalMethod,
      accountInfo
    );

    res.status(201).json({ message: '提现申请已提交', withdrawal });
  } catch (error) {
    console.error('创建提现申请错误:', error);
    res.status(500).json({ message: (error as Error).message || '服务器错误' });
  }
};

export const getWithdrawals = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { status, page = 1, pageSize = 20 } = req.query;

    if (!userId) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const result = await earningService.getWithdrawals(
      userId,
      status as any,
      Number(page),
      Number(pageSize)
    );

    res.json(result);
  } catch (error) {
    console.error('获取提现记录错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const createTip = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.body;
    const fromUserId = req.user?.id;
    const { noteId, amount } = req.body;

    if (!fromUserId) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    if (fromUserId === userId) {
      res.status(400).json({ message: '不能给自己打赏' });
      return;
    }

    const earning = await earningService.createTipEarning(
      userId,
      fromUserId,
      amount,
      noteId
    );

    res.status(201).json({ message: '打赏成功', earning });
  } catch (error) {
    console.error('打赏错误:', error);
    res.status(500).json({ message: (error as Error).message || '服务器错误' });
  }
};
