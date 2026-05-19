import { AppDataSource } from '../config/database';
import { Note, NoteStatus } from '../entities/Note';
import { User } from '../entities/User';
import { UserTagRelation } from '../entities/UserTagRelation';
import { Follow } from '../entities/Follow';
import { TopicFollow } from '../entities/TopicFollow';
import { RecommendRecord, RecommendStrategy } from '../entities/RecommendRecord';
import { FlowSupport, SupportStatus } from '../entities/FlowSupport';
import { ContentRestriction, RestrictionLevel } from '../entities/ContentRestriction';
import { Dislike } from '../entities/Dislike';
import { calculateHotScore } from '../utils/hotScore';
import { In, Not, MoreThan, FindOperator } from 'typeorm';

const noteRepository = AppDataSource.getRepository(Note);
const userRepository = AppDataSource.getRepository(User);
const userTagRelationRepository = AppDataSource.getRepository(UserTagRelation);
const followRepository = AppDataSource.getRepository(Follow);
const topicFollowRepository = AppDataSource.getRepository(TopicFollow);
const recommendRecordRepository = AppDataSource.getRepository(RecommendRecord);
const flowSupportRepository = AppDataSource.getRepository(FlowSupport);
const contentRestrictionRepository = AppDataSource.getRepository(ContentRestriction);
const dislikeRepository = AppDataSource.getRepository(Dislike);

const interestKeywords: { [key: string]: string[] } = {
  '美食爱好者': ['美食', '吃', '餐厅', '菜谱', '烘焙', '咖啡', '甜点'],
  '旅游达人': ['旅游', '旅行', '景点', '攻略', '酒店', '机票', '摄影'],
  '健身爱好者': ['健身', '运动', '减肥', '瑜伽', '跑步', '肌肉', '健康'],
  '时尚穿搭': ['穿搭', '时尚', '服装', '搭配', '潮流', '品牌', '美妆'],
  '科技数码': ['科技', '数码', '手机', '电脑', '评测', '智能', '软件'],
  '家居生活': ['家居', '装修', '家具', '收纳', '居家', '生活', '厨房'],
  '母婴亲子': ['母婴', '育儿', '宝宝', '亲子', '早教', '奶粉', '玩具'],
  '美妆护肤': ['美妆', '护肤', '化妆品', '面膜', '口红', '粉底', '美容'],
  '汽车爱好者': ['汽车', '车', '驾驶', '改装', '新车', '跑车', 'SUV'],
  '游戏玩家': ['游戏', '电竞', '手游', '网游', '攻略', '主播', '电竞'],
};

const calculateNoteTagMatch = (note: Note, userTags: UserTagRelation[]): number => {
  if (userTags.length === 0) return 0;

  const contentText = (note.title + ' ' + note.content).toLowerCase();
  let matchScore = 0;

  for (const userTag of userTags) {
    const keywords = interestKeywords[userTag.tag.name] || [];
    const matchCount = keywords.filter(k => contentText.includes(k)).length;
    if (matchCount > 0) {
      matchScore += (matchCount / keywords.length) * userTag.weight;
    }
  }

  return matchScore;
};

const getColdStartBoost = (note: Note): number => {
  const createdAt = new Date(note.createdAt);
  const now = new Date();
  const hoursSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

  if (hoursSinceCreation < 24) {
    return Math.max(0, (24 - hoursSinceCreation) / 24) * 50;
  }
  return 0;
};

const getFlowSupportBoost = async (noteId: string): Promise<number> => {
  const supports = await flowSupportRepository.find({
    where: { noteId, status: SupportStatus.ACTIVE },
  });

  if (supports.length === 0) return 0;

  let boost = 0;
  for (const support of supports) {
    boost += support.boostMultiplier * 30;
  }
  return boost;
};

const getContentRestrictionMultiplier = async (noteId: string): Promise<number> => {
  const restrictions = await contentRestrictionRepository.find({
    where: { noteId, isActive: true },
  });

  if (restrictions.length === 0) return 1;

  let multiplier = 1;
  for (const restriction of restrictions) {
    if (restriction.level === RestrictionLevel.LIMIT_FLOW) {
      multiplier *= 0.3;
    } else if (restriction.level === RestrictionLevel.NO_RECOMMEND) {
      multiplier *= 0;
    } else if (restriction.level === RestrictionLevel.ONLY_FOLLOWERS) {
      multiplier *= 0.1;
    } else if (restriction.level === RestrictionLevel.HIDDEN) {
      multiplier *= 0;
    }
  }
  return multiplier;
};

export const getPersonalizedFeed = async (
  userId: string | undefined,
  page: number = 1,
  pageSize: number = 10
) => {
  const skip = (page - 1) * pageSize;

  let blockedUserIds: string[] = [];
  let dislikedNoteIds: string[] = [];
  let followedUserIds: string[] = [];
  let followedTopicIds: string[] = [];
  let userTags: UserTagRelation[] = [];

  if (userId) {
    const [follows, topicFollows, dislikes, tags] = await Promise.all([
      followRepository.find({ where: { followerId: userId }, select: ['followingId'] }),
      topicFollowRepository.find({ where: { userId }, select: ['topicId'] }),
      dislikeRepository.find({ where: { userId }, select: ['noteId'] }),
      userTagRelationRepository.find({ where: { userId }, relations: ['tag'], order: { weight: 'DESC' }, take: 10 }),
    ]);

    followedUserIds = follows.map(f => f.followingId);
    followedTopicIds = topicFollows.map(t => t.topicId);
    dislikedNoteIds = dislikes.map(d => d.noteId);
    userTags = tags;
  }

  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

  let whereCondition: any = {
    status: NoteStatus.PUBLISHED,
    isDeleted: false,
    createdAt: MoreThan(threeDaysAgo) as FindOperator<Date>,
  };

  if (blockedUserIds.length > 0) {
    whereCondition.author = { id: Not(In(blockedUserIds)) };
  }

  if (dislikedNoteIds.length > 0) {
    whereCondition.id = Not(In(dislikedNoteIds));
  }

  const notes = await noteRepository.find({
    where: whereCondition,
    relations: ['author', 'topics'],
    take: pageSize * 5,
    order: { createdAt: 'DESC' },
  });

  const scoredNotes = [];
  for (const note of notes) {
    const tagMatchScore = userId ? calculateNoteTagMatch(note, userTags) : 0;
    const hotScore = calculateHotScore(note);
    const coldStartBoost = getColdStartBoost(note);
    const flowSupportBoost = await getFlowSupportBoost(note.id);
    const restrictionMultiplier = await getContentRestrictionMultiplier(note.id);

    let followBoost = 0;
    if (userId && followedUserIds.includes(note.author.id)) {
      followBoost = 20;
    }

    let topicBoost = 0;
    if (userId && note.topics) {
      for (const topic of note.topics) {
        if (followedTopicIds.includes(topic.id)) {
          topicBoost += 15;
        }
      }
    }

    const baseScore = hotScore * 0.4 + tagMatchScore * 0.3 + coldStartBoost * 0.15 + followBoost * 0.1 + topicBoost * 0.05;
    const finalScore = (baseScore + flowSupportBoost) * restrictionMultiplier;

    scoredNotes.push({
      note,
      score: finalScore,
      factors: {
        tagMatchScore,
        hotScore,
        coldStartBoost,
        followBoost,
        topicBoost,
        flowSupportBoost,
        restrictionMultiplier,
      },
    });
  }

  scoredNotes.sort((a, b) => b.score - a.score);

  const paginatedNotes = scoredNotes.slice(skip, skip + pageSize);

  if (userId) {
    const records = paginatedNotes.map((item, index) =>
      recommendRecordRepository.create({
        userId,
        noteId: item.note.id,
        strategy: RecommendStrategy.PERSONALIZED,
        score: item.score,
        factors: item.factors,
        position: skip + index + 1,
      })
    );
    await recommendRecordRepository.save(records);
  }

  return {
    list: paginatedNotes.map(item => ({
      id: item.note.id,
      title: item.note.title,
      content: item.note.content.substring(0, 100),
      images: item.note.images,
      location: item.note.location,
      likeCount: item.note.likeCount,
      favoriteCount: item.note.favoriteCount,
      shareCount: item.note.shareCount,
      viewCount: item.note.viewCount,
      commentCount: item.note.commentCount,
      hotScore: item.note.hotScore,
      score: item.score,
      topics: item.note.topics?.map((t) => t.name) || [],
      author: {
        id: item.note.author.id,
        nickname: item.note.author.nickname,
        avatar: item.note.author.avatar,
      },
      createdAt: item.note.createdAt,
    })),
    total: scoredNotes.length,
    page,
    pageSize,
  };
};

export const getHotFeedWithBoost = async (page: number = 1, pageSize: number = 10) => {
  const skip = (page - 1) * pageSize;

  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

  const notes = await noteRepository.find({
    where: {
      status: NoteStatus.PUBLISHED,
      isDeleted: false,
      createdAt: MoreThan(threeDaysAgo) as FindOperator<Date>,
    },
    relations: ['author', 'topics'],
    take: pageSize * 3,
  });

  const scoredNotes = [];
  for (const note of notes) {
    const hotScore = calculateHotScore(note);
    const coldStartBoost = getColdStartBoost(note);
    const flowSupportBoost = await getFlowSupportBoost(note.id);
    const restrictionMultiplier = await getContentRestrictionMultiplier(note.id);

    const finalScore = (hotScore + coldStartBoost + flowSupportBoost) * restrictionMultiplier;

    scoredNotes.push({
      note,
      score: finalScore,
    });
  }

  scoredNotes.sort((a, b) => b.score - a.score);

  return {
    list: scoredNotes.slice(skip, skip + pageSize).map(item => ({
      id: item.note.id,
      title: item.note.title,
      content: item.note.content.substring(0, 100),
      images: item.note.images,
      location: item.note.location,
      likeCount: item.note.likeCount,
      favoriteCount: item.note.favoriteCount,
      shareCount: item.note.shareCount,
      viewCount: item.note.viewCount,
      commentCount: item.note.commentCount,
      score: item.score,
      topics: item.note.topics?.map((t) => t.name) || [],
      author: {
        id: item.note.author.id,
        nickname: item.note.author.nickname,
        avatar: item.note.author.avatar,
      },
      createdAt: item.note.createdAt,
    })),
    total: scoredNotes.length,
    page,
    pageSize,
  };
};

export const updateRecommendInteraction = async (
  recommendId: string,
  interaction: 'click' | 'like' | 'comment' | 'favorite'
) => {
  const record = await recommendRecordRepository.findOne({ where: { id: recommendId } });
  if (!record) {
    throw new Error('推荐记录不存在');
  }

  if (interaction === 'click') {
    record.isClicked = true;
  } else if (interaction === 'like') {
    record.isLiked = true;
  } else if (interaction === 'comment') {
    record.isCommented = true;
  } else if (interaction === 'favorite') {
    record.isFavorited = true;
  }

  record.interactedAt = new Date();
  await recommendRecordRepository.save(record);
};

export const getRecommendStats = async (userId: string) => {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [totalRecommended, totalClicked, totalLiked, totalCommented, totalFavorited] = await Promise.all([
    recommendRecordRepository.count({ where: { userId, recommendedAt: MoreThan(sevenDaysAgo) as FindOperator<Date> } }),
    recommendRecordRepository.count({ where: { userId, isClicked: true, recommendedAt: MoreThan(sevenDaysAgo) as FindOperator<Date> } }),
    recommendRecordRepository.count({ where: { userId, isLiked: true, recommendedAt: MoreThan(sevenDaysAgo) as FindOperator<Date> } }),
    recommendRecordRepository.count({ where: { userId, isCommented: true, recommendedAt: MoreThan(sevenDaysAgo) as FindOperator<Date> } }),
    recommendRecordRepository.count({ where: { userId, isFavorited: true, recommendedAt: MoreThan(sevenDaysAgo) as FindOperator<Date> } }),
  ]);

  return {
    totalRecommended,
    totalClicked,
    totalLiked,
    totalCommented,
    totalFavorited,
    clickRate: totalRecommended > 0 ? (totalClicked / totalRecommended).toFixed(4) : '0',
    interactionRate: totalRecommended > 0 ? ((totalLiked + totalCommented + totalFavorited) / totalRecommended).toFixed(4) : '0',
  };
};
