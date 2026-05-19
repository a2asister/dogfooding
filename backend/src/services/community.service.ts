import { AppDataSource } from '../config/database';
import { Community, CommunityType } from '../entities/Community';
import { CommunityMember, CommunityMemberStatus, CommunityRole } from '../entities/CommunityMember';
import { User } from '../entities/User';
import { Note } from '../entities/Note';

const communityRepository = AppDataSource.getRepository(Community);
const communityMemberRepository = AppDataSource.getRepository(CommunityMember);
const userRepository = AppDataSource.getRepository(User);
const noteRepository = AppDataSource.getRepository(Note);

export const createCommunity = async (
  ownerId: string,
  name: string,
  options: {
    description?: string;
    avatar?: string;
    coverImage?: string;
    type?: CommunityType;
    category?: string;
    rules?: string[];
    settings?: any;
  } = {}
): Promise<Community> => {
  const owner = await userRepository.findOne({ where: { id: ownerId } });
  if (!owner) {
    throw new Error('用户不存在');
  }

  const existing = await communityRepository.findOne({ where: { name } });
  if (existing) {
    throw new Error('社群名称已存在');
  }

  const community = communityRepository.create({
    name,
    description: options.description,
    avatar: options.avatar,
    coverImage: options.coverImage,
    type: options.type || CommunityType.PUBLIC,
    category: options.category,
    rules: options.rules || [],
    settings: options.settings || {
      allowPosts: true,
      allowComments: true,
      allowInvites: true,
      requireApproval: false,
      postReviewRequired: false,
    },
    ownerId,
    owner,
    memberCount: 1,
  });

  const savedCommunity = await communityRepository.save(community);

  const member = communityMemberRepository.create({
    communityId: savedCommunity.id,
    userId: ownerId,
    status: CommunityMemberStatus.ACTIVE,
    roles: [CommunityRole.OWNER],
    joinedAt: new Date(),
  });

  await communityMemberRepository.save(member);

  return savedCommunity;
};

export const getCommunity = async (communityId: string): Promise<Community | null> => {
  return await communityRepository.findOne({
    where: { id: communityId, isActive: true },
    relations: ['owner', 'pinnedNotes'],
  });
};

export const getUserCommunities = async (
  userId: string,
  page: number = 1,
  pageSize: number = 20
): Promise<{ communities: Community[]; total: number }> => {
  const skip = (page - 1) * pageSize;

  const members = await communityMemberRepository.find({
    where: { userId, status: CommunityMemberStatus.ACTIVE },
    relations: ['community'],
    skip,
    take: pageSize,
  });

  const communities = members
    .map(m => m.community)
    .filter(c => c && c.isActive);

  const total = await communityMemberRepository.count({
    where: { userId, status: CommunityMemberStatus.ACTIVE },
  });

  return { communities, total };
};

export const getPublicCommunities = async (
  category?: string,
  page: number = 1,
  pageSize: number = 20
): Promise<{ communities: Community[]; total: number }> => {
  const skip = (page - 1) * pageSize;

  const whereCondition: any = { type: CommunityType.PUBLIC, isActive: true };
  if (category) {
    whereCondition.category = category;
  }

  const [communities, total] = await communityRepository.findAndCount({
    where: whereCondition,
    relations: ['owner'],
    order: { memberCount: 'DESC' },
    skip,
    take: pageSize,
  });

  return { communities, total };
};

export const joinCommunity = async (
  communityId: string,
  userId: string,
  invitedBy?: string
): Promise<CommunityMember> => {
  const community = await communityRepository.findOne({ where: { id: communityId, isActive: true } });
  if (!community) {
    throw new Error('社群不存在');
  }

  const existing = await communityMemberRepository.findOne({
    where: { communityId, userId },
  });

  if (existing) {
    if (existing.status === CommunityMemberStatus.BANNED) {
      throw new Error('您已被禁止加入此社群');
    }
    if (existing.status === CommunityMemberStatus.ACTIVE) {
      return existing;
    }
    existing.status = CommunityMemberStatus.ACTIVE;
    existing.joinedAt = new Date();
    return await communityMemberRepository.save(existing);
  }

  const status =
    community.type === CommunityType.PRIVATE || community.settings?.requireApproval
      ? CommunityMemberStatus.PENDING
      : CommunityMemberStatus.ACTIVE;

  const member = communityMemberRepository.create({
    communityId,
    userId,
    status,
    roles: [CommunityRole.MEMBER],
    invitedBy,
    joinedAt: status === CommunityMemberStatus.ACTIVE ? new Date() : undefined,
  });

  const savedMember = await communityMemberRepository.save(member);

  if (status === CommunityMemberStatus.ACTIVE) {
    community.memberCount += 1;
    await communityRepository.save(community);
  }

  return savedMember;
};

export const leaveCommunity = async (communityId: string, userId: string): Promise<boolean> => {
  const member = await communityMemberRepository.findOne({
    where: { communityId, userId },
  });

  if (!member) return false;

  if (member.roles?.includes(CommunityRole.OWNER)) {
    throw new Error('群主不能退出社群，请先转让群主');
  }

  member.status = CommunityMemberStatus.LEFT;
  await communityMemberRepository.save(member);

  const community = await communityRepository.findOne({ where: { id: communityId } });
  if (community) {
    community.memberCount = Math.max(0, community.memberCount - 1);
    await communityRepository.save(community);
  }

  return true;
};

export const getCommunityMembers = async (
  communityId: string,
  status?: CommunityMemberStatus,
  page: number = 1,
  pageSize: number = 50
): Promise<{ members: CommunityMember[]; total: number }> => {
  const skip = (page - 1) * pageSize;

  const whereCondition: any = { communityId };
  if (status) {
    whereCondition.status = status;
  }

  const [members, total] = await communityMemberRepository.findAndCount({
    where: whereCondition,
    relations: ['user'],
    order: { createdAt: 'ASC' },
    skip,
    take: pageSize,
  });

  return { members, total };
};

export const updateMemberRole = async (
  communityId: string,
  userId: string,
  operatorId: string,
  roles: string[]
): Promise<CommunityMember> => {
  const operator = await communityMemberRepository.findOne({
    where: { communityId, userId: operatorId },
  });

  if (!operator || !operator.roles?.includes(CommunityRole.OWNER)) {
    throw new Error('只有群主可以管理成员角色');
  }

  const member = await communityMemberRepository.findOne({
    where: { communityId, userId },
  });

  if (!member) {
    throw new Error('成员不存在');
  }

  member.roles = roles;
  return await communityMemberRepository.save(member);
};

export const approveMember = async (
  communityId: string,
  userId: string,
  operatorId: string,
  approved: boolean
): Promise<CommunityMember> => {
  const operator = await communityMemberRepository.findOne({
    where: { communityId, userId: operatorId },
  });

  if (!operator || !operator.roles?.some(r => [CommunityRole.OWNER, CommunityRole.ADMIN, CommunityRole.MODERATOR].includes(r as any))) {
    throw new Error('没有权限审核成员');
  }

  const member = await communityMemberRepository.findOne({
    where: { communityId, userId, status: CommunityMemberStatus.PENDING },
  });

  if (!member) {
    throw new Error('待审核成员不存在');
  }

  if (approved) {
    member.status = CommunityMemberStatus.ACTIVE;
    member.joinedAt = new Date();

    const community = await communityRepository.findOne({ where: { id: communityId } });
    if (community) {
      community.memberCount += 1;
      await communityRepository.save(community);
    }
  } else {
    member.status = CommunityMemberStatus.LEFT;
  }

  return await communityMemberRepository.save(member);
};

export const banMember = async (
  communityId: string,
  userId: string,
  operatorId: string,
  reason?: string
): Promise<boolean> => {
  const operator = await communityMemberRepository.findOne({
    where: { communityId, userId: operatorId },
  });

  if (!operator || !operator.roles?.some(r => [CommunityRole.OWNER, CommunityRole.ADMIN, CommunityRole.MODERATOR].includes(r as any))) {
    throw new Error('没有权限禁言成员');
  }

  const member = await communityMemberRepository.findOne({
    where: { communityId, userId },
  });

  if (!member) return false;

  if (member.roles?.includes(CommunityRole.OWNER)) {
    throw new Error('不能禁言群主');
  }

  member.status = CommunityMemberStatus.MUTED;
  member.joinReason = reason || '';
  await communityMemberRepository.save(member);

  return true;
};

export const updateCommunity = async (
  communityId: string,
  userId: string,
  updates: Partial<Community>
): Promise<Community> => {
  const community = await communityRepository.findOne({ where: { id: communityId } });
  if (!community) {
    throw new Error('社群不存在');
  }

  if (community.ownerId !== userId) {
    throw new Error('只有群主可以修改社群信息');
  }

  Object.assign(community, updates);
  return await communityRepository.save(community);
};

export const pinNote = async (
  communityId: string,
  noteId: string,
  userId: string
): Promise<boolean> => {
  const member = await communityMemberRepository.findOne({
    where: { communityId, userId },
  });

  if (!member || !member.roles?.some(r => [CommunityRole.OWNER, CommunityRole.ADMIN].includes(r as any))) {
    throw new Error('没有权限置顶笔记');
  }

  const note = await noteRepository.findOne({ where: { id: noteId } });
  if (!note) {
    throw new Error('笔记不存在');
  }

  const community = await communityRepository.findOne({
    where: { id: communityId },
    relations: ['pinnedNotes'],
  });

  if (!community) return false;

  if (!community.pinnedNotes) {
    community.pinnedNotes = [];
  }

  if (community.pinnedNotes.length >= 5) {
    throw new Error('最多置顶5条笔记');
  }

  if (!community.pinnedNotes.find(n => n.id === noteId)) {
    community.pinnedNotes.push(note);
    await communityRepository.save(community);
  }

  return true;
};

export const unpinNote = async (
  communityId: string,
  noteId: string,
  userId: string
): Promise<boolean> => {
  const member = await communityMemberRepository.findOne({
    where: { communityId, userId },
  });

  if (!member || !member.roles?.some(r => [CommunityRole.OWNER, CommunityRole.ADMIN].includes(r as any))) {
    throw new Error('没有权限取消置顶');
  }

  const community = await communityRepository.findOne({
    where: { id: communityId },
    relations: ['pinnedNotes'],
  });

  if (!community || !community.pinnedNotes) return false;

  community.pinnedNotes = community.pinnedNotes.filter(n => n.id !== noteId);
  await communityRepository.save(community);

  return true;
};

export const deleteCommunity = async (communityId: string, userId: string): Promise<boolean> => {
  const community = await communityRepository.findOne({ where: { id: communityId } });
  if (!community) return false;

  if (community.ownerId !== userId) {
    throw new Error('只有群主可以删除社群');
  }

  community.isActive = false;
  await communityRepository.save(community);

  return true;
};
