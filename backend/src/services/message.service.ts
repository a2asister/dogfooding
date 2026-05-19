import { AppDataSource } from '../config/database';
import { Message, MessageType, MessageStatus } from '../entities/Message';
import { Conversation } from '../entities/Conversation';
import { User } from '../entities/User';

const messageRepository = AppDataSource.getRepository(Message);
const conversationRepository = AppDataSource.getRepository(Conversation);
const userRepository = AppDataSource.getRepository(User);

export const getOrCreateConversation = async (
  user1Id: string,
  user2Id: string
): Promise<Conversation> => {
  if (user1Id === user2Id) {
    throw new Error('不能给自己发消息');
  }

  const [user1, user2] = await Promise.all([
    userRepository.findOne({ where: { id: user1Id } }),
    userRepository.findOne({ where: { id: user2Id } }),
  ]);

  if (!user1 || !user2) {
    throw new Error('用户不存在');
  }

  const existing = await conversationRepository
    .createQueryBuilder('conversation')
    .where(
      '(conversation.user1Id = :user1Id AND conversation.user2Id = :user2Id) OR (conversation.user1Id = :user2Id AND conversation.user2Id = :user1Id)',
      { user1Id, user2Id }
    )
    .getOne();

  if (existing) {
    if (existing.isDeletedByUser1 && existing.user1Id === user1Id) {
      existing.isDeletedByUser1 = false;
    }
    if (existing.isDeletedByUser2 && existing.user2Id === user1Id) {
      existing.isDeletedByUser2 = false;
    }
    return await conversationRepository.save(existing);
  }

  const conversation = conversationRepository.create({
    user1Id,
    user2Id,
    user1,
    user2,
  });

  return await conversationRepository.save(conversation);
};

export const sendMessage = async (
  senderId: string,
  receiverId: string,
  content: string,
  type: MessageType = MessageType.TEXT,
  metadata?: any
): Promise<Message> => {
  const conversation = await getOrCreateConversation(senderId, receiverId);

  const message = messageRepository.create({
    conversationId: conversation.id,
    senderId,
    receiverId,
    type,
    content,
    metadata,
    status: MessageStatus.SENT,
  });

  const savedMessage = await messageRepository.save(message);

  conversation.lastMessageId = savedMessage.id;
  conversation.lastMessagePreview = content.substring(0, 100);

  if (conversation.user1Id === senderId) {
    conversation.unreadCountUser2 += 1;
  } else {
    conversation.unreadCountUser1 += 1;
  }

  await conversationRepository.save(conversation);

  return savedMessage;
};

export const getConversation = async (
  conversationId: string,
  userId: string
): Promise<Conversation | null> => {
  const conversation = await conversationRepository.findOne({
    where: { id: conversationId },
    relations: ['user1', 'user2', 'lastMessage'],
  });

  if (!conversation) return null;

  if (conversation.user1Id !== userId && conversation.user2Id !== userId) {
    return null;
  }

  if (
    (conversation.user1Id === userId && conversation.isDeletedByUser1) ||
    (conversation.user2Id === userId && conversation.isDeletedByUser2)
  ) {
    return null;
  }

  return conversation;
};

export const getUserConversations = async (
  userId: string,
  page: number = 1,
  pageSize: number = 20
): Promise<{ conversations: Conversation[]; total: number; unreadTotal: number }> => {
  const skip = (page - 1) * pageSize;

  const [conversations, total] = await conversationRepository
    .createQueryBuilder('conversation')
    .leftJoinAndSelect('conversation.user1', 'user1')
    .leftJoinAndSelect('conversation.user2', 'user2')
    .leftJoinAndSelect('conversation.lastMessage', 'lastMessage')
    .where(
      '(conversation.user1Id = :userId AND conversation.isDeletedByUser1 = :false) OR (conversation.user2Id = :userId AND conversation.isDeletedByUser2 = :false)',
      { userId, false: false }
    )
    .orderBy('conversation.updatedAt', 'DESC')
    .skip(skip)
    .take(pageSize)
    .getManyAndCount();

  let unreadTotal = 0;
  for (const conv of conversations) {
    if (conv.user1Id === userId) {
      unreadTotal += conv.unreadCountUser1;
    } else {
      unreadTotal += conv.unreadCountUser2;
    }
  }

  return { conversations, total, unreadTotal };
};

export const getConversationMessages = async (
  conversationId: string,
  userId: string,
  page: number = 1,
  pageSize: number = 50
): Promise<{ messages: Message[]; total: number }> => {
  const conversation = await getConversation(conversationId, userId);
  if (!conversation) {
    throw new Error('会话不存在');
  }

  const skip = (page - 1) * pageSize;

  const [messages, total] = await messageRepository
    .createQueryBuilder('message')
    .where('message.conversationId = :conversationId', { conversationId })
    .andWhere(
      '(message.isDeletedBySender = :false OR message.senderId != :userId)',
      { false: false, userId }
    )
    .andWhere(
      '(message.isDeletedByReceiver = :false OR message.receiverId != :userId)',
      { false: false, userId }
    )
    .orderBy('message.createdAt', 'DESC')
    .skip(skip)
    .take(pageSize)
    .getManyAndCount();

  return { messages: messages.reverse(), total };
};

export const markMessagesAsRead = async (
  conversationId: string,
  userId: string
): Promise<void> => {
  const conversation = await conversationRepository.findOne({
    where: { id: conversationId },
  });

  if (!conversation) return;

  let unreadCount = 0;
  if (conversation.user1Id === userId) {
    unreadCount = conversation.unreadCountUser1;
    conversation.unreadCountUser1 = 0;
  } else if (conversation.user2Id === userId) {
    unreadCount = conversation.unreadCountUser2;
    conversation.unreadCountUser2 = 0;
  }

  await conversationRepository.save(conversation);

  if (unreadCount > 0) {
    await messageRepository
      .createQueryBuilder()
      .update(Message)
      .set({ status: MessageStatus.READ, readAt: new Date() })
      .where('conversationId = :conversationId', { conversationId })
      .andWhere('receiverId = :userId', { userId })
      .andWhere('status = :status', { status: MessageStatus.SENT })
      .execute();
  }
};

export const deleteMessage = async (
  messageId: string,
  userId: string
): Promise<boolean> => {
  const message = await messageRepository.findOne({ where: { id: messageId } });
  if (!message) return false;

  if (message.senderId === userId) {
    message.isDeletedBySender = true;
  } else if (message.receiverId === userId) {
    message.isDeletedByReceiver = true;
  } else {
    return false;
  }

  await messageRepository.save(message);

  if (message.isDeletedBySender && message.isDeletedByReceiver) {
    await messageRepository.remove(message);
  }

  return true;
};

export const recallMessage = async (
  messageId: string,
  userId: string
): Promise<boolean> => {
  const message = await messageRepository.findOne({ where: { id: messageId } });
  if (!message) return false;

  if (message.senderId !== userId) return false;

  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  if (message.createdAt < fiveMinutesAgo) {
    throw new Error('只能撤回5分钟内的消息');
  }

  message.status = MessageStatus.RECALLED;
  message.content = '[消息已撤回]';
  message.metadata = {};

  await messageRepository.save(message);
  return true;
};

export const deleteConversation = async (
  conversationId: string,
  userId: string
): Promise<boolean> => {
  const conversation = await conversationRepository.findOne({
    where: { id: conversationId },
  });

  if (!conversation) return false;

  if (conversation.user1Id === userId) {
    conversation.isDeletedByUser1 = true;
    conversation.unreadCountUser1 = 0;
  } else if (conversation.user2Id === userId) {
    conversation.isDeletedByUser2 = true;
    conversation.unreadCountUser2 = 0;
  } else {
    return false;
  }

  if (conversation.isDeletedByUser1 && conversation.isDeletedByUser2) {
    await conversationRepository.remove(conversation);
  } else {
    await conversationRepository.save(conversation);
  }

  return true;
};

export const blockConversation = async (
  conversationId: string,
  userId: string
): Promise<boolean> => {
  const conversation = await conversationRepository.findOne({
    where: { id: conversationId },
  });

  if (!conversation) return false;

  if (conversation.user1Id === userId) {
    conversation.isBlockedByUser1 = true;
  } else if (conversation.user2Id === userId) {
    conversation.isBlockedByUser2 = true;
  } else {
    return false;
  }

  await conversationRepository.save(conversation);
  return true;
};

export const unblockConversation = async (
  conversationId: string,
  userId: string
): Promise<boolean> => {
  const conversation = await conversationRepository.findOne({
    where: { id: conversationId },
  });

  if (!conversation) return false;

  if (conversation.user1Id === userId) {
    conversation.isBlockedByUser1 = false;
  } else if (conversation.user2Id === userId) {
    conversation.isBlockedByUser2 = false;
  } else {
    return false;
  }

  await conversationRepository.save(conversation);
  return true;
};

export const getUnreadCount = async (userId: string): Promise<number> => {
  const conversations = await conversationRepository.find({
    where: [
      { user1Id: userId, isDeletedByUser1: false },
      { user2Id: userId, isDeletedByUser2: false },
    ],
  });

  let total = 0;
  for (const conv of conversations) {
    if (conv.user1Id === userId) {
      total += conv.unreadCountUser1;
    } else {
      total += conv.unreadCountUser2;
    }
  }

  return total;
};
