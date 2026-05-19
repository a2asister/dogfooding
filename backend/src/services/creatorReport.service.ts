import { AppDataSource } from '../config/database';
import { CreatorReport, ReportType } from '../entities/CreatorReport';
import { User } from '../entities/User';
import { Note, NoteStatus } from '../entities/Note';
import { Earning, EarningStatus } from '../entities/Earning';
import { Follow } from '../entities/Follow';
import { UserBehavior, BehaviorType } from '../entities/UserBehavior';
import { MoreThan, Between, In } from 'typeorm';

const creatorReportRepository = AppDataSource.getRepository(CreatorReport);
const userRepository = AppDataSource.getRepository(User);
const noteRepository = AppDataSource.getRepository(Note);
const earningRepository = AppDataSource.getRepository(Earning);
const followRepository = AppDataSource.getRepository(Follow);
const userBehaviorRepository = AppDataSource.getRepository(UserBehavior);

export const generateCreatorReport = async (
  userId: string,
  reportType: ReportType,
  date?: Date
): Promise<CreatorReport> => {
  const user = await userRepository.findOne({ where: { id: userId } });
  if (!user) {
    throw new Error('用户不存在');
  }

  const targetDate = date || new Date();
  let periodStart: Date;
  let periodEnd: Date;

  if (reportType === ReportType.DAILY) {
    periodStart = new Date(targetDate);
    periodStart.setHours(0, 0, 0, 0);
    periodEnd = new Date(targetDate);
    periodEnd.setHours(23, 59, 59, 999);
  } else if (reportType === ReportType.WEEKLY) {
    const dayOfWeek = targetDate.getDay();
    periodStart = new Date(targetDate);
    periodStart.setDate(targetDate.getDate() - dayOfWeek);
    periodStart.setHours(0, 0, 0, 0);
    periodEnd = new Date(periodStart);
    periodEnd.setDate(periodStart.getDate() + 6);
    periodEnd.setHours(23, 59, 59, 999);
  } else {
    periodStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
    periodEnd = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);
    periodEnd.setHours(23, 59, 59, 999);
  }

  const existing = await creatorReportRepository.findOne({
    where: { userId, reportType, periodStart },
  });

  if (existing) {
    return existing;
  }

  const notes = await noteRepository.find({
    where: {
      authorId: userId,
      status: NoteStatus.PUBLISHED,
      createdAt: Between(periodStart, periodEnd) as any,
    },
  });

  const totalViews = notes.reduce((sum, note) => sum + note.viewCount, 0);
  const totalLikes = notes.reduce((sum, note) => sum + note.likeCount, 0);
  const totalComments = notes.reduce((sum, note) => sum + note.commentCount, 0);
  const totalFavorites = notes.reduce((sum, note) => sum + note.favoriteCount, 0);
  const totalShares = notes.reduce((sum, note) => sum + note.shareCount, 0);
  const newNotes = notes.length;

  const newFollowers = await followRepository.count({
    where: { followingId: userId, createdAt: Between(periodStart, periodEnd) as any },
  });

  const previousPeriodStart = new Date(periodStart.getTime() - (periodEnd.getTime() - periodStart.getTime()));
  const previousFollowers = await followRepository.count({
    where: { followingId: userId, createdAt: Between(previousPeriodStart, periodStart) as any },
  });

  const lostFollowers = Math.max(0, previousFollowers - newFollowers);
  const netFollowers = newFollowers - lostFollowers;
  const fanGrowthRate = previousFollowers > 0 ? (netFollowers / previousFollowers) * 100 : 0;

  const avgEngagementRate = totalViews > 0
    ? ((totalLikes + totalComments + totalFavorites) / (totalViews * 3)) * 100
    : 0;

  const earnings = await earningRepository.find({
    where: { userId, createdAt: Between(periodStart, periodEnd) as any },
  });

  const totalEarnings = earnings.reduce((sum, e) => sum + e.amount, 0);
  const earningsBreakdown: any = {
    commission: 0,
    tips: 0,
    subscriptions: 0,
    adRevenue: 0,
    platformRewards: 0,
    other: 0,
  };

  for (const earning of earnings) {
    if (earning.type === 'commission') earningsBreakdown.commission += earning.amount;
    else if (earning.type === 'tip') earningsBreakdown.tips += earning.amount;
    else if (earning.type === 'subscription') earningsBreakdown.subscriptions += earning.amount;
    else if (earning.type === 'ad_revenue') earningsBreakdown.adRevenue += earning.amount;
    else if (earning.type === 'platform_reward') earningsBreakdown.platformRewards += earning.amount;
    else earningsBreakdown.other += earning.amount;
  }

  const topPerformingNotes = notes
    .sort((a, b) => (b.viewCount + b.likeCount * 10) - (a.viewCount + a.likeCount * 10))
    .slice(0, 10)
    .map(note => ({
      noteId: note.id,
      title: note.title,
      views: note.viewCount,
      likes: note.likeCount,
      comments: note.commentCount,
      engagementRate: note.viewCount > 0 ? ((note.likeCount + note.commentCount + note.favoriteCount) / (note.viewCount * 3)) * 100 : 0,
      earnings: 0,
    }));

  const noteIds = notes.map(n => n.id);
  
  const behaviors = await userBehaviorRepository.find({
    where: {
      noteId: In(noteIds) as any,
      createdAt: Between(periodStart, periodEnd) as any,
    },
    take: 1000,
  });

  const uniqueUserIds = new Set(behaviors.map(b => b.userId).filter(Boolean));
  const activeFans = uniqueUserIds.size;

  const userInteractions: Record<string, number> = {};
  for (const behavior of behaviors) {
    if (behavior.userId) {
      userInteractions[behavior.userId] = (userInteractions[behavior.userId] || 0) + 1;
    }
  }

  const topInteractions = Object.entries(userInteractions)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([id, interactions]) => ({ userId: id, nickname: '', interactions }));

  const trafficSourceMap: Record<string, number> = {};
  for (const behavior of behaviors) {
    const source = (behavior.metadata as any)?.source || 'direct';
    trafficSourceMap[source] = (trafficSourceMap[source] || 0) + 1;
  }

  const totalBehaviors = behaviors.length;
  const trafficSources = Object.entries(trafficSourceMap).map(([source, visits]) => ({
    source,
    visits,
    percentage: totalBehaviors > 0 ? (visits / totalBehaviors) * 100 : 0,
  }));

  const insights = generateInsights({
    totalViews,
    totalLikes,
    totalComments,
    totalFavorites,
    newFollowers,
    avgEngagementRate,
    totalEarnings,
    topNotes: topPerformingNotes,
  });

  const previousNotes = await noteRepository.find({
    where: {
      authorId: userId,
      status: NoteStatus.PUBLISHED,
      createdAt: Between(previousPeriodStart, periodStart) as any,
    },
  });

  const previousViews = previousNotes.reduce((sum, note) => sum + note.viewCount, 0);
  const previousLikes = previousNotes.reduce((sum, note) => sum + note.likeCount, 0);

  const comparison = {
    viewsChange: previousViews > 0 ? ((totalViews - previousViews) / previousViews) * 100 : 0,
    likesChange: previousLikes > 0 ? ((totalLikes - previousLikes) / previousLikes) * 100 : 0,
    followersChange: previousFollowers > 0 ? ((newFollowers - previousFollowers) / previousFollowers) * 100 : 0,
    earningsChange: 0,
    engagementChange: 0,
  };

  const report = creatorReportRepository.create({
    userId,
    user,
    reportType,
    periodStart,
    periodEnd,
    totalViews,
    totalLikes,
    totalComments,
    totalFavorites,
    totalShares,
    newFollowers,
    lostFollowers,
    netFollowers,
    newNotes,
    avgEngagementRate,
    fanGrowthRate,
    totalEarnings,
    earningsBreakdown,
    topPerformingNotes,
    fanActivity: {
      activeFans,
      newFans: newFollowers,
      returningFans: Math.max(0, activeFans - newFollowers),
      fanDemographics: {},
      topInteractions,
    },
    trafficSources,
    insights,
    comparison,
  });

  return await creatorReportRepository.save(report);
};

const generateInsights = (data: any): any => {
  const strengths: string[] = [];
  const improvements: string[] = [];
  const recommendations: string[] = [];
  const opportunities: string[] = [];

  if (data.avgEngagementRate > 5) {
    strengths.push('用户互动率表现优秀，内容质量较高');
  }
  if (data.newFollowers > 10) {
    strengths.push('粉丝增长趋势良好');
  }
  if (data.totalEarnings > 0) {
    strengths.push('已实现内容变现');
  }

  if (data.avgEngagementRate < 2) {
    improvements.push('互动率偏低，建议优化内容质量和互动引导');
  }
  if (data.totalViews < 100) {
    improvements.push('曝光量不足，建议增加推广或优化标题封面');
  }
  if (data.newNotes < 3) {
    improvements.push('更新频率较低，建议保持稳定的创作节奏');
  }

  recommendations.push('建议在内容中增加互动提问，提升评论率');
  recommendations.push('可以尝试使用推广功能增加作品曝光');
  recommendations.push('关注热门话题，结合热点创作内容');

  if (data.topNotes && data.topNotes.length > 0) {
    const topNote = data.topNotes[0];
    opportunities.push(`"${topNote.title}"表现优秀，可考虑创作同类型内容`);
  }
  if (data.totalEarnings > 0) {
    opportunities.push('可以尝试开通付费笔记或会员服务增加收入');
  }

  return { strengths, improvements, recommendations, opportunities };
};

export const getCreatorReports = async (
  userId: string,
  reportType?: ReportType,
  page: number = 1,
  pageSize: number = 20
): Promise<{ reports: CreatorReport[]; total: number }> => {
  const skip = (page - 1) * pageSize;

  const whereCondition: any = { userId };
  if (reportType) {
    whereCondition.reportType = reportType;
  }

  const [reports, total] = await creatorReportRepository.findAndCount({
    where: whereCondition,
    order: { periodStart: 'DESC' },
    skip,
    take: pageSize,
  });

  return { reports, total };
};

export const getLatestCreatorReport = async (
  userId: string,
  reportType: ReportType = ReportType.WEEKLY
): Promise<CreatorReport | null> => {
  return await creatorReportRepository.findOne({
    where: { userId, reportType },
    order: { periodStart: 'DESC' },
  });
};

export const generateAllDailyReports = async (): Promise<void> => {
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  const creators = await userRepository
    .createQueryBuilder('user')
    .innerJoin('notes', 'n', 'n.authorId = user.id')
    .where('n.status = :status', { status: NoteStatus.PUBLISHED })
    .select('DISTINCT user.id')
    .getRawMany();

  for (const creator of creators) {
    try {
      await generateCreatorReport(creator.user_id, ReportType.DAILY, yesterday);
    } catch (error) {
      console.error(`生成用户 ${creator.user_id} 日报失败:`, error);
    }
  }
};

export const generateWeeklyReports = async (): Promise<void> => {
  const today = new Date();
  const creators = await userRepository
    .createQueryBuilder('user')
    .innerJoin('notes', 'n', 'n.authorId = user.id')
    .where('n.status = :status', { status: NoteStatus.PUBLISHED })
    .select('DISTINCT user.id')
    .getRawMany();

  for (const creator of creators) {
    try {
      await generateCreatorReport(creator.user_id, ReportType.WEEKLY, today);
    } catch (error) {
      console.error(`生成用户 ${creator.user_id} 周报失败:`, error);
    }
  }
};
