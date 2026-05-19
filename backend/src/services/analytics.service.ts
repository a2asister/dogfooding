import { AppDataSource } from '../config/database';
import { DailySiteStats } from '../entities/DailySiteStats';
import { TrafficSource } from '../entities/TrafficSource';
import { User } from '../entities/User';
import { Note, NoteStatus } from '../entities/Note';
import { UserBehavior, BehaviorType } from '../entities/UserBehavior';
import { CreatorData } from '../entities/CreatorData';
import { MoreThan } from 'typeorm';

const dailyStatsRepository = AppDataSource.getRepository(DailySiteStats);
const trafficSourceRepository = AppDataSource.getRepository(TrafficSource);
const userRepository = AppDataSource.getRepository(User);
const noteRepository = AppDataSource.getRepository(Note);
const userBehaviorRepository = AppDataSource.getRepository(UserBehavior);
const creatorDataRepository = AppDataSource.getRepository(CreatorData);

export const generateDailyStats = async (date?: Date): Promise<DailySiteStats> => {
  const targetDate = date || new Date();
  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);

  const existing = await dailyStatsRepository.findOne({
    where: { date: startOfDay },
  });

  if (existing) {
    return existing;
  }

  const totalUsers = await userRepository.count();
  const newUsers = await userRepository.count({
    where: { createdAt: MoreThan(startOfDay) as any },
  });

  const newNotes = await noteRepository.count({
    where: { createdAt: MoreThan(startOfDay) as any, status: NoteStatus.PUBLISHED },
  });
  const totalNotes = await noteRepository.count({ where: { status: NoteStatus.PUBLISHED } });

  const behaviors = await userBehaviorRepository.find({
    where: { createdAt: MoreThan(startOfDay) as any },
  });

  const uniqueVisitors = new Set(
    behaviors
      .filter(b => b.behaviorType === BehaviorType.VIEW)
      .map(b => b.userId || b.ip)
  ).size;

  const pageViews = behaviors.filter(b => b.behaviorType === BehaviorType.VIEW).length;
  const newLikes = behaviors.filter(b => b.behaviorType === BehaviorType.LIKE).length;
  const newComments = behaviors.filter(b => b.behaviorType === BehaviorType.COMMENT).length;
  const newFavorites = behaviors.filter(b => b.behaviorType === BehaviorType.FAVORITE).length;
  const newFollows = behaviors.filter(b => b.behaviorType === BehaviorType.FOLLOW).length;
  const newShares = behaviors.filter(b => b.behaviorType === BehaviorType.SHARE).length;

  const activeUsers = new Set(behaviors.map(b => b.userId).filter(Boolean)).size;

  const trafficSources = await calculateTrafficSources(startOfDay, endOfDay);
  const deviceStats = await calculateDeviceStats(startOfDay, endOfDay);
  const regionStats = await calculateRegionStats(startOfDay, endOfDay);
  const retentionRates = await calculateRetentionRates(targetDate);
  const conversionFunnel = await calculateConversionFunnel(startOfDay, endOfDay);

  const stats = dailyStatsRepository.create({
    date: startOfDay,
    totalUsers,
    newUsers,
    activeUsers,
    pageViews,
    uniqueVisitors,
    newNotes,
    totalNotes,
    newComments,
    newLikes,
    newFavorites,
    newFollows,
    newShares,
    trafficSources,
    deviceStats,
    regionStats,
    retentionRates,
    conversionFunnel,
  });

  return await dailyStatsRepository.save(stats);
};

export const calculateTrafficSources = async (startDate: Date, endDate: Date): Promise<any> => {
  const behaviors = await userBehaviorRepository
    .createQueryBuilder('behavior')
    .where('behavior.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
    .andWhere('behavior.metadata IS NOT NULL')
    .getMany();

  const sources: any = {
    direct: 0,
    search: 0,
    social: 0,
    referral: 0,
    email: 0,
    other: 0,
  };

  for (const behavior of behaviors) {
    const metadata = behavior.metadata as any;
    const source = metadata?.source || 'direct';

    if (sources[source] !== undefined) {
      sources[source]++;
    } else {
      sources.other++;
    }
  }

  return sources;
};

export const calculateDeviceStats = async (startDate: Date, endDate: Date): Promise<any> => {
  const behaviors = await userBehaviorRepository
    .createQueryBuilder('behavior')
    .where('behavior.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
    .andWhere('behavior.userAgent IS NOT NULL')
    .getMany();

  const stats = {
    mobile: 0,
    desktop: 0,
    tablet: 0,
  };

  for (const behavior of behaviors) {
    const ua = behavior.userAgent?.toLowerCase() || '';
    if (/mobile|android|iphone|ipad|ipod/.test(ua)) {
      if (/ipad|tablet/.test(ua)) {
        stats.tablet++;
      } else {
        stats.mobile++;
      }
    } else {
      stats.desktop++;
    }
  }

  return stats;
};

export const calculateRegionStats = async (startDate: Date, endDate: Date): Promise<any> => {
  const behaviors = await userBehaviorRepository
    .createQueryBuilder('behavior')
    .where('behavior.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
    .andWhere('behavior.ip IS NOT NULL')
    .getMany();

  const regions: Record<string, number> = {};

  for (const behavior of behaviors) {
    const ip = behavior.ip;
    if (ip) {
      regions[ip] = (regions[ip] || 0) + 1;
    }
  }

  return regions;
};

export const calculateRetentionRates = async (date: Date): Promise<any> => {
  const day1 = await calculateRetention(date, 1);
  const day3 = await calculateRetention(date, 3);
  const day7 = await calculateRetention(date, 7);
  const day14 = await calculateRetention(date, 14);
  const day30 = await calculateRetention(date, 30);

  return {
    day1,
    day3,
    day7,
    day14,
    day30,
  };
};

export const calculateRetention = async (date: Date, days: number): Promise<number> => {
  const cohortStart = new Date(date.getTime() - days * 24 * 60 * 60 * 1000);
  const cohortEnd = new Date(cohortStart.getTime() + 24 * 60 * 60 * 1000);

  const cohortUsers = await userRepository
    .createQueryBuilder('user')
    .where('user.createdAt BETWEEN :start AND :end', { start: cohortStart, end: cohortEnd })
    .getMany();

  if (cohortUsers.length === 0) return 0;

  const cohortUserIds = cohortUsers.map(u => u.id);
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const returningUsers = await userBehaviorRepository
    .createQueryBuilder('behavior')
    .where('behavior.userId IN (:...userIds)', { userIds: cohortUserIds })
    .andWhere('behavior.createdAt >= :startOfDay', { startOfDay })
    .select('DISTINCT behavior.userId')
    .getRawMany();

  return (returningUsers.length / cohortUsers.length) * 100;
};

export const calculateConversionFunnel = async (startDate: Date, endDate: Date): Promise<any> => {
  const visitors = await userBehaviorRepository
    .createQueryBuilder('behavior')
    .where('behavior.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
    .andWhere('behavior.behaviorType = :type', { type: BehaviorType.VIEW })
    .select('DISTINCT behavior.ip')
    .getRawMany();

  const registeredUsers = await userRepository
    .createQueryBuilder('user')
    .where('user.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
    .getCount();

  const creators = await creatorDataRepository
    .createQueryBuilder('data')
    .where('data.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
    .select('DISTINCT data.userId')
    .getRawMany();

  const earners = await AppDataSource.getRepository('Earning')
    .createQueryBuilder('earning')
    .where('earning.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
    .andWhere('earning.amount > 0')
    .select('DISTINCT earning.userId')
    .getRawMany();

  const paidUsers = await AppDataSource.getRepository('Order')
    .createQueryBuilder('order')
    .where('order.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
    .andWhere('order.status = :status', { status: 'paid' })
    .select('DISTINCT order.userId')
    .getRawMany();

  return {
    visitorToUser: visitors.length > 0 ? (registeredUsers / visitors.length) * 100 : 0,
    userToCreator: registeredUsers > 0 ? (creators.length / registeredUsers) * 100 : 0,
    creatorToEarner: creators.length > 0 ? (earners.length / creators.length) * 100 : 0,
    userToPaid: registeredUsers > 0 ? (paidUsers.length / registeredUsers) * 100 : 0,
  };
};

export const getStatsRange = async (
  startDate: Date,
  endDate: Date
): Promise<{
  dailyStats: DailySiteStats[];
  summary: any;
}> => {
  const dailyStats = await dailyStatsRepository
    .createQueryBuilder('stats')
    .where('stats.date BETWEEN :startDate AND :endDate', { startDate, endDate })
    .orderBy('stats.date', 'ASC')
    .getMany();

  const summary = {
    totalPageViews: 0,
    totalUniqueVisitors: 0,
    totalNewUsers: 0,
    totalNewNotes: 0,
    totalActiveUsers: 0,
    avgPageViewsPerDay: 0,
    avgActiveUsersPerDay: 0,
    totalRevenue: 0,
  };

  for (const stats of dailyStats) {
    summary.totalPageViews += stats.pageViews;
    summary.totalUniqueVisitors += stats.uniqueVisitors;
    summary.totalNewUsers += stats.newUsers;
    summary.totalNewNotes += stats.newNotes;
    summary.totalActiveUsers += stats.activeUsers;
    summary.totalRevenue += stats.totalRevenue;
  }

  if (dailyStats.length > 0) {
    summary.avgPageViewsPerDay = summary.totalPageViews / dailyStats.length;
    summary.avgActiveUsersPerDay = summary.totalActiveUsers / dailyStats.length;
  }

  return { dailyStats, summary };
};

export const getRealtimeStats = async (): Promise<any> => {
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);

  const todayViews = await userBehaviorRepository.count({
    where: {
      behaviorType: BehaviorType.VIEW,
      createdAt: MoreThan(startOfDay) as any,
    },
  });

  const todayNewUsers = await userRepository.count({
    where: { createdAt: MoreThan(startOfDay) as any },
  });

  const todayNewNotes = await noteRepository.count({
    where: {
      createdAt: MoreThan(startOfDay) as any,
      status: NoteStatus.PUBLISHED,
    },
  });

  const totalUsers = await userRepository.count();
  const totalNotes = await noteRepository.count({ where: { status: NoteStatus.PUBLISHED } });

  return {
    todayViews,
    todayNewUsers,
    todayNewNotes,
    totalUsers,
    totalNotes,
    timestamp: now,
  };
};

export const recordTrafficSource = async (
  source: string,
  medium: string,
  options: {
    campaign?: string;
    keyword?: string;
    referralUrl?: string;
    visits?: number;
    uniqueVisitors?: number;
    newUsers?: number;
  } = {}
): Promise<TrafficSource> => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existing = await trafficSourceRepository.findOne({
    where: { source, medium, date: today },
  });

  if (existing) {
    existing.visits += options.visits || 1;
    existing.uniqueVisitors += options.uniqueVisitors || 0;
    existing.newUsers += options.newUsers || 0;
    return await trafficSourceRepository.save(existing);
  }

  const trafficSource = trafficSourceRepository.create({
    source,
    medium,
    campaign: options.campaign,
    keyword: options.keyword,
    referralUrl: options.referralUrl,
    date: today,
    visits: options.visits || 1,
    uniqueVisitors: options.uniqueVisitors || 0,
    newUsers: options.newUsers || 0,
  });

  return await trafficSourceRepository.save(trafficSource);
};

export const getTrafficSources = async (
  startDate: Date,
  endDate: Date
): Promise<TrafficSource[]> => {
  return await trafficSourceRepository
    .createQueryBuilder('source')
    .where('source.date BETWEEN :startDate AND :endDate', { startDate, endDate })
    .orderBy('source.visits', 'DESC')
    .getMany();
};

export const getOverview = async (): Promise<any> => {
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);

  const endOfYesterday = new Date(startOfYesterday);
  endOfYesterday.setHours(23, 59, 59, 999);

  const totalUsers = await userRepository.count();
  const totalNotes = await noteRepository.count({ where: { status: NoteStatus.PUBLISHED } });
  const todayNewUsers = await userRepository.count({ where: { createdAt: MoreThan(startOfToday) as any } });
  const todayViews = await userBehaviorRepository.count({ where: { behaviorType: BehaviorType.VIEW, createdAt: MoreThan(startOfToday) as any } });
  const todayActiveUsers = await userBehaviorRepository
    .createQueryBuilder('behavior')
    .where('behavior.createdAt >= :startOfToday', { startOfToday })
    .select('COUNT(DISTINCT behavior.userId) as count')
    .getRawOne();

  const yesterdayNewUsers = await userRepository
    .createQueryBuilder('user')
    .where('user.createdAt BETWEEN :start AND :end', { start: startOfYesterday, end: endOfYesterday })
    .getCount();

  const yesterdayViews = await userBehaviorRepository
    .createQueryBuilder('behavior')
    .where('behavior.behaviorType = :type', { type: BehaviorType.VIEW })
    .andWhere('behavior.createdAt BETWEEN :start AND :end', { start: startOfYesterday, end: endOfYesterday })
    .getCount();

  const yesterdayActiveUsers = await userBehaviorRepository
    .createQueryBuilder('behavior')
    .where('behavior.createdAt BETWEEN :start AND :end', { start: startOfYesterday, end: endOfYesterday })
    .select('COUNT(DISTINCT behavior.userId) as count')
    .getRawOne();

  const day1Retention = await calculateRetention(now, 1);
  const day7Retention = await calculateRetention(now, 7);
  const day30Retention = await calculateRetention(now, 30);

  return {
    totalUsers,
    totalNotes,
    todayNewUsers,
    todayViews,
    todayActiveUsers: todayActiveUsers?.count || 0,
    yesterdayNewUsers,
    yesterdayViews,
    yesterdayActiveUsers: yesterdayActiveUsers?.count || 0,
    day1Retention,
    day7Retention,
    day30Retention,
    totalRevenue: 0,
    totalOrders: 0,
    conversionRate: 0,
  };
};

export const getDailyStatsRange = async (
  startDate: Date,
  endDate: Date
): Promise<DailySiteStats[]> => {
  return await dailyStatsRepository
    .createQueryBuilder('stats')
    .where('stats.date BETWEEN :startDate AND :endDate', { startDate, endDate })
    .orderBy('stats.date', 'ASC')
    .getMany();
};

export const getRetentionStats = async (
  startDate: Date,
  endDate: Date
): Promise<any> => {
  const day1 = await calculateRetention(endDate, 1);
  const day7 = await calculateRetention(endDate, 7);
  const day30 = await calculateRetention(endDate, 30);

  const trend: any[] = [];
  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  for (let i = 0; i < Math.min(days, 30); i++) {
    const date = new Date(endDate.getTime() - i * 24 * 60 * 60 * 1000);
    trend.push({
      date: date.toISOString().split('T')[0],
      day1: await calculateRetention(date, 1),
      day7: await calculateRetention(date, 7),
      day30: await calculateRetention(date, 30),
    });
  }

  return {
    day1,
    day7,
    day30,
    trend: trend.reverse(),
  };
};

export const getEngagementStats = async (
  startDate: Date,
  endDate: Date
): Promise<any> => {
  const behaviors = await userBehaviorRepository
    .createQueryBuilder('behavior')
    .where('behavior.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
    .getMany();

  const totalInteractions = behaviors.length;
  const views = behaviors.filter(b => b.behaviorType === BehaviorType.VIEW).length;
  const avgEngagementRate = views > 0 ? (totalInteractions / views) * 100 : 0;

  const dailyStats = new Map<string, { count: number; views: number }>();
  for (const behavior of behaviors) {
    const date = new Date(behavior.createdAt).toISOString().split('T')[0];
    if (!dailyStats.has(date)) {
      dailyStats.set(date, { count: 0, views: 0 });
    }
    const stats = dailyStats.get(date)!;
    stats.count++;
    if (behavior.behaviorType === BehaviorType.VIEW) {
      stats.views++;
    }
  }

  const interactionTrend = Array.from(dailyStats.entries()).map(([date, stats]) => ({
    date,
    count: stats.count,
    rate: stats.views > 0 ? (stats.count / stats.views) * 100 : 0,
  }));

  return {
    avgEngagementRate,
    totalInteractions,
    interactionTrend,
  };
};

export const getContentPerformance = async (
  options: {
    page?: number;
    pageSize?: number;
    startDate?: Date;
    endDate?: Date;
    sortBy?: 'views' | 'likes' | 'comments' | 'engagement';
  } = {}
): Promise<any> => {
  const { page = 1, pageSize = 10, startDate, endDate, sortBy = 'views' } = options;

  let queryBuilder = noteRepository
    .createQueryBuilder('note')
    .leftJoinAndSelect('note.stats', 'stats')
    .where('note.status = :status', { status: NoteStatus.PUBLISHED });

  if (startDate && endDate) {
    queryBuilder = queryBuilder.andWhere('note.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate });
  }

  const sortField = sortBy === 'views' ? 'stats.views' :
    sortBy === 'likes' ? 'stats.likes' :
    sortBy === 'comments' ? 'stats.comments' : 'stats.views';

  queryBuilder = queryBuilder.orderBy(sortField, 'DESC');

  const [notes, total] = await queryBuilder
    .skip((page - 1) * pageSize)
    .take(pageSize)
    .getManyAndCount();

  const list = notes.map(note => {
    const views = (note as any).stats?.views || 0;
    const likes = (note as any).stats?.likes || 0;
    const comments = (note as any).stats?.comments || 0;
    const favorites = (note as any).stats?.favorites || 0;
    const engagementRate = views > 0 ? ((likes + comments + favorites) / views) * 100 : 0;
    const hotScore = views * 1 + likes * 5 + comments * 10 + favorites * 3;

    return {
      noteId: note.id,
      title: note.title,
      views,
      likes,
      comments,
      favorites,
      engagementRate,
      hotScore,
    };
  });

  return { list, total };
};
