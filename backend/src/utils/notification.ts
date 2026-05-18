import { AppDataSource } from '../config/database';
import { Notification, NotificationType } from '../entities/Notification';
import { User } from '../entities/User';

const notificationRepository = AppDataSource.getRepository(Notification);
const userRepository = AppDataSource.getRepository(User);

export const createNotification = async (
  type: NotificationType,
  userId: string,
  content: string,
  fromUserId?: string,
  extra?: Record<string, any>
): Promise<Notification | null> => {
  try {
    const user = await userRepository.findOne({ where: { id: userId } });
    if (!user) return null;

    if (user.notificationSettings && user.notificationSettings[type] === false) {
      return null;
    }

    const notification = notificationRepository.create({
      type,
      content,
      extra,
      userId,
      fromUserId,
    });

    await notificationRepository.save(notification);

    return notification;
  } catch (error) {
    console.error('创建通知错误:', error);
    return null;
  }
};

export const createLikeNotification = async (
  noteId: string,
  noteTitle: string,
  userId: string,
  fromUserId: string,
  fromUserName: string
) => {
  return createNotification(
    NotificationType.LIKE,
    userId,
    `${fromUserName} 赞了你的笔记「${noteTitle}」`,
    fromUserId,
    { noteId }
  );
};

export const createCommentNotification = async (
  noteId: string,
  noteTitle: string,
  userId: string,
  fromUserId: string,
  fromUserName: string,
  commentContent: string
) => {
  return createNotification(
    NotificationType.COMMENT,
    userId,
    `${fromUserName} 评论了你的笔记「${noteTitle}」: ${commentContent.substring(0, 50)}`,
    fromUserId,
    { noteId, commentContent }
  );
};

export const createReplyNotification = async (
  noteId: string,
  noteTitle: string,
  userId: string,
  fromUserId: string,
  fromUserName: string,
  replyContent: string
) => {
  return createNotification(
    NotificationType.REPLY,
    userId,
    `${fromUserName} 回复了你的评论: ${replyContent.substring(0, 50)}`,
    fromUserId,
    { noteId, replyContent }
  );
};

export const createFollowNotification = async (
  userId: string,
  fromUserId: string,
  fromUserName: string
) => {
  return createNotification(
    NotificationType.FOLLOW,
    userId,
    `${fromUserName} 关注了你`,
    fromUserId
  );
};

export const createFavoriteNotification = async (
  noteId: string,
  noteTitle: string,
  userId: string,
  fromUserId: string,
  fromUserName: string
) => {
  return createNotification(
    NotificationType.FAVORITE,
    userId,
    `${fromUserName} 收藏了你的笔记「${noteTitle}」`,
    fromUserId,
    { noteId }
  );
};
