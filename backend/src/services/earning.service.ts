import { AppDataSource } from '../config/database';
import { Earning, EarningType, EarningStatus } from '../entities/Earning';
import { Withdrawal, WithdrawalStatus, WithdrawalMethod } from '../entities/Withdrawal';
import { User } from '../entities/User';
import { Order } from '../entities/Order';

const earningRepository = AppDataSource.getRepository(Earning);
const withdrawalRepository = AppDataSource.getRepository(Withdrawal);
const userRepository = AppDataSource.getRepository(User);

export const getUserEarnings = async (
  userId: string,
  status?: EarningStatus,
  page: number = 1,
  pageSize: number = 20
): Promise<{ earnings: Earning[]; total: number }> => {
  const skip = (page - 1) * pageSize;

  const whereCondition: any = { userId };
  if (status) {
    whereCondition.status = status;
  }

  const [earnings, total] = await earningRepository.findAndCount({
    where: whereCondition,
    relations: ['order'],
    order: { createdAt: 'DESC' },
    skip,
    take: pageSize,
  });

  return { earnings, total };
};

export const getUserEarningsSummary = async (userId: string): Promise<{
  totalEarnings: number;
  availableBalance: number;
  pendingEarnings: number;
  settledEarnings: number;
  totalWithdrawn: number;
  earningsByType: Record<string, number>;
}> => {
  const earnings = await earningRepository.find({ where: { userId } });

  const totalEarnings = earnings.reduce((sum, e) => sum + e.amount, 0);
  const availableBalance = earnings
    .filter(e => e.status === EarningStatus.AVAILABLE)
    .reduce((sum, e) => sum + e.amount, 0);
  const pendingEarnings = earnings
    .filter(e => e.status === EarningStatus.PENDING)
    .reduce((sum, e) => sum + e.amount, 0);
  const settledEarnings = earnings
    .filter(e => e.status === EarningStatus.SETTLED)
    .reduce((sum, e) => sum + e.amount, 0);

  const withdrawals = await withdrawalRepository.find({
    where: { userId, status: WithdrawalStatus.COMPLETED },
  });
  const totalWithdrawn = withdrawals.reduce((sum, w) => sum + w.amount, 0);

  const earningsByType: Record<string, number> = {};
  for (const earning of earnings) {
    earningsByType[earning.type] = (earningsByType[earning.type] || 0) + earning.amount;
  }

  return {
    totalEarnings,
    availableBalance,
    pendingEarnings,
    settledEarnings,
    totalWithdrawn,
    earningsByType,
  };
};

export const settlePendingEarnings = async (): Promise<void> => {
  const now = new Date();
  const pendingEarnings = await earningRepository
    .createQueryBuilder('earning')
    .where('earning.status = :status', { status: EarningStatus.PENDING })
    .andWhere('earning.settlementDate < :now', { now })
    .getMany();

  for (const earning of pendingEarnings) {
    earning.status = EarningStatus.AVAILABLE;
    await earningRepository.save(earning);
  }
};

export const createTipEarning = async (
  userId: string,
  fromUserId: string,
  amount: number,
  noteId?: string
): Promise<Earning> => {
  const platformFee = amount * 0.1;
  const netAmount = amount - platformFee;

  const earning = earningRepository.create({
    userId,
    type: EarningType.TIP,
    status: EarningStatus.AVAILABLE,
    amount: netAmount,
    description: `来自用户${fromUserId}的打赏`,
    sourceId: noteId,
    sourceType: 'tip',
    platformFee,
    taxAmount: 0,
  });

  return await earningRepository.save(earning);
};

export const createAdRevenueEarning = async (
  userId: string,
  amount: number,
  period: string
): Promise<Earning> => {
  const platformFee = amount * 0.3;
  const netAmount = amount - platformFee;

  const earning = earningRepository.create({
    userId,
    type: EarningType.AD_REVENUE,
    status: EarningStatus.AVAILABLE,
    amount: netAmount,
    description: `${period}广告分成收益`,
    sourceType: 'ad_revenue',
    platformFee,
    taxAmount: 0,
  });

  return await earningRepository.save(earning);
};

export const createWithdrawal = async (
  userId: string,
  amount: number,
  method: WithdrawalMethod,
  accountInfo: any
): Promise<Withdrawal> => {
  const summary = await getUserEarningsSummary(userId);

  if (amount > summary.availableBalance) {
    throw new Error('可提现余额不足');
  }

  if (amount < 10) {
    throw new Error('最低提现金额为10元');
  }

  const fee = Math.min(amount * 0.01, 2);
  const actualAmount = amount - fee;

  const withdrawal = withdrawalRepository.create({
    userId,
    method,
    amount,
    fee,
    actualAmount,
    accountInfo,
    status: WithdrawalStatus.PENDING,
  });

  const savedWithdrawal = await withdrawalRepository.save(withdrawal);

  const earnings = await earningRepository.find({
    where: { userId, status: EarningStatus.AVAILABLE },
    order: { createdAt: 'ASC' },
  });

  let remainingAmount = amount;
  for (const earning of earnings) {
    if (remainingAmount <= 0) break;
    if (earning.amount <= remainingAmount) {
      earning.status = EarningStatus.SETTLED;
      remainingAmount -= earning.amount;
    } else {
      earning.amount -= remainingAmount;
      remainingAmount = 0;
    }
    await earningRepository.save(earning);
  }

  return savedWithdrawal;
};

export const getWithdrawals = async (
  userId: string,
  status?: WithdrawalStatus,
  page: number = 1,
  pageSize: number = 20
): Promise<{ withdrawals: Withdrawal[]; total: number }> => {
  const skip = (page - 1) * pageSize;

  const whereCondition: any = { userId };
  if (status) {
    whereCondition.status = status;
  }

  const [withdrawals, total] = await withdrawalRepository.findAndCount({
    where: whereCondition,
    order: { createdAt: 'DESC' },
    skip,
    take: pageSize,
  });

  return { withdrawals, total };
};

export const processWithdrawal = async (
  withdrawalId: string,
  processorId: string,
  status: WithdrawalStatus,
  transactionId?: string,
  rejectReason?: string
): Promise<Withdrawal> => {
  const withdrawal = await withdrawalRepository.findOne({ where: { id: withdrawalId } });
  if (!withdrawal) {
    throw new Error('提现申请不存在');
  }

  if (withdrawal.status !== WithdrawalStatus.PENDING) {
    throw new Error('提现申请状态不正确');
  }

  withdrawal.status = status;
  withdrawal.processorId = processorId;
  withdrawal.processedAt = new Date();

  if (status === WithdrawalStatus.COMPLETED) {
    withdrawal.transactionId = transactionId || '';
    withdrawal.completedAt = new Date();
  } else if (status === WithdrawalStatus.REJECTED) {
    withdrawal.rejectReason = rejectReason || '';
    const earnings = await earningRepository.find({
      where: { userId: withdrawal.userId, status: EarningStatus.SETTLED },
      take: 100,
    });

    let refundAmount = withdrawal.amount;
    for (const earning of earnings) {
      if (refundAmount <= 0) break;
      earning.status = EarningStatus.AVAILABLE;
      refundAmount -= earning.amount;
      await earningRepository.save(earning);
    }
  }

  return await withdrawalRepository.save(withdrawal);
};

export const getEarningsByDateRange = async (
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<{
  earnings: Earning[];
  summary: {
    total: number;
    byType: Record<string, number>;
    daily: { date: string; amount: number }[];
  };
}> => {
  const earnings = await earningRepository
    .createQueryBuilder('earning')
    .where('earning.userId = :userId', { userId })
    .andWhere('earning.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
    .orderBy('earning.createdAt', 'DESC')
    .getMany();

  const total = earnings.reduce((sum, e) => sum + e.amount, 0);

  const byType: Record<string, number> = {};
  for (const earning of earnings) {
    byType[earning.type] = (byType[earning.type] || 0) + earning.amount;
  }

  const dailyMap: Record<string, number> = {};
  for (const earning of earnings) {
    const date = earning.createdAt.toISOString().split('T')[0];
    dailyMap[date] = (dailyMap[date] || 0) + earning.amount;
  }

  const daily = Object.entries(dailyMap)
    .map(([date, amount]) => ({ date, amount }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    earnings,
    summary: {
      total,
      byType,
      daily,
    },
  };
};
