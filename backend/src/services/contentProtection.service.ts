import { AppDataSource } from '../config/database';
import { ContentProtection, CopyProtectionLevel, ProtectionType } from '../entities/ContentProtection';
import { Note } from '../entities/Note';
import { User } from '../entities/User';
import {
  protectContent,
  generateCopyProtectionScript,
  generateCopyProtectionCSS,
  detectProtectedContent,
  cleanProtectedContent,
  encryptContent,
  decryptContent,
} from '../utils/contentProtection';

const contentProtectionRepository = AppDataSource.getRepository(ContentProtection);
const noteRepository = AppDataSource.getRepository(Note);
const userRepository = AppDataSource.getRepository(User);

export const createContentProtection = async (
  noteId: string,
  ownerId: string,
  options: {
    protectionType?: ProtectionType;
    copyProtectionLevel?: CopyProtectionLevel;
    disableTextSelection?: boolean;
    disableRightClick?: boolean;
    disableKeyboardCopy?: boolean;
    disablePrint?: boolean;
    enableWatermark?: boolean;
    watermarkConfig?: any;
    enableScreenshotProtection?: boolean;
    accessRules?: any;
  } = {}
): Promise<ContentProtection> => {
  const note = await noteRepository.findOne({ where: { id: noteId } });
  if (!note) {
    throw new Error('笔记不存在');
  }

  const owner = await userRepository.findOne({ where: { id: ownerId } });
  if (!owner) {
    throw new Error('用户不存在');
  }

  const existing = await contentProtectionRepository.findOne({
    where: { noteId, protectionType: options.protectionType || ProtectionType.DISABLE_COPY },
  });

  if (existing) {
    Object.assign(existing, {
      copyProtectionLevel: options.copyProtectionLevel || CopyProtectionLevel.STANDARD,
      disableTextSelection: options.disableTextSelection ?? true,
      disableRightClick: options.disableRightClick ?? true,
      disableKeyboardCopy: options.disableKeyboardCopy ?? true,
      disablePrint: options.disablePrint ?? true,
      enableWatermark: options.enableWatermark ?? false,
      watermarkConfig: options.watermarkConfig,
      enableScreenshotProtection: options.enableScreenshotProtection ?? false,
      accessRules: options.accessRules,
      isActive: true,
    });
    return await contentProtectionRepository.save(existing);
  }

  const protection = contentProtectionRepository.create({
    note,
    noteId,
    owner,
    ownerId,
    protectionType: options.protectionType || ProtectionType.DISABLE_COPY,
    copyProtectionLevel: options.copyProtectionLevel || CopyProtectionLevel.STANDARD,
    disableTextSelection: options.disableTextSelection ?? true,
    disableRightClick: options.disableRightClick ?? true,
    disableKeyboardCopy: options.disableKeyboardCopy ?? true,
    disablePrint: options.disablePrint ?? true,
    enableWatermark: options.enableWatermark ?? false,
    watermarkConfig: options.watermarkConfig,
    enableScreenshotProtection: options.enableScreenshotProtection ?? false,
    accessRules: options.accessRules,
    isActive: true,
  });

  return await contentProtectionRepository.save(protection);
};

export const getNoteContentProtection = async (noteId: string): Promise<ContentProtection | null> => {
  return await contentProtectionRepository.findOne({
    where: { noteId, isActive: true },
    relations: ['note', 'owner'],
  });
};

export const getProtectedNoteContent = async (
  noteId: string,
  userId?: string
): Promise<{
  content: string;
  isProtected: boolean;
  protectionScript: string;
  protectionCSS: string;
  protectionLevel: CopyProtectionLevel;
  isEncrypted: boolean;
  requiresPayment: boolean;
  requiresMembership: boolean;
}> => {
  const note = await noteRepository.findOne({ where: { id: noteId } });
  if (!note) {
    throw new Error('笔记不存在');
  }

  const protection = await contentProtectionRepository.findOne({
    where: { noteId, isActive: true },
  });

  if (!protection) {
    return {
      content: note.content,
      isProtected: false,
      protectionScript: '',
      protectionCSS: '',
      protectionLevel: CopyProtectionLevel.NONE,
      isEncrypted: false,
      requiresPayment: false,
      requiresMembership: false,
    };
  }

  let content = note.content;
  let isEncrypted = false;
  let requiresPayment = false;
  let requiresMembership = false;

  if (protection.protectionType === ProtectionType.PAYWALL) {
    requiresPayment = true;
    const hasAccess = await checkNoteAccess(noteId, userId);
    if (!hasAccess) {
      content = content.substring(0, 200) + '...\n\n[此内容为付费内容，请购买后查看完整内容]';
    }
  }

  if (protection.protectionType === ProtectionType.SUBSCRIPTION_ONLY) {
    requiresMembership = true;
    const hasAccess = await checkNoteMembershipAccess(noteId, userId);
    if (!hasAccess) {
      content = content.substring(0, 200) + '...\n\n[此内容为会员专属内容，请升级会员后查看]';
    }
  }

  if (protection.protectionType === ProtectionType.ENCRYPTED_CONTENT && protection.encryptedContent) {
    isEncrypted = true;
    const hasAccess = await checkNoteAccess(noteId, userId);
    if (hasAccess && protection.encryptionKey) {
      content = decryptContent(protection.encryptedContent, protection.encryptionKey);
    } else {
      content = '[内容已加密，请获取解密权限后查看]';
    }
  }

  const protectionScript = generateCopyProtectionScript(noteId, {
    disableCopy: protection.disableKeyboardCopy,
    disableRightClick: protection.disableRightClick,
    disableSelect: protection.disableTextSelection,
    watermarkText: protection.enableWatermark && protection.watermarkConfig?.text
      ? protection.watermarkConfig.text
      : undefined,
  });

  const protectionCSS = protection.disableTextSelection ? generateCopyProtectionCSS() : '';

  return {
    content,
    isProtected: true,
    protectionScript,
    protectionCSS,
    protectionLevel: protection.copyProtectionLevel,
    isEncrypted,
    requiresPayment,
    requiresMembership,
  };
};

export const checkNoteAccess = async (noteId: string, userId?: string): Promise<boolean> => {
  if (!userId) return false;

  const note = await noteRepository.findOne({ where: { id: noteId } });
  if (!note) return false;

  if (note.authorId === userId) return true;

  return true;
};

export const checkNoteMembershipAccess = async (noteId: string, userId?: string): Promise<boolean> => {
  if (!userId) return false;

  const note = await noteRepository.findOne({ where: { id: noteId } });
  if (!note) return false;

  if (note.authorId === userId) return true;

  const userMembership = await AppDataSource.getRepository('UserMembership').findOne({
    where: { userId, status: 'active' },
  });

  return !!userMembership;
};

export const analyzeContentProtection = async (content: string) => {
  return detectProtectedContent(content);
};

export const removeContentProtection = async (noteId: string, protectionType: ProtectionType): Promise<boolean> => {
  const protection = await contentProtectionRepository.findOne({
    where: { noteId, protectionType, isActive: true },
  });

  if (!protection) {
    return false;
  }

  protection.isActive = false;
  await contentProtectionRepository.save(protection);
  return true;
};

export const getProtectedNotes = async (
  ownerId: string,
  page: number = 1,
  pageSize: number = 20
): Promise<{ protections: ContentProtection[]; total: number }> => {
  const skip = (page - 1) * pageSize;

  const [protections, total] = await contentProtectionRepository.findAndCount({
    where: { ownerId, isActive: true },
    relations: ['note'],
    order: { createdAt: 'DESC' },
    skip,
    take: pageSize,
  });

  return { protections, total };
};

export const encryptNoteContent = async (
  noteId: string,
  ownerId: string,
  encryptionKey: string
): Promise<ContentProtection> => {
  const note = await noteRepository.findOne({ where: { id: noteId } });
  if (!note) {
    throw new Error('笔记不存在');
  }

  if (note.authorId !== ownerId) {
    throw new Error('无权加密此笔记');
  }

  const encryptedContent = encryptContent(note.content, encryptionKey);

  return await createContentProtection(noteId, ownerId, {
    protectionType: ProtectionType.ENCRYPTED_CONTENT,
    copyProtectionLevel: CopyProtectionLevel.MAXIMUM,
  });
};
