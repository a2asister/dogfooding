import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { Note, NoteStatus } from '../entities/Note';
import { CreatorData } from '../entities/CreatorData';
import { CreatorVerification, VerificationType, VerificationStatus } from '../entities/CreatorVerification';
import { UserTagRelation } from '../entities/UserTagRelation';
import { Follow } from '../entities/Follow';
import { MoreThan, FindOperator } from 'typeorm';

const userRepository = AppDataSource.getRepository(User);
const noteRepository = AppDataSource.getRepository(Note);
const creatorDataRepository = AppDataSource.getRepository(CreatorData);
const creatorVerificationRepository = AppDataSource.getRepository(CreatorVerification);
const userTagRelationRepository = AppDataSource.getRepository(UserTagRelation);
const followRepository = AppDataSource.getRepository(Follow);

export const generateCreatorDailyData = async (userId: string, date?: Date): Promise<CreatorData> => {
  const targetDate = date || new Date();
  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);

  const existingData = await creatorDataRepository.findOne({
    where: { userId, date: targetDate },
  });

  if (existingData) {
    return existingData;
  }

  const notes = await noteRepository.find({
    where: {
      author: { id: userId },
      createdAt: MoreThan(startOfDay) as FindOperator<Date>,
    },
  });

  const totalViews = notes.reduce((sum, note) => sum + note.viewCount, 0);
  const totalLikes = notes.reduce((sum, note) => sum + note.likeCount, 0);
  const totalComments = notes.reduce((sum, note) => sum + note.commentCount, 0);
  const totalFavorites = notes.reduce((sum, note) => sum + note.favoriteCount, 0);
  const totalShares = notes.reduce((sum, note) => sum + note.shareCount, 0);

  const newFollowers = await followRepository.count({
    where: {
      followingId: userId,
      createdAt: MoreThan(startOfDay) as FindOperator<Date>,
    },
  });

  const newNotes = notes.length;

  const noteStats = notes.map(note => ({
    noteId: note.id,
    title: note.title,
    views: note.viewCount,
    likes: note.likeCount,
    comments: note.commentCount,
    favorites: note.favoriteCount,
  }));

  const engagementRate = totalViews > 0
    ? Number(((totalLikes + totalComments + totalFavorites) / (totalViews * 3) * 100).toFixed(4))
    : 0;

  const fanDemographics = await generateFanDemographics(userId);

  const creatorData = creatorDataRepository.create({
    userId,
    date: targetDate,
    totalViews,
    totalLikes,
    totalComments,
    totalFavorites,
    totalShares,
    newFollowers,
    newNotes,
    engagementRate: Number(engagementRate),
    noteStats,
    fanDemographics,
  });

  return await creatorDataRepository.save(creatorData);
};

const generateFanDemographics = async (userId: string) => {
  const followers = await followRepository.find({
    where: { followingId: userId },
    relations: ['follower'],
    take: 100,
  });

  const demographics: any = {
    gender: { male: 0, female: 0, unknown: 0 },
    age: {},
    location: {},
    interests: {},
  };

  const tagMap = new Map<string, number>();

  for (const follow of followers) {
    const follower = follow.follower;
    if (!follower) continue;

    if (follower.gender === 'male') {
      demographics.gender.male++;
    } else if (follower.gender === 'female') {
      demographics.gender.female++;
    } else {
      demographics.gender.unknown++;
    }

    if (follower.location) {
      demographics.location[follower.location] = (demographics.location[follower.location] || 0) + 1;
    }

    const userTags = await userTagRelationRepository.find({
      where: { userId: follower.id },
      relations: ['tag'],
      take: 5,
    });

    for (const tagRelation of userTags) {
      const tagName = tagRelation.tag.name;
      tagMap.set(tagName, (tagMap.get(tagName) || 0) + 1);
    }
  }

  const topInterests: { [key: string]: number } = {};
  const sortedTags = Array.from(tagMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 10);
  for (const [name, count] of sortedTags) {
    topInterests[name] = count;
  }
  demographics.interests = topInterests;

  return demographics;
};

export const getCreatorDataRange = async (userId: string, startDate: Date, endDate: Date) => {
  const data = await creatorDataRepository.find({
    where: {
      userId,
      date: MoreThan(startDate) as FindOperator<Date>,
    },
    order: { date: 'ASC' },
  });

  const summary = {
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
    totalFavorites: 0,
    totalShares: 0,
    totalFollowers: 0,
    totalNotes: 0,
    avgEngagementRate: 0,
  };

  for (const d of data) {
    summary.totalViews += d.totalViews;
    summary.totalLikes += d.totalLikes;
    summary.totalComments += d.totalComments;
    summary.totalFavorites += d.totalFavorites;
    summary.totalShares += d.totalShares;
    summary.totalFollowers += d.newFollowers;
    summary.totalNotes += d.newNotes;
  }

  summary.avgEngagementRate = data.length > 0
    ? data.reduce((sum, d) => sum + d.engagementRate, 0) / data.length
    : 0;

  return {
    dailyData: data,
    summary,
  };
};

export const getCreatorOverview = async (userId: string) => {
  const user = await userRepository.findOne({ where: { id: userId } });
  if (!user) {
    throw new Error('用户不存在');
  }

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const totalNotes = await noteRepository.count({
    where: { author: { id: userId }, status: NoteStatus.PUBLISHED },
  });

  const recentNotes = await noteRepository.find({
    where: {
      author: { id: userId },
      status: NoteStatus.PUBLISHED,
      createdAt: MoreThan(thirtyDaysAgo) as FindOperator<Date>,
    },
  });

  const totalViews = recentNotes.reduce((sum, note) => sum + note.viewCount, 0);
  const totalLikes = recentNotes.reduce((sum, note) => sum + note.likeCount, 0);
  const totalComments = recentNotes.reduce((sum, note) => sum + note.commentCount, 0);
  const totalFavorites = recentNotes.reduce((sum, note) => sum + note.favoriteCount, 0);

  const verification = await creatorVerificationRepository.findOne({
    where: { userId, status: VerificationStatus.APPROVED },
    order: { createdAt: 'DESC' },
  });

  return {
    user: {
      id: user.id,
      nickname: user.nickname,
      avatar: user.avatar,
      bio: user.bio,
      followerCount: user.followerCount,
      followingCount: user.followingCount,
      noteCount: user.noteCount,
    },
    stats: {
      totalNotes,
      totalViews,
      totalLikes,
      totalComments,
      totalFavorites,
      avgEngagementRate: totalViews > 0
        ? ((totalLikes + totalComments + totalFavorites) / (totalViews * 3)) * 100
        : 0,
    },
    verification: verification ? {
      type: verification.type,
      level: verification.level,
      badgeText: verification.badgeText,
      verifiedAt: verification.verifiedAt,
      expiresAt: verification.expiresAt,
    } : null,
  };
};

export const applyForVerification = async (
  userId: string,
  type: VerificationType,
  realName: string,
  materials: any[],
  description?: string,
  idCard?: string,
  organizationName?: string,
  organizationLicense?: string
) => {
  const existingPending = await creatorVerificationRepository.findOne({
    where: {
      userId,
      status: VerificationStatus.PENDING,
    },
  });

  if (existingPending) {
    throw new Error('已有正在审核中的认证申请');
  }

  const verification = creatorVerificationRepository.create({
    userId,
    type,
    realName,
    idCard,
    organizationName,
    organizationLicense,
    materials,
    description,
    status: VerificationStatus.PENDING,
  });

  return await creatorVerificationRepository.save(verification);
};

export const reviewVerification = async (
  verificationId: string,
  reviewerId: string,
  passed: boolean,
  reviewNote?: string,
  level?: number,
  badgeText?: string,
  badgeIcon?: string,
  validDays?: number
) => {
  const verification = await creatorVerificationRepository.findOne({
    where: { id: verificationId },
  });

  if (!verification) {
    throw new Error('认证申请不存在');
  }

  verification.status = passed ? VerificationStatus.APPROVED : VerificationStatus.REJECTED;
  verification.reviewerId = reviewerId;
  verification.reviewNote = reviewNote || '';
  verification.verifiedAt = new Date();

  if (passed) {
    verification.level = level || 1;
    verification.badgeText = badgeText || '认证创作者';
    verification.badgeIcon = badgeIcon || '';
    if (validDays) {
      verification.expiresAt = new Date(Date.now() + validDays * 24 * 60 * 60 * 1000);
    }
  }

  return await creatorVerificationRepository.save(verification);
};

export const getCreatorVerifications = async (
  status?: VerificationStatus,
  page: number = 1,
  pageSize: number = 20
) => {
  const skip = (page - 1) * pageSize;

  let whereCondition: any = {};
  if (status) {
    whereCondition.status = status;
  }

  const [verifications, total] = await creatorVerificationRepository.findAndCount({
    where: whereCondition,
    relations: ['user', 'reviewer'],
    order: { createdAt: 'DESC' },
    skip,
    take: pageSize,
  });

  return { verifications, total, page, pageSize };
};

import { In } from 'typeorm';
