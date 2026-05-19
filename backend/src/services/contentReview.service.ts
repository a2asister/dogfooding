import { AppDataSource } from '../config/database';
import { Note, NoteStatus } from '../entities/Note';
import { Comment } from '../entities/Comment';
import { User } from '../entities/User';
import { ReviewTask, ReviewType, ReviewStatus, ReviewLevel } from '../entities/ReviewTask';
import { ReviewLog, ReviewAction } from '../entities/ReviewLog';
import { ContentDuplicate, DuplicateStatus } from '../entities/ContentDuplicate';
import { ContentRestriction, RestrictionType, RestrictionLevel } from '../entities/ContentRestriction';
import { UserRestriction, UserRestrictionType, UserRestrictionScope } from '../entities/UserRestriction';
import { getAllSensitiveWords } from '../utils/sensitiveWords';
import { MoreThan, FindOperator, In } from 'typeorm';

const noteRepository = AppDataSource.getRepository(Note);
const commentRepository = AppDataSource.getRepository(Comment);
const userRepository = AppDataSource.getRepository(User);
const reviewTaskRepository = AppDataSource.getRepository(ReviewTask);
const reviewLogRepository = AppDataSource.getRepository(ReviewLog);
const contentDuplicateRepository = AppDataSource.getRepository(ContentDuplicate);
const contentRestrictionRepository = AppDataSource.getRepository(ContentRestriction);
const userRestrictionRepository = AppDataSource.getRepository(UserRestriction);

const violationCategories = [
  { keywords: ['色情', '黄色', '淫', 'av', '裸体', '性暗示'] },
  { keywords: ['暴力', '血腥', '恐怖', '杀人', '自杀', '自残', '殴打'] },
  { keywords: ['赌博', '博彩', '赌', '彩票', '开奖', '网赌'] },
  { keywords: ['毒品', '吸毒', '贩毒', '摇头丸', '海洛因', '大麻'] },
  { keywords: ['诈骗', '欺诈', '骗', '传销', '非法集资'] },
  { keywords: ['反动', '颠覆', '分裂', '独立', '邪教'] },
  { keywords: ['广告', '推广', '微商', '加微信', '联系方式', 'vx', 'qq'] },
];

export const detectViolation = (text: string): {
  passed: boolean;
  riskLevel: 'low' | 'medium' | 'high';
  categories: string[];
  details: { type: string; description: string }[];
  score: number;
} => {
  if (!text) {
    return { passed: true, riskLevel: 'low', categories: [], details: [], score: 0 };
  }

  const lowerText = text.toLowerCase();
  const categories: string[] = [];
  const details: { type: string; description: string }[] = [];
  let totalScore = 0;

  for (const category of violationCategories) {
    const foundKeywords = category.keywords.filter(k => lowerText.includes(k));
    if (foundKeywords.length > 0) {
      categories.push(category.keywords[0]);
      details.push({
        type: category.keywords[0],
        description: `检测到违规关键词: ${foundKeywords.join(', ')}`,
      });
      totalScore += foundKeywords.length * 20;
    }
  }

  const sensitiveWords = getAllSensitiveWords();
  const sensitiveMatches = sensitiveWords.filter((word: string) => lowerText.includes(word.toLowerCase()));
  if (sensitiveMatches.length > 0) {
    categories.push('敏感词');
    details.push({
      type: '敏感词',
      description: `检测到敏感词: ${sensitiveMatches.join(', ')}`,
    });
    totalScore += sensitiveMatches.length * 15;
  }

  let riskLevel: 'low' | 'medium' | 'high' = 'low';
  if (totalScore >= 60) {
    riskLevel = 'high';
  } else if (totalScore >= 30) {
    riskLevel = 'medium';
  }

  return {
    passed: totalScore < 30,
    riskLevel,
    categories,
    details,
    score: Math.min(totalScore, 100),
  };
};

export const calculateSimilarity = (text1: string, text2: string): number => {
  if (!text1 || !text2) return 0;

  const words1 = new Set(text1.toLowerCase().split(/\s+/));
  const words2 = new Set(text2.toLowerCase().split(/\s+/));

  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);

  return intersection.size / union.size;
};

export const detectDuplicateNote = async (noteId: string, title: string, content: string) => {
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

  const existingNotes = await noteRepository.find({
    where: {
      status: NoteStatus.PUBLISHED,
      isDeleted: false,
      createdAt: MoreThan(threeDaysAgo) as FindOperator<Date>,
    },
  });

  const duplicates: { note: Note; similarity: number }[] = [];

  for (const note of existingNotes) {
    if (note.id === noteId) continue;

    const titleSimilarity = calculateSimilarity(title, note.title);
    const contentSimilarity = calculateSimilarity(content, note.content);
    const overallSimilarity = (titleSimilarity * 0.4 + contentSimilarity * 0.6);

    if (overallSimilarity >= 0.7) {
      duplicates.push({ note, similarity: overallSimilarity });
    }
  }

  return duplicates;
};

export const createReviewTask = async (
  type: ReviewType,
  targetId: string,
  content: string,
  targetUserId?: string
) => {
  const aiResult = detectViolation(content);

  let level = ReviewLevel.AUTO;
  let status = ReviewStatus.PENDING;

  if (aiResult.riskLevel === 'high') {
    status = ReviewStatus.AI_REJECTED;
    level = ReviewLevel.LEVEL_2;
  } else if (aiResult.riskLevel === 'medium') {
    status = ReviewStatus.PENDING;
    level = ReviewLevel.LEVEL_1;
  } else {
    status = ReviewStatus.AI_APPROVED;
  }

  const taskData: Partial<ReviewTask> = {
    type,
    status,
    level,
    aiResult: {
      passed: aiResult.passed,
      riskLevel: aiResult.riskLevel,
      categories: aiResult.categories,
      confidence: 100 - aiResult.score,
      details: aiResult.details,
    },
    aiScore: aiResult.score,
    aiReviewedAt: new Date(),
  };

  if (type === ReviewType.NOTE) {
    taskData.noteId = targetId;
  } else if (type === ReviewType.COMMENT) {
    taskData.commentId = targetId;
  } else if (type === ReviewType.USER) {
    taskData.targetUserId = targetId;
  }

  const task = reviewTaskRepository.create(taskData);
  await reviewTaskRepository.save(task);

  return task;
};

export const createReviewLog = async (
  taskId: string,
  action: ReviewAction,
  operatorId?: string,
  remark?: string,
  metadata?: any
) => {
  const log = reviewLogRepository.create({
    taskId,
    action,
    operatorId,
    remark,
    metadata,
  });
  await reviewLogRepository.save(log);
  return log;
};

export const reviewTask = async (
  taskId: string,
  reviewerId: string,
  passed: boolean,
  reason?: string
) => {
  const task = await reviewTaskRepository.findOne({ where: { id: taskId } });
  if (!task) {
    throw new Error('审核任务不存在');
  }

  const oldStatus = task.status;
  task.status = passed ? ReviewStatus.MANUAL_APPROVED : ReviewStatus.MANUAL_REJECTED;
  task.reviewerId = reviewerId;
  task.reviewedAt = new Date();
  task.reviewCount += 1;
  task.manualResult = {
    passed,
    reason,
  };
  if (!passed && reason) {
    task.rejectReason = reason;
  }

  await reviewTaskRepository.save(task);

  await createReviewLog(taskId, passed ? ReviewAction.APPROVE : ReviewAction.REJECT, reviewerId, reason, {
    oldStatus,
    newStatus: task.status,
    reason,
  });

  if (task.type === ReviewType.NOTE && task.noteId) {
    const note = await noteRepository.findOne({ where: { id: task.noteId } });
    if (note) {
      if (passed) {
        note.status = NoteStatus.PUBLISHED;
      } else {
        note.status = NoteStatus.REJECTED;
        note.rejectReason = reason || '';
      }
      await noteRepository.save(note);
    }
  }

  return task;
};

export const createContentRestriction = async (
  noteId: string,
  type: RestrictionType,
  level: RestrictionLevel,
  reasons: any[],
  operatorId?: string,
  remark?: string
) => {
  const restriction = contentRestrictionRepository.create({
    noteId,
    type,
    level,
    reasons,
    operatorId,
    remark,
    flowMultiplier: level === RestrictionLevel.LIMIT_FLOW ? 0.3 : level === RestrictionLevel.NO_RECOMMEND ? 0 : 1,
  });
  await contentRestrictionRepository.save(restriction);
  return restriction;
};

export const createUserRestriction = async (
  userId: string,
  type: UserRestrictionType,
  reason: string,
  scope: UserRestrictionScope = UserRestrictionScope.ALL,
  operatorId?: string,
  durationHours?: number
) => {
  const restriction = userRestrictionRepository.create({
    userId,
    type,
    scope,
    reason,
    operatorId,
    isPermanent: !durationHours,
    expiresAt: durationHours ? new Date(Date.now() + durationHours * 60 * 60 * 1000) : undefined,
  });
  await userRestrictionRepository.save(restriction);
  return restriction;
};

export const checkUserRestriction = async (userId: string, scope: UserRestrictionScope) => {
  const restrictions = await userRestrictionRepository.find({
    where: {
      userId,
      isActive: true,
    },
  });

  const activeRestrictions = restrictions.filter(r => {
    if (r.expiresAt && new Date() > r.expiresAt) {
      r.isActive = false;
      r.liftedAt = new Date();
      userRestrictionRepository.save(r);
      return false;
    }
    return r.scope === scope || r.scope === UserRestrictionScope.ALL;
  });

  return {
    isRestricted: activeRestrictions.length > 0,
    restrictions: activeRestrictions,
  };
};

export const liftUserRestriction = async (restrictionId: string, operatorId: string, reason: string) => {
  const restriction = await userRestrictionRepository.findOne({ where: { id: restrictionId } });
  if (!restriction) {
    throw new Error('用户限制不存在');
  }

  restriction.isActive = false;
  restriction.liftedAt = new Date();
  restriction.liftedReason = reason;
  return await userRestrictionRepository.save(restriction);
};

export const getPendingReviewTasks = async (type?: ReviewType, page: number = 1, pageSize: number = 20) => {
  const skip = (page - 1) * pageSize;

  let whereCondition: any = {
    status: In([ReviewStatus.PENDING, ReviewStatus.AI_REJECTED]),
  };

  if (type) {
    whereCondition.type = type;
  }

  const [tasks, total] = await reviewTaskRepository.findAndCount({
    where: whereCondition,
    relations: ['note', 'comment', 'targetUser', 'reviewer'],
    order: { createdAt: 'DESC' },
    skip,
    take: pageSize,
  });

  return { tasks, total, page, pageSize };
};
