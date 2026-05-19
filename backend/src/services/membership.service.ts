import { AppDataSource } from '../config/database';
import { MembershipPlan, MembershipPlanType, MembershipStatus } from '../entities/MembershipPlan';
import { UserMembership, UserMembershipStatus } from '../entities/UserMembership';
import { User } from '../entities/User';

const membershipPlanRepository = AppDataSource.getRepository(MembershipPlan);
const userMembershipRepository = AppDataSource.getRepository(UserMembership);
const userRepository = AppDataSource.getRepository(User);

export const createMembershipPlan = async (
  planData: Partial<MembershipPlan>
): Promise<MembershipPlan> => {
  const plan = membershipPlanRepository.create(planData);
  return await membershipPlanRepository.save(plan);
};

export const updateMembershipPlan = async (
  planId: string,
  updates: Partial<MembershipPlan>
): Promise<MembershipPlan> => {
  const plan = await membershipPlanRepository.findOne({ where: { id: planId } });
  if (!plan) {
    throw new Error('会员套餐不存在');
  }

  Object.assign(plan, updates);
  return await membershipPlanRepository.save(plan);
};

export const getMembershipPlans = async (
  includeInactive: boolean = false
): Promise<MembershipPlan[]> => {
  const whereCondition: any = {};
  if (!includeInactive) {
    whereCondition.status = MembershipStatus.ACTIVE;
  }

  return await membershipPlanRepository.find({
    where: whereCondition,
    order: { sortOrder: 'ASC', price: 'ASC' },
  });
};

export const getMembershipPlan = async (planId: string): Promise<MembershipPlan | null> => {
  return await membershipPlanRepository.findOne({ where: { id: planId } });
};

export const deleteMembershipPlan = async (planId: string): Promise<void> => {
  const plan = await membershipPlanRepository.findOne({ where: { id: planId } });
  if (!plan) {
    throw new Error('会员套餐不存在');
  }

  plan.status = MembershipStatus.DEPRECATED;
  await membershipPlanRepository.save(plan);
};

export const getUserMembership = async (userId: string): Promise<UserMembership | null> => {
  return await userMembershipRepository.findOne({
    where: { userId, status: UserMembershipStatus.ACTIVE },
    relations: ['plan'],
  });
};

export const getUserMembershipHistory = async (
  userId: string,
  page: number = 1,
  pageSize: number = 20
): Promise<{ memberships: UserMembership[]; total: number }> => {
  const skip = (page - 1) * pageSize;

  const [memberships, total] = await userMembershipRepository.findAndCount({
    where: { userId },
    relations: ['plan'],
    order: { createdAt: 'DESC' },
    skip,
    take: pageSize,
  });

  return { memberships, total };
};

export const cancelMembershipAutoRenew = async (userId: string): Promise<UserMembership> => {
  const membership = await userMembershipRepository.findOne({
    where: { userId, status: UserMembershipStatus.ACTIVE },
  });

  if (!membership) {
    throw new Error('没有激活的会员');
  }

  membership.autoRenew = false;
  return await userMembershipRepository.save(membership);
};

export const checkUserFeatureAccess = async (
  userId: string,
  feature: string
): Promise<{ hasAccess: boolean; reason?: string }> => {
  const membership = await getUserMembership(userId);

  if (!membership) {
    return { hasAccess: false, reason: '需要开通会员' };
  }

  const planFeatures = membership.plan.features as any;
  if (planFeatures && planFeatures[feature]) {
    return { hasAccess: true };
  }

  return { hasAccess: false, reason: '当前会员等级不支持此功能' };
};

export const getMembershipBenefits = async (planId: string): Promise<any> => {
  const plan = await membershipPlanRepository.findOne({ where: { id: planId } });
  if (!plan) {
    throw new Error('会员套餐不存在');
  }

  return {
    features: plan.features,
    perks: plan.perks,
  };
};

export const upgradeMembership = async (
  userId: string,
  newPlanId: string
): Promise<UserMembership> => {
  const currentMembership = await getUserMembership(userId);
  const newPlan = await getMembershipPlan(newPlanId);

  if (!newPlan) {
    throw new Error('新套餐不存在');
  }

  if (currentMembership && currentMembership.expiresAt > new Date()) {
    currentMembership.planId = newPlanId;
    currentMembership.plan = newPlan as any;
    currentMembership.features = newPlan.features;
    return await userMembershipRepository.save(currentMembership);
  } else {
    const newMembership = userMembershipRepository.create({
      userId,
      planId: newPlanId,
      plan: newPlan as any,
      startDate: new Date(),
      expiresAt: new Date(Date.now() + newPlan.durationDays * 24 * 60 * 60 * 1000),
      status: UserMembershipStatus.ACTIVE,
      features: newPlan.features,
    });
    return await userMembershipRepository.save(newMembership);
  }
};

export const getAllActiveMemberships = async (
  page: number = 1,
  pageSize: number = 50
): Promise<{ memberships: UserMembership[]; total: number }> => {
  const skip = (page - 1) * pageSize;

  const [memberships, total] = await userMembershipRepository.findAndCount({
    where: { status: UserMembershipStatus.ACTIVE },
    relations: ['user', 'plan'],
    order: { createdAt: 'DESC' },
    skip,
    take: pageSize,
  });

  return { memberships, total };
};

export const getExpiringMemberships = async (
  days: number = 7
): Promise<UserMembership[]> => {
  const expiryDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

  return await userMembershipRepository
    .createQueryBuilder('membership')
    .where('membership.status = :status', { status: UserMembershipStatus.ACTIVE })
    .andWhere('membership.expiresAt < :expiryDate', { expiryDate })
    .leftJoinAndSelect('membership.user', 'user')
    .leftJoinAndSelect('membership.plan', 'plan')
    .getMany();
};

export const purchaseMembership = async (
  userId: string,
  planId: string
): Promise<{ orderId: string; membership: UserMembership }> => {
  const plan = await getMembershipPlan(planId);
  if (!plan) {
    throw new Error('会员套餐不存在');
  }

  const currentMembership = await getUserMembership(userId);
  let newMembership: UserMembership;

  if (currentMembership && currentMembership.expiresAt > new Date()) {
    const extendedExpiry = new Date(currentMembership.expiresAt.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);
    currentMembership.expiresAt = extendedExpiry;
    currentMembership.planId = planId;
    currentMembership.plan = plan as any;
    newMembership = await userMembershipRepository.save(currentMembership);
  } else {
    newMembership = userMembershipRepository.create({
      userId,
      planId,
      plan: plan as any,
      startDate: new Date(),
      expiresAt: new Date(Date.now() + plan.durationDays * 24 * 60 * 60 * 1000),
      status: UserMembershipStatus.ACTIVE,
      autoRenew: false,
      features: plan.features,
    });
    newMembership = await userMembershipRepository.save(newMembership);
  }

  return {
    orderId: `ORD${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    membership: newMembership,
  };
};

export const getMembershipBenefitsForUser = async (
  userId?: string
): Promise<{ benefits: string[]; isMember: boolean; expiresAt?: string }> => {
  const defaultBenefits = [
    '浏览公开内容',
    '基础搜索功能',
    '社区互动（评论/点赞）',
  ];

  if (!userId) {
    return {
      benefits: defaultBenefits,
      isMember: false,
    };
  }

  const membership = await getUserMembership(userId);
  if (!membership) {
    return {
      benefits: defaultBenefits,
      isMember: false,
    };
  }

  const planBenefits = (membership.plan.features as any)?.benefits || [];
  const allBenefits = [...defaultBenefits, ...planBenefits];

  return {
    benefits: allBenefits,
    isMember: true,
    expiresAt: membership.expiresAt.toISOString(),
  };
};

export const getUserExpiringMemberships = async (
  userId: string,
  days: number = 7
): Promise<UserMembership[]> => {
  const expiryDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

  return await userMembershipRepository
    .createQueryBuilder('membership')
    .where('membership.userId = :userId', { userId })
    .andWhere('membership.status = :status', { status: UserMembershipStatus.ACTIVE })
    .andWhere('membership.expiresAt < :expiryDate', { expiryDate })
    .leftJoinAndSelect('membership.plan', 'plan')
    .getMany();
};
