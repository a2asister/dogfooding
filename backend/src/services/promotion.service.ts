import { AppDataSource } from '../config/database';
import { Promotion, PromotionPlanType, PromotionStatus, PromotionTargetAudience } from '../entities/Promotion';
import { Note, NoteStatus } from '../entities/Note';
import { User } from '../entities/User';
import { FlowSupport, SupportType, SupportStatus } from '../entities/FlowSupport';

const promotionRepository = AppDataSource.getRepository(Promotion);
const noteRepository = AppDataSource.getRepository(Note);
const userRepository = AppDataSource.getRepository(User);
const flowSupportRepository = AppDataSource.getRepository(FlowSupport);

export const createPromotion = async (
  userId: string,
  noteId: string,
  planType: PromotionPlanType,
  budget: number,
  options: {
    durationHours?: number;
    targetAudience?: PromotionTargetAudience;
    targetFilters?: any;
    boostMultiplier?: number;
  } = {}
): Promise<Promotion> => {
  const note = await noteRepository.findOne({ where: { id: noteId, status: NoteStatus.PUBLISHED } });
  if (!note) {
    throw new Error('笔记不存在或未发布');
  }

  if (note.authorId !== userId) {
    throw new Error('只能推广自己的笔记');
  }

  const targetViews = Math.floor(budget * 100);

  const promotion = promotionRepository.create({
    userId,
    noteId,
    note,
    planType,
    budget,
    targetViews,
    durationHours: options.durationHours || 24,
    targetAudience: options.targetAudience || PromotionTargetAudience.ALL,
    targetFilters: options.targetFilters,
    boostMultiplier: options.boostMultiplier || 2.0,
    status: PromotionStatus.PENDING,
  });

  return await promotionRepository.save(promotion);
};

export const activatePromotion = async (promotionId: string): Promise<Promotion> => {
  const promotion = await promotionRepository.findOne({ where: { id: promotionId } });
  if (!promotion) {
    throw new Error('推广不存在');
  }

  if (promotion.status !== PromotionStatus.PENDING) {
    throw new Error('推广状态不正确');
  }

  promotion.status = PromotionStatus.ACTIVE;
  promotion.startTime = new Date();
  promotion.endTime = new Date(Date.now() + promotion.durationHours * 60 * 60 * 1000);

  const savedPromotion = await promotionRepository.save(promotion);

  await createFlowSupport(savedPromotion);

  return savedPromotion;
};

export const createFlowSupport = async (promotion: Promotion): Promise<FlowSupport> => {
  const flowSupport = flowSupportRepository.create({
    noteId: promotion.noteId,
    type: SupportType.MANUAL_BOOST,
    status: SupportStatus.ACTIVE,
    boostMultiplier: promotion.boostMultiplier,
    targetViews: promotion.targetViews,
    budget: promotion.budget,
    startTime: promotion.startTime,
    endTime: promotion.endTime,
    reason: `付费推广: ${promotion.planType}`,
  });

  return await flowSupportRepository.save(flowSupport);
};

export const getPromotion = async (promotionId: string): Promise<Promotion | null> => {
  return await promotionRepository.findOne({
    where: { id: promotionId },
    relations: ['note', 'user'],
  });
};

export const getUserPromotions = async (
  userId: string,
  status?: PromotionStatus,
  page: number = 1,
  pageSize: number = 20
): Promise<{ promotions: Promotion[]; total: number }> => {
  const skip = (page - 1) * pageSize;

  const whereCondition: any = { userId };
  if (status) {
    whereCondition.status = status;
  }

  const [promotions, total] = await promotionRepository.findAndCount({
    where: whereCondition,
    relations: ['note'],
    order: { createdAt: 'DESC' },
    skip,
    take: pageSize,
  });

  return { promotions, total };
};

export const updatePromotionStatus = async (
  promotionId: string,
  status: PromotionStatus
): Promise<Promotion> => {
  const promotion = await promotionRepository.findOne({ where: { id: promotionId } });
  if (!promotion) {
    throw new Error('推广不存在');
  }

  promotion.status = status;
  return await promotionRepository.save(promotion);
};

export const pausePromotion = async (promotionId: string): Promise<Promotion> => {
  return await updatePromotionStatus(promotionId, PromotionStatus.PAUSED);
};

export const resumePromotion = async (promotionId: string): Promise<Promotion> => {
  const promotion = await promotionRepository.findOne({ where: { id: promotionId } });
  if (!promotion) {
    throw new Error('推广不存在');
  }

  if (promotion.status !== PromotionStatus.PAUSED) {
    throw new Error('推广未暂停');
  }

  promotion.status = PromotionStatus.ACTIVE;
  return await promotionRepository.save(promotion);
};

export const cancelPromotion = async (promotionId: string): Promise<Promotion> => {
  const promotion = await promotionRepository.findOne({ where: { id: promotionId } });
  if (!promotion) {
    throw new Error('推广不存在');
  }

  if (![PromotionStatus.PENDING, PromotionStatus.ACTIVE, PromotionStatus.PAUSED].includes(promotion.status)) {
    throw new Error('推广状态不正确');
  }

  promotion.status = PromotionStatus.CANCELLED;
  return await promotionRepository.save(promotion);
};

export const updatePromotionMetrics = async (
  promotionId: string,
  metrics: {
    deliveredViews?: number;
    achievedLikes?: number;
    achievedFollows?: number;
    achievedComments?: number;
    spent?: number;
  }
): Promise<Promotion> => {
  const promotion = await promotionRepository.findOne({ where: { id: promotionId } });
  if (!promotion) {
    throw new Error('推广不存在');
  }

  if (metrics.deliveredViews !== undefined) {
    promotion.deliveredViews += metrics.deliveredViews;
  }
  if (metrics.achievedLikes !== undefined) {
    promotion.achievedLikes += metrics.achievedLikes;
  }
  if (metrics.achievedFollows !== undefined) {
    promotion.achievedFollows += metrics.achievedFollows;
  }
  if (metrics.achievedComments !== undefined) {
    promotion.achievedComments += metrics.achievedComments;
  }
  if (metrics.spent !== undefined) {
    promotion.spent += metrics.spent;
  }

  if (promotion.deliveredViews > 0) {
    const totalActions = promotion.achievedLikes + promotion.achievedFollows + promotion.achievedComments;
    promotion.ctr = (totalActions / promotion.deliveredViews) * 100;
  }

  if (promotion.deliveredViews >= promotion.targetViews || promotion.spent >= promotion.budget) {
    promotion.status = PromotionStatus.COMPLETED;
  }

  return await promotionRepository.save(promotion);
};

export const getPromotionPerformance = async (promotionId: string): Promise<any> => {
  const promotion = await promotionRepository.findOne({ where: { id: promotionId } });
  if (!promotion) {
    throw new Error('推广不存在');
  }

  const roi = promotion.spent > 0 ? (promotion.deliveredViews / promotion.spent) : 0;
  const engagementRate = promotion.deliveredViews > 0
    ? ((promotion.achievedLikes + promotion.achievedComments + promotion.achievedFollows) / promotion.deliveredViews) * 100
    : 0;

  return {
    promotion,
    metrics: {
      roi,
      engagementRate,
      ctr: promotion.ctr,
      costPerView: promotion.deliveredViews > 0 ? promotion.spent / promotion.deliveredViews : 0,
      costPerLike: promotion.achievedLikes > 0 ? promotion.spent / promotion.achievedLikes : 0,
      costPerFollow: promotion.achievedFollows > 0 ? promotion.spent / promotion.achievedFollows : 0,
      progress: (promotion.deliveredViews / promotion.targetViews) * 100,
      budgetUsed: (promotion.spent / promotion.budget) * 100,
    },
  };
};

export const getActivePromotions = async (): Promise<Promotion[]> => {
  return await promotionRepository.find({
    where: { status: PromotionStatus.ACTIVE },
    relations: ['note'],
  });
};

export const checkAndExpirePromotions = async (): Promise<void> => {
  const now = new Date();
  const activePromotions = await promotionRepository.find({
    where: { status: PromotionStatus.ACTIVE },
  });

  for (const promotion of activePromotions) {
    if (promotion.endTime && promotion.endTime < now) {
      promotion.status = PromotionStatus.EXPIRED;
      await promotionRepository.save(promotion);
    }
  }
};

export const getPromotionPlans = (): any[] => {
  return [
    {
      type: PromotionPlanType.VIEWS_BOOST,
      name: '浏览量加热',
      description: '快速提升笔记曝光量',
      pricePerThousand: 10,
      minBudget: 100,
      estimatedReach: { min: 1000, max: 50000 },
    },
    {
      type: PromotionPlanType.LIKES_BOOST,
      name: '点赞量加热',
      description: '提升笔记互动热度',
      pricePerThousand: 50,
      minBudget: 200,
      estimatedReach: { min: 2000, max: 20000 },
    },
    {
      type: PromotionPlanType.FOLLOWERS_BOOST,
      name: '粉丝增长',
      description: '吸引精准粉丝关注',
      pricePerFollower: 2,
      minBudget: 500,
      estimatedReach: { min: 5000, max: 50000 },
    },
    {
      type: PromotionPlanType.HOT_RANK_BOOST,
      name: '热榜推广',
      description: '冲击热门榜单',
      pricePerHour: 500,
      minBudget: 1000,
      estimatedReach: { min: 50000, max: 200000 },
    },
    {
      type: PromotionPlanType.HOMEPAGE_FEATURE,
      name: '首页推荐',
      description: '首页精选推荐位',
      pricePerDay: 2000,
      minBudget: 2000,
      estimatedReach: { min: 100000, max: 500000 },
    },
  ];
};
