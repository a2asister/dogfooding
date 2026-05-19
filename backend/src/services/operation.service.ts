import { AppDataSource } from '../config/database';
import { Banner, BannerPosition, BannerType } from '../entities/Banner';
import { HotRank, RankType } from '../entities/HotRank';
import { FlowSupport, SupportType, SupportStatus } from '../entities/FlowSupport';
import { Note, NoteStatus } from '../entities/Note';
import { Topic } from '../entities/Topic';
import { User } from '../entities/User';
import { calculateHotScore } from '../utils/hotScore';
import { MoreThan, FindOperator } from 'typeorm';

const bannerRepository = AppDataSource.getRepository(Banner);
const hotRankRepository = AppDataSource.getRepository(HotRank);
const flowSupportRepository = AppDataSource.getRepository(FlowSupport);
const noteRepository = AppDataSource.getRepository(Note);
const topicRepository = AppDataSource.getRepository(Topic);
const userRepository = AppDataSource.getRepository(User);

export const createBanner = async (
  title: string,
  image: string,
  position: BannerPosition,
  type: BannerType = BannerType.NONE,
  targetId?: string,
  targetUrl?: string,
  description?: string,
  sort: number = 0,
  isActive: boolean = false,
  startTime?: Date,
  endTime?: Date,
  creatorId?: string
): Promise<Banner> => {
  const banner = bannerRepository.create({
    title,
    image,
    position,
    type,
    targetId,
    targetUrl,
    description,
    sort,
    isActive,
    startTime,
    endTime,
    creatorId,
  });
  return await bannerRepository.save(banner);
};

export const updateBanner = async (
  bannerId: string,
  updates: Partial<Banner>
): Promise<Banner> => {
  const banner = await bannerRepository.findOne({ where: { id: bannerId } });
  if (!banner) {
    throw new Error('Banner不存在');
  }

  Object.assign(banner, updates);
  return await bannerRepository.save(banner);
};

export const deleteBanner = async (bannerId: string): Promise<void> => {
  const result = await bannerRepository.delete(bannerId);
  if (result.affected === 0) {
    throw new Error('Banner不存在');
  }
};

export const getBanners = async (position?: BannerPosition, includeInactive: boolean = false) => {
  let whereCondition: any = {};
  
  if (!includeInactive) {
    whereCondition.isActive = true;
    const now = new Date();
    whereCondition.startTime = null as any;
  }

  if (position) {
    whereCondition.position = position;
  }

  const banners = await bannerRepository.find({
    where: whereCondition,
    order: { sort: 'ASC', createdAt: 'DESC' },
  });

  const now = new Date();
  return banners.filter(banner => {
    if (!banner.isActive) return false;
    if (banner.startTime && banner.startTime > now) return false;
    if (banner.endTime && banner.endTime < now) return false;
    return true;
  });
};

export const incrementBannerClick = async (bannerId: string): Promise<void> => {
  await bannerRepository.increment({ id: bannerId }, 'clickCount', 1);
};

export const incrementBannerView = async (bannerId: string): Promise<void> => {
  await bannerRepository.increment({ id: bannerId }, 'viewCount', 1);
};

export const generateHotRanks = async (type: RankType, limit: number = 50) => {
  const today = new Date().toISOString().split('T')[0];

  await hotRankRepository.update({ type, dateStr: today, isActive: true }, { isActive: false });

  if (type === RankType.NOTE_HOT || type === RankType.NOTE_RISING) {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

    const notes = await noteRepository.find({
      where: {
        status: NoteStatus.PUBLISHED,
        isDeleted: false,
        createdAt: MoreThan(threeDaysAgo) as FindOperator<Date>,
      },
      relations: ['author'],
      take: limit * 2,
    });

    const scoredNotes = notes.map(note => {
      const hotScore = calculateHotScore(note);
      let score = hotScore;

      if (type === RankType.NOTE_RISING) {
        const hoursSinceCreation = (Date.now() - note.createdAt.getTime()) / (1000 * 60 * 60);
        score = hotScore / Math.pow(hoursSinceCreation + 2, 1.5);
      }

      return { note, score };
    });

    scoredNotes.sort((a, b) => b.score - a.score);

    const ranks = [];
    for (let i = 0; i < Math.min(limit, scoredNotes.length); i++) {
      const item = scoredNotes[i];
      const rank = hotRankRepository.create({
        type,
        noteId: item.note.id,
        rank: i + 1,
        score: item.score,
        scoreDetails: {
          baseScore: item.score,
          manualBoost: 0,
          finalScore: item.score,
        },
        dateStr: today,
        isActive: true,
      });
      ranks.push(rank);
    }

    await hotRankRepository.save(ranks);
    return ranks;
  }

  if (type === RankType.TOPIC_HOT) {
    const topics = await topicRepository.find({
      order: { noteCount: 'DESC', followCount: 'DESC' },
      take: limit,
    });

    const ranks = [];
    for (let i = 0; i < topics.length; i++) {
      const topic = topics[i];
      const score = topic.noteCount * 2 + topic.followCount * 3;
      const rank = hotRankRepository.create({
        type,
        topicId: topic.id,
        rank: i + 1,
        score,
        scoreDetails: {
          baseScore: score,
          manualBoost: 0,
          finalScore: score,
        },
        dateStr: today,
        isActive: true,
      });
      ranks.push(rank);
    }

    await hotRankRepository.save(ranks);
    return ranks;
  }

  if (type === RankType.CREATOR_RISING) {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const notes = await noteRepository.find({
      where: {
        status: NoteStatus.PUBLISHED,
        isDeleted: false,
        createdAt: MoreThan(sevenDaysAgo) as FindOperator<Date>,
      },
      relations: ['author'],
    });

    const authorStats = new Map<string, {
      author: User;
      noteCount: number;
      totalLikes: number;
      totalComments: number;
      totalFavorites: number;
      newFollowers: number;
    }>();

    for (const note of notes) {
      const authorId = note.author.id;
      if (!authorStats.has(authorId)) {
        authorStats.set(authorId, {
          author: note.author,
          noteCount: 0,
          totalLikes: 0,
          totalComments: 0,
          totalFavorites: 0,
          newFollowers: 0,
        });
      }
      const stats = authorStats.get(authorId)!;
      stats.noteCount++;
      stats.totalLikes += note.likeCount;
      stats.totalComments += note.commentCount;
      stats.totalFavorites += note.favoriteCount;
    }

    const sortedCreators = Array.from(authorStats.entries())
      .map(([userId, stats]) => ({
        userId,
        stats,
        score: stats.totalLikes * 1 + stats.totalComments * 2 + stats.totalFavorites * 1.5 + stats.noteCount * 5,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    const ranks = [];
    for (let i = 0; i < sortedCreators.length; i++) {
      const item = sortedCreators[i];
      const rank = hotRankRepository.create({
        type,
        userId: item.userId,
        rank: i + 1,
        score: item.score,
        scoreDetails: {
          baseScore: item.score,
          manualBoost: 0,
          finalScore: item.score,
        },
        dateStr: today,
        isActive: true,
      });
      ranks.push(rank);
    }

    await hotRankRepository.save(ranks);
    return ranks;
  }

  return [];
};

export const getHotRanks = async (type: RankType, page: number = 1, pageSize: number = 20) => {
  const skip = (page - 1) * pageSize;
  const today = new Date().toISOString().split('T')[0];

  let [ranks, total] = await hotRankRepository.findAndCount({
    where: { type, dateStr: today, isActive: true },
    relations: ['note', 'topic', 'user'],
    order: { isPinned: 'DESC', rank: 'ASC' },
    skip,
    take: pageSize,
  });

  const pinnedRanks = ranks.filter(r => r.isPinned);
  const normalRanks = ranks.filter(r => !r.isPinned);

  normalRanks.sort((a, b) => (b.score + b.manualBoostValue) - (a.score + a.manualBoostValue));
  normalRanks.forEach((rank, index) => {
    rank.rank = pinnedRanks.length + index + 1;
  });

  ranks = [...pinnedRanks, ...normalRanks];

  return {
    list: ranks.map(rank => ({
      id: rank.id,
      rank: rank.rank,
      score: rank.score + rank.manualBoostValue,
      isPinned: rank.isPinned,
      isManualBoost: rank.isManualBoost,
      note: rank.note ? {
        id: rank.note.id,
        title: rank.note.title,
        images: rank.note.images,
        likeCount: rank.note.likeCount,
        commentCount: rank.note.commentCount,
        author: {
          id: rank.note.author?.id,
          nickname: rank.note.author?.nickname,
          avatar: rank.note.author?.avatar,
        },
      } : null,
      topic: rank.topic ? {
        id: rank.topic.id,
        name: rank.topic.name,
        cover: rank.topic.cover,
        noteCount: rank.topic.noteCount,
        followCount: rank.topic.followCount,
      } : null,
      user: rank.user ? {
        id: rank.user.id,
        nickname: rank.user.nickname,
        avatar: rank.user.avatar,
        followerCount: rank.user.followerCount,
        noteCount: rank.user.noteCount,
      } : null,
    })),
    total,
    page,
    pageSize,
  };
};

export const manualBoostRank = async (
  rankId: string,
  operatorId: string,
  boostValue: number
): Promise<HotRank> => {
  const rank = await hotRankRepository.findOne({ where: { id: rankId } });
  if (!rank) {
    throw new Error('榜单记录不存在');
  }

  rank.isManualBoost = true;
  rank.manualBoostValue = boostValue;
  rank.operatorId = operatorId;
  rank.scoreDetails = {
    ...rank.scoreDetails,
    manualBoost: boostValue,
    finalScore: (rank.scoreDetails?.baseScore || 0) + boostValue,
  };

  return await hotRankRepository.save(rank);
};

export const pinRank = async (
  rankId: string,
  operatorId: string,
  isPinned: boolean
): Promise<HotRank> => {
  const rank = await hotRankRepository.findOne({ where: { id: rankId } });
  if (!rank) {
    throw new Error('榜单记录不存在');
  }

  rank.isPinned = isPinned;
  rank.operatorId = operatorId;

  return await hotRankRepository.save(rank);
};

export const createFlowSupport = async (
  noteId: string,
  type: SupportType,
  boostMultiplier: number,
  operatorId?: string,
  reason?: string,
  targetViews?: number,
  startTime?: Date,
  endTime?: Date
): Promise<FlowSupport> => {
  const note = await noteRepository.findOne({ where: { id: noteId } });
  if (!note) {
    throw new Error('笔记不存在');
  }

  const support = flowSupportRepository.create({
    noteId,
    type,
    boostMultiplier,
    operatorId,
    reason,
    targetViews,
    startTime: startTime || new Date(),
    endTime,
  });

  return await flowSupportRepository.save(support);
};

export const cancelFlowSupport = async (supportId: string): Promise<FlowSupport> => {
  const support = await flowSupportRepository.findOne({ where: { id: supportId } });
  if (!support) {
    throw new Error('流量扶持记录不存在');
  }

  support.status = SupportStatus.CANCELLED;
  return await flowSupportRepository.save(support);
};

export const getFlowSupports = async (
  noteId?: string,
  status?: SupportStatus,
  page: number = 1,
  pageSize: number = 20
) => {
  const skip = (page - 1) * pageSize;

  let whereCondition: any = {};
  if (noteId) {
    whereCondition.noteId = noteId;
  }
  if (status) {
    whereCondition.status = status;
  }

  const [supports, total] = await flowSupportRepository.findAndCount({
    where: whereCondition,
    relations: ['note', 'operator'],
    order: { createdAt: 'DESC' },
    skip,
    take: pageSize,
  });

  return { supports, total, page, pageSize };
};
