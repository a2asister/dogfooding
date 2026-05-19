import { Request, Response } from 'express';
import * as riskControlService from '../services/riskControl.service';
import { RiskType, RiskStatus } from '../entities/BehaviorRisk';
import { AccountRiskType, AccountRiskStatus, AccountAction } from '../entities/AccountRisk';
import { LoginStatus } from '../entities/LoginLog';

export const getBehaviorRisks = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, type, page = 1, pageSize = 20 } = req.query;

    const result = await riskControlService.getBehaviorRisks(
      status as RiskStatus,
      type as RiskType,
      Number(page),
      Number(pageSize)
    );

    res.json(result);
  } catch (error) {
    console.error('获取行为风险错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const getAccountRisks = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, type, page = 1, pageSize = 20 } = req.query;

    const result = await riskControlService.getAccountRisks(
      status as AccountRiskStatus,
      type as AccountRiskType,
      Number(page),
      Number(pageSize)
    );

    res.json(result);
  } catch (error) {
    console.error('获取账号风险错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const processBehaviorRisk = async (req: Request, res: Response): Promise<void> => {
  try {
    const { riskId } = req.params;
    const { confirmed, action, reviewNote } = req.body;
    const reviewerId = req.user?.id;

    if (!reviewerId) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const risk = await riskControlService.processBehaviorRisk(
      riskId,
      reviewerId,
      confirmed,
      action as AccountAction,
      reviewNote
    );

    res.json({ message: '处理完成', risk });
  } catch (error) {
    console.error('处理行为风险错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const processAccountRisk = async (req: Request, res: Response): Promise<void> => {
  try {
    const { riskId } = req.params;
    const { confirmed, action, reviewNote } = req.body;
    const reviewerId = req.user?.id;

    if (!reviewerId) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const risk = await riskControlService.processAccountRisk(
      riskId,
      reviewerId,
      confirmed,
      action as AccountAction,
      reviewNote
    );

    res.json({ message: '处理完成', risk });
  } catch (error) {
    console.error('处理账号风险错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const getLoginLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, status, page = 1, pageSize = 20 } = req.query;

    const { LoginLog } = await import('../entities/LoginLog');
    const { AppDataSource } = await import('../config/database');
    const logRepository = AppDataSource.getRepository(LoginLog);

    const whereCondition: any = {};
    if (userId) {
      whereCondition.userId = userId;
    }
    if (status) {
      whereCondition.status = status;
    }

    const [logs, total] = await logRepository.findAndCount({
      where: whereCondition,
      relations: ['user'],
      order: { createdAt: 'DESC' },
      skip: (Number(page) - 1) * Number(pageSize),
      take: Number(pageSize),
    });

    res.json({ logs, total, page: Number(page), pageSize: Number(pageSize) });
  } catch (error) {
    console.error('获取登录日志错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const getRegisterLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, status, page = 1, pageSize = 20 } = req.query;

    const { RegisterLog } = await import('../entities/RegisterLog');
    const { AppDataSource } = await import('../config/database');
    const logRepository = AppDataSource.getRepository(RegisterLog);

    const whereCondition: any = {};
    if (userId) {
      whereCondition.userId = userId;
    }
    if (status) {
      whereCondition.status = status;
    }

    const [logs, total] = await logRepository.findAndCount({
      where: whereCondition,
      relations: ['user'],
      order: { createdAt: 'DESC' },
      skip: (Number(page) - 1) * Number(pageSize),
      take: Number(pageSize),
    });

    res.json({ logs, total, page: Number(page), pageSize: Number(pageSize) });
  } catch (error) {
    console.error('获取注册日志错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const getSuspiciousRegisters = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, pageSize = 20 } = req.query;

    const { RegisterLog } = await import('../entities/RegisterLog');
    const { AppDataSource } = await import('../config/database');
    const logRepository = AppDataSource.getRepository(RegisterLog);

    const [logs, total] = await logRepository.findAndCount({
      where: { isSuspicious: true },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      skip: (Number(page) - 1) * Number(pageSize),
      take: Number(pageSize),
    });

    res.json({ logs, total, page: Number(page), pageSize: Number(pageSize) });
  } catch (error) {
    console.error('获取可疑注册错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const batchProcessBehaviorRisks = async (req: Request, res: Response): Promise<void> => {
  try {
    const { riskIds, confirmed, action, reviewNote } = req.body;
    const reviewerId = req.user?.id;

    if (!reviewerId) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const results = [];
    for (const riskId of riskIds) {
      try {
        const risk = await riskControlService.processBehaviorRisk(
          riskId,
          reviewerId,
          confirmed,
          action as AccountAction,
          reviewNote
        );
        results.push({ riskId, success: true, risk });
      } catch (e) {
        results.push({ riskId, success: false, error: (e as Error).message });
      }
    }

    res.json({ message: '批量处理完成', results });
  } catch (error) {
    console.error('批量处理行为风险错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const batchProcessAccountRisks = async (req: Request, res: Response): Promise<void> => {
  try {
    const { riskIds, confirmed, action, reviewNote } = req.body;
    const reviewerId = req.user?.id;

    if (!reviewerId) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const results = [];
    for (const riskId of riskIds) {
      try {
        const risk = await riskControlService.processAccountRisk(
          riskId,
          reviewerId,
          confirmed,
          action as AccountAction,
          reviewNote
        );
        results.push({ riskId, success: true, risk });
      } catch (e) {
        results.push({ riskId, success: false, error: (e as Error).message });
      }
    }

    res.json({ message: '批量处理完成', results });
  } catch (error) {
    console.error('批量处理账号风险错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};
