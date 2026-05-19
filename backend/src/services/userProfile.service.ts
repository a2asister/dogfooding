import { AppDataSource } from '../config/database';
import { UserTag, UserTagCategory } from '../entities/UserTag';
import { UserTagRelation } from '../entities/UserTagRelation';
import { UserBehavior, BehaviorType } from '../entities/UserBehavior';
import { User } from '../entities/User';
import { Note } from '../entities/Note';
import { SearchHistory } from '../entities/SearchHistory';
import { In, MoreThan, FindOperator } from 'typeorm';

const userTagRepository = AppDataSource.getRepository(UserTag);
const userTagRelationRepository = AppDataSource.getRepository(UserTagRelation);
const userBehaviorRepository = AppDataSource.getRepository(UserBehavior);
const userRepository = AppDataSource.getRepository(User);
const noteRepository = AppDataSource.getRepository(Note);
const searchHistoryRepository = AppDataSource.getRepository(SearchHistory);

export const initializeDefaultTags = async (): Promise<void> => {
  const defaultTags: Omit<UserTag, 'id' | 'createdAt' | 'updatedAt' | 'userCount' | 'userRelations'>[] = [
    { name: '美食爱好者', category: UserTagCategory.INTEREST, description: '对美食内容感兴趣的用户', isActive: true, rules: { type: 'browse', minCount: 5, timeWindow: 30 } },
    { name: '旅游达人', category: UserTagCategory.INTEREST, description: '喜欢旅游相关内容的用户', isActive: true, rules: { type: 'browse', minCount: 5, timeWindow: 30 } },
    { name: '健身爱好者', category: UserTagCategory.INTEREST, description: '关注健身运动的用户', isActive: true, rules: { type: 'browse', minCount: 5, timeWindow: 30 } },
    { name: '时尚穿搭', category: UserTagCategory.INTEREST, description: '关注时尚穿搭的用户', isActive: true, rules: { type: 'browse', minCount: 5, timeWindow: 30 } },
    { name: '科技数码', category: UserTagCategory.INTEREST, description: '关注科技数码产品的用户', isActive: true, rules: { type: 'browse', minCount: 5, timeWindow: 30 } },
    { name: '家居生活', category: UserTagCategory.INTEREST, description: '关注家居生活的用户', isActive: true, rules: { type: 'browse', minCount: 5, timeWindow: 30 } },
    { name: '母婴亲子', category: UserTagCategory.INTEREST, description: '关注母婴亲子的用户', isActive: true, rules: { type: 'browse', minCount: 5, timeWindow: 30 } },
    { name: '美妆护肤', category: UserTagCategory.INTEREST, description: '关注美妆护肤的用户', isActive: true, rules: { type: 'browse', minCount: 5, timeWindow: 30 } },
    { name: '汽车爱好者', category: UserTagCategory.INTEREST, description: '关注汽车内容的用户', isActive: true, rules: { type: 'browse', minCount: 5, timeWindow: 30 } },
    { name: '游戏玩家', category: UserTagCategory.INTEREST, description: '喜欢游戏内容的用户', isActive: true, rules: { type: 'browse', minCount: 5, timeWindow: 30 } },
    { name: '高活跃用户', category: UserTagCategory.BEHAVIOR, description: '每日活跃的高频用户', isActive: true, rules: { type: 'duration', minDuration: 30, timeWindow: 7 } },
    { name: '内容创作者', category: UserTagCategory.BEHAVIOR, description: '经常发布内容的用户', isActive: true, rules: { type: 'browse', minCount: 3, timeWindow: 7 } },
    { name: '互动达人', category: UserTagCategory.BEHAVIOR, description: '喜欢点赞评论的用户', isActive: true, rules: { type: 'browse', minCount: 10, timeWindow: 7 } },
  ];

  for (const tag of defaultTags) {
    const exists = await userTagRepository.findOne({ where: { name: tag.name } });
    if (!exists) {
      await userTagRepository.save(userTagRepository.create(tag));
    }
  }
};

export const recordUserBehavior = async (
  userId: string | undefined,
  behaviorType: BehaviorType,
  targetType: string,
  targetId: string,
  noteId?: string,
  metadata?: Record<string, any>,
  ip?: string,
  userAgent?: string
): Promise<void> => {
  const behavior = userBehaviorRepository.create({
    userId,
    behaviorType,
    targetType,
    targetId,
    noteId,
    metadata,
    ip,
    userAgent,
  });
  await userBehaviorRepository.save(behavior);
};

export const generateUserTags = async (userId: string): Promise<UserTagRelation[]> => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const behaviors = await userBehaviorRepository.find({
    where: { userId, createdAt: MoreThan(thirtyDaysAgo) as FindOperator<Date> },
    order: { createdAt: 'DESC' },
  });

  const searchHistories = await searchHistoryRepository.find({
    where: { userId, createdAt: MoreThan(thirtyDaysAgo) as FindOperator<Date> },
  });

  const userNotes = await noteRepository.find({
    where: { author: { id: userId }, createdAt: MoreThan(thirtyDaysAgo) as FindOperator<Date> },
    relations: ['topics'],
  });

  const tagWeights: Map<string, number> = new Map();
  const tagSources: Map<string, any[]> = new Map();

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

  for (const behavior of behaviors) {
    if (behavior.metadata?.keyword) {
      const keyword = behavior.metadata.keyword.toLowerCase();
      for (const [tagName, keywords] of Object.entries(interestKeywords)) {
        if (keywords.some(k => keyword.includes(k))) {
          const currentWeight = tagWeights.get(tagName) || 0;
          tagWeights.set(tagName, currentWeight + 3);
          const sources = tagSources.get(tagName) || [];
          sources.push({ type: 'search', keyword, timestamp: behavior.createdAt });
          tagSources.set(tagName, sources);
        }
      }
    }

    if (behavior.noteId && behavior.behaviorType !== BehaviorType.VIEW) {
      const note = await noteRepository.findOne({ where: { id: behavior.noteId }, relations: ['topics'] });
      if (note) {
        const contentText = (note.title + ' ' + note.content).toLowerCase();
        for (const [tagName, keywords] of Object.entries(interestKeywords)) {
          if (keywords.some(k => contentText.includes(k))) {
            const weight = behavior.behaviorType === BehaviorType.LIKE ? 2 :
                          behavior.behaviorType === BehaviorType.FAVORITE ? 3 :
                          behavior.behaviorType === BehaviorType.COMMENT ? 2 : 1;
            const currentWeight = tagWeights.get(tagName) || 0;
            tagWeights.set(tagName, currentWeight + weight);
            const sources = tagSources.get(tagName) || [];
            sources.push({ type: behavior.behaviorType, noteId: note.id, title: note.title });
            tagSources.set(tagName, sources);
          }
        }
      }
    }
  }

  for (const search of searchHistories) {
    const keyword = search.keyword.toLowerCase();
    for (const [tagName, keywords] of Object.entries(interestKeywords)) {
      if (keywords.some(k => keyword.includes(k))) {
        const currentWeight = tagWeights.get(tagName) || 0;
        tagWeights.set(tagName, currentWeight + search.searchCount * 2);
        const sources = tagSources.get(tagName) || [];
        sources.push({ type: 'search', keyword, count: search.searchCount });
        tagSources.set(tagName, sources);
      }
    }
  }

  for (const note of userNotes) {
    const contentText = (note.title + ' ' + note.content).toLowerCase();
    for (const [tagName, keywords] of Object.entries(interestKeywords)) {
      if (keywords.some(k => contentText.includes(k))) {
        const currentWeight = tagWeights.get(tagName) || 0;
        tagWeights.set(tagName, currentWeight + 5);
        const sources = tagSources.get(tagName) || [];
        sources.push({ type: 'post', noteId: note.id, title: note.title });
        tagSources.set(tagName, sources);
      }
    }
  }

  const noteCount = userNotes.length;
  if (noteCount >= 3) {
    tagWeights.set('内容创作者', (tagWeights.get('内容创作者') || 0) + noteCount * 2);
  }

  const interactionCount = behaviors.filter(b =>
    [BehaviorType.LIKE, BehaviorType.COMMENT, BehaviorType.FAVORITE].includes(b.behaviorType)
  ).length;
  if (interactionCount >= 10) {
    tagWeights.set('互动达人', (tagWeights.get('互动达人') || 0) + interactionCount);
  }

  const activeDays = new Set(behaviors.map(b => b.createdAt.toDateString())).size;
  if (activeDays >= 5) {
    tagWeights.set('高活跃用户', (tagWeights.get('高活跃用户') || 0) + activeDays);
  }

  const existingRelations = await userTagRelationRepository.find({ where: { userId } });
  const existingTagIds = new Set(existingRelations.map(r => r.tagId));

  const allTags = await userTagRepository.find({ where: { isActive: true } });
  const tagNameMap = new Map(allTags.map(t => [t.name, t]));

  const newRelations: UserTagRelation[] = [];
  const updatedRelations: UserTagRelation[] = [];

  for (const [tagName, weight] of tagWeights.entries()) {
    const tag = tagNameMap.get(tagName);
    if (!tag) continue;

    const existingRelation = existingRelations.find(r => r.tagId === tag.id);
    const sources = tagSources.get(tagName) || [];

    if (existingRelation) {
      existingRelation.weight = Math.max(existingRelation.weight, weight);
      existingRelation.hitCount += 1;
      existingRelation.lastHitAt = new Date();
      if (sources.length > 0) {
        existingRelation.source = sources[0];
      }
      updatedRelations.push(existingRelation);
    } else {
      newRelations.push(userTagRelationRepository.create({
        userId,
        tagId: tag.id,
        weight,
        hitCount: 1,
        source: sources[0],
        lastHitAt: new Date(),
      }));
    }
  }

  if (newRelations.length > 0) {
    await userTagRelationRepository.save(newRelations);
  }
  if (updatedRelations.length > 0) {
    await userTagRelationRepository.save(updatedRelations);
  }

  return [...updatedRelations, ...newRelations];
};

export const getUserTags = async (userId: string): Promise<{ tag: UserTag; weight: number; hitCount: number; lastHitAt: Date }[]> => {
  const relations = await userTagRelationRepository.find({
    where: { userId },
    relations: ['tag'],
    order: { weight: 'DESC' },
  });

  return relations.map(r => ({
    tag: r.tag,
    weight: r.weight,
    hitCount: r.hitCount,
    lastHitAt: r.lastHitAt,
  }));
};

export const getUserProfile = async (userId: string) => {
  const user = await userRepository.findOne({ where: { id: userId } });
  if (!user) {
    throw new Error('用户不存在');
  }

  const tags = await getUserTags(userId);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const behaviors = await userBehaviorRepository.find({
    where: { userId, createdAt: MoreThan(thirtyDaysAgo) as FindOperator<Date> },
  });

  const behaviorStats = {
    totalViews: behaviors.filter(b => b.behaviorType === BehaviorType.VIEW).length,
    totalLikes: behaviors.filter(b => b.behaviorType === BehaviorType.LIKE).length,
    totalComments: behaviors.filter(b => b.behaviorType === BehaviorType.COMMENT).length,
    totalFavorites: behaviors.filter(b => b.behaviorType === BehaviorType.FAVORITE).length,
    totalSearches: behaviors.filter(b => b.behaviorType === BehaviorType.SEARCH).length,
  };

  const activeDays = new Set(behaviors.map(b => b.createdAt.toDateString())).size;

  return {
    user: {
      id: user.id,
      nickname: user.nickname,
      avatar: user.avatar,
      bio: user.bio,
      location: user.location,
      gender: user.gender,
      birthday: user.birthday,
      followerCount: user.followerCount,
      followingCount: user.followingCount,
      noteCount: user.noteCount,
    },
    tags,
    behaviorStats,
    activeDays,
  };
};
