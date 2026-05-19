import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { Note } from '../entities/Note';
import { Comment } from '../entities/Comment';
import { BehaviorRisk, RiskType, RiskLevel, RiskStatus } from '../entities/BehaviorRisk';
import { AccountRisk, AccountRiskType, AccountRiskLevel, AccountRiskStatus, AccountAction } from '../entities/AccountRisk';
import { LoginLog, LoginStatus } from '../entities/LoginLog';
import { RegisterLog, RegisterStatus } from '../entities/RegisterLog';
import { UserBehavior, BehaviorType } from '../entities/UserBehavior';
import { MoreThan, FindOperator } from 'typeorm';

const userRepository = AppDataSource.getRepository(User);
const noteRepository = AppDataSource.getRepository(Note);
const commentRepository = AppDataSource.getRepository(Comment);
const behaviorRiskRepository = AppDataSource.getRepository(BehaviorRisk);
const accountRiskRepository = AppDataSource.getRepository(AccountRisk);
const loginLogRepository = AppDataSource.getRepository(LoginLog);
const registerLogRepository = AppDataSource.getRepository(RegisterLog);
const userBehaviorRepository = AppDataSource.getRepository(UserBehavior);

export const recordLogin = async (
  userId: string | undefined,
  username: string | undefined,
  phone: string | undefined,
  status: LoginStatus,
  ip?: string,
  userAgent?: string,
  deviceInfo?: any,
  failReason?: string
): Promise<LoginLog> => {
  let location = '';
  if (ip) {
    location = await getLocationByIp(ip);
  }

  let isNewDevice = false;
  let isNewLocation = false;
  let isRisky = false;
  const riskFlags: string[] = [];

  if (userId) {
    const recentLogins = await loginLogRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 10,
    });

    if (deviceInfo?.deviceId) {
      isNewDevice = !recentLogins.some(l => l.deviceInfo?.deviceId === deviceInfo.deviceId);
    }

    if (location) {
      isNewLocation = !recentLogins.some(l => l.location === location);
    }

    if (isNewDevice && isNewLocation) {
      isRisky = true;
      riskFlags.push('new_device_and_location');
    }

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentFailures = recentLogins.filter(
      l => l.status === LoginStatus.FAILED && l.createdAt > oneHourAgo
    );
    if (recentFailures.length >= 3) {
      isRisky = true;
      riskFlags.push('multiple_failed_attempts');
    }
  }

  const log = loginLogRepository.create({
    userId,
    username,
    phone,
    status,
    failReason,
    ip,
    location,
    userAgent,
    deviceInfo,
    isNewDevice,
    isNewLocation,
    isRisky,
    riskFlags,
  });

  await loginLogRepository.save(log);

  if (isRisky && userId) {
    await createAccountRisk(
      userId,
      AccountRiskType.ABNORMAL_LOGIN,
      AccountRiskLevel.MEDIUM,
      {
        rule: 'abnormal_login_detection',
        description: '检测到异常登录行为',
        metrics: { isNewDevice, isNewLocation, riskFlags },
        ipAddresses: ip ? [ip] : undefined,
        locations: location ? [location] : undefined,
      },
      70,
      {
        ip,
        location,
        device: deviceInfo?.deviceId,
        loginTime: new Date().toISOString(),
        isNewDevice,
        isNewLocation,
      }
    );
  }

  return log;
};

export const recordRegister = async (
  userId: string | undefined,
  username: string | undefined,
  phone: string | undefined,
  status: RegisterStatus,
  ip?: string,
  userAgent?: string,
  deviceInfo?: any,
  failReason?: string
): Promise<RegisterLog> => {
  let location = '';
  if (ip) {
    location = await getLocationByIp(ip);
  }

  let isSuspicious = false;
  const riskFlags: string[] = [];
  let batchId: string | undefined;

  if (ip) {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const sameIpRegisters = await registerLogRepository.find({
      where: { ip, createdAt: MoreThan(fiveMinutesAgo) as FindOperator<Date> },
    });

    if (sameIpRegisters.length >= 3) {
      isSuspicious = true;
      riskFlags.push('multiple_registrations_same_ip');
      batchId = `batch_${ip}_${Date.now()}`;
    }
  }

  if (deviceInfo?.deviceId) {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const sameDeviceRegisters = await registerLogRepository.find({
      where: {
        deviceInfo: { deviceId: deviceInfo.deviceId } as any,
        createdAt: MoreThan(fiveMinutesAgo) as FindOperator<Date>,
      },
    });

    if (sameDeviceRegisters.length >= 2) {
      isSuspicious = true;
      riskFlags.push('multiple_registrations_same_device');
    }
  }

  const log = registerLogRepository.create({
    userId,
    username,
    phone,
    status,
    failReason,
    ip,
    location,
    userAgent,
    deviceInfo,
    isSuspicious,
    riskFlags,
    batchId,
  });

  await registerLogRepository.save(log);

  if (isSuspicious && userId) {
    await createAccountRisk(
      userId,
      AccountRiskType.BATCH_REGISTRATION,
      AccountRiskLevel.HIGH,
      {
        rule: 'suspicious_registration',
        description: '检测到可疑注册行为',
        metrics: { riskFlags, batchId },
        ipAddresses: ip ? [ip] : undefined,
        locations: location ? [location] : undefined,
      },
      85,
      undefined,
      batchId ? {
        batchId,
        relatedAccountIds: [],
        registrationTimeWindow: 300,
        sharedAttributes: riskFlags,
      } : undefined
    );
  }

  return log;
};

export const detectBrushBehavior = async (userId: string, noteId: string, behaviorType: BehaviorType): Promise<boolean> => {
  const oneMinuteAgo = new Date(Date.now() - 60 * 1000);

  const recentBehaviors = await userBehaviorRepository.find({
    where: {
      userId,
      behaviorType,
      createdAt: MoreThan(oneMinuteAgo) as FindOperator<Date>,
    },
  });

  if (recentBehaviors.length >= 5) {
    await createBehaviorRisk(
      userId,
      behaviorType === BehaviorType.LIKE ? RiskType.BRUSH_LIKE :
      behaviorType === BehaviorType.FAVORITE ? RiskType.BRUSH_FAVORITE :
      behaviorType === BehaviorType.COMMENT ? RiskType.BRUSH_COMMENT :
      RiskType.SUSPICIOUS_BEHAVIOR,
      RiskLevel.MEDIUM,
      {
        rule: 'rapid_fire_behavior',
        description: `短时间内大量${behaviorType}行为`,
        metrics: { count: recentBehaviors.length, timeWindow: 60 },
      },
      75,
      noteId
    );
    return true;
  }

  return false;
};

export const detectSpamComment = async (userId: string, content: string): Promise<boolean> => {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  const recentComments = await commentRepository.find({
    where: {
      authorId: userId,
      createdAt: MoreThan(oneHourAgo) as FindOperator<Date>,
    },
  });

  if (recentComments.length >= 10) {
    await createBehaviorRisk(
      userId,
      RiskType.SPAM_COMMENT,
      RiskLevel.MEDIUM,
      {
        rule: 'excessive_comments',
        description: '短时间内发布大量评论',
        metrics: { count: recentComments.length, timeWindow: 3600 },
      },
      70
    );
    return true;
  }

  const similarComments = recentComments.filter(c => c.content === content);
  if (similarComments.length >= 3) {
    await createBehaviorRisk(
      userId,
      RiskType.SPAM_COMMENT,
      RiskLevel.HIGH,
      {
        rule: 'duplicate_comments',
        description: '发布重复内容评论',
        metrics: { duplicateCount: similarComments.length },
      },
      80
    );
    return true;
  }

  return false;
};

export const createBehaviorRisk = async (
  userId: string,
  type: RiskType,
  level: RiskLevel,
  evidence: any,
  confidence: number,
  noteId?: string,
  commentId?: string,
  ip?: string,
  userAgent?: string,
  deviceInfo?: any
): Promise<BehaviorRisk> => {
  const risk = behaviorRiskRepository.create({
    userId,
    type,
    level,
    status: RiskStatus.DETECTED,
    noteId,
    commentId,
    evidence,
    confidence,
    ip,
    userAgent,
    deviceInfo,
  });
  await behaviorRiskRepository.save(risk);
  return risk;
};

export const createAccountRisk = async (
  userId: string,
  type: AccountRiskType,
  level: AccountRiskLevel,
  evidence: any,
  confidence: number,
  loginDetails?: any,
  batchDetails?: any
): Promise<AccountRisk> => {
  const risk = accountRiskRepository.create({
    userId,
    type,
    level,
    status: AccountRiskStatus.DETECTED,
    actionTaken: AccountAction.NONE,
    evidence,
    confidence,
    loginDetails,
    batchDetails,
  });
  await accountRiskRepository.save(risk);
  return risk;
};

export const processBehaviorRisk = async (
  riskId: string,
  reviewerId: string,
  confirmed: boolean,
  action?: AccountAction,
  reviewNote?: string
): Promise<BehaviorRisk> => {
  const risk = await behaviorRiskRepository.findOne({ where: { id: riskId } });
  if (!risk) {
    throw new Error('行为风险记录不存在');
  }

  risk.status = confirmed ? RiskStatus.CONFIRMED : RiskStatus.DISMISSED;
  risk.reviewerId = reviewerId;
  risk.reviewNote = reviewNote || '';
  risk.reviewedAt = new Date();

  if (confirmed && action && risk.userId) {
    risk.actionsTaken = [{
      type: action,
      description: getActionDescription(action),
      timestamp: new Date().toISOString(),
    }];
    risk.processedAt = new Date();
  }

  await behaviorRiskRepository.save(risk);
  return risk;
};

export const processAccountRisk = async (
  riskId: string,
  reviewerId: string,
  confirmed: boolean,
  action?: AccountAction,
  reviewNote?: string
): Promise<AccountRisk> => {
  const risk = await accountRiskRepository.findOne({ where: { id: riskId } });
  if (!risk) {
    throw new Error('账号风险记录不存在');
  }

  risk.status = confirmed ? AccountRiskStatus.CONFIRMED : AccountRiskStatus.DISMISSED;
  risk.reviewerId = reviewerId;
  risk.reviewNote = reviewNote || '';
  risk.reviewedAt = new Date();

  if (confirmed && action) {
    risk.actionTaken = action;
    risk.processedAt = new Date();
  }

  await accountRiskRepository.save(risk);
  return risk;
};

export const getBehaviorRisks = async (
  status?: RiskStatus,
  type?: RiskType,
  page: number = 1,
  pageSize: number = 20
) => {
  const skip = (page - 1) * pageSize;

  let whereCondition: any = {};
  if (status) {
    whereCondition.status = status;
  }
  if (type) {
    whereCondition.type = type;
  }

  const [risks, total] = await behaviorRiskRepository.findAndCount({
    where: whereCondition,
    relations: ['user', 'note', 'comment'],
    order: { detectedAt: 'DESC' },
    skip,
    take: pageSize,
  });

  return { risks, total, page, pageSize };
};

export const getAccountRisks = async (
  status?: AccountRiskStatus,
  type?: AccountRiskType,
  page: number = 1,
  pageSize: number = 20
) => {
  const skip = (page - 1) * pageSize;

  let whereCondition: any = {};
  if (status) {
    whereCondition.status = status;
  }
  if (type) {
    whereCondition.type = type;
  }

  const [risks, total] = await accountRiskRepository.findAndCount({
    where: whereCondition,
    relations: ['user'],
    order: { detectedAt: 'DESC' },
    skip,
    take: pageSize,
  });

  return { risks, total, page, pageSize };
};

const getLocationByIp = async (ip: string): Promise<string> => {
  return '';
};

const getActionDescription = (action: AccountAction): string => {
  const descriptions: { [key: string]: string } = {
    [AccountAction.NONE]: '无操作',
    [AccountAction.WARNING]: '账号警告',
    [AccountAction.FORCE_VERIFY]: '强制验证',
    [AccountAction.TEMP_LOCK]: '临时锁定',
    [AccountAction.PERM_BAN]: '永久封禁',
  };
  return descriptions[action] || action;
};
