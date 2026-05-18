import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Notification, NotificationType } from '../entities/Notification';
import { In } from 'typeorm';

const notificationRepository = AppDataSource.getRepository(Notification);

export const getNotificationList = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const { type, page = 1, pageSize = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(pageSize);

    let whereCondition: any = { userId: req.user.id };
    if (type) {
      whereCondition.type = type;
    }

    const [notifications, total] = await notificationRepository.findAndCount({
      where: whereCondition,
      relations: ['fromUser'],
      order: { createdAt: 'DESC' },
      skip,
      take: Number(pageSize),
    });

    const unreadCount = await notificationRepository.count({
      where: { userId: req.user.id, isRead: false },
    });

    res.json({
      list: notifications.map(n => ({
        id: n.id,
        type: n.type,
        content: n.content,
        extra: n.extra,
        isRead: n.isRead,
        fromUser: n.fromUser ? {
          id: n.fromUser.id,
          nickname: n.fromUser.nickname,
          avatar: n.fromUser.avatar,
        } : null,
        createdAt: n.createdAt,
      })),
      total,
      unreadCount,
      page: Number(page),
      pageSize: Number(pageSize),
    });
  } catch (error) {
    console.error('获取通知列表错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const markAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const { id } = req.params;

    const notification = await notificationRepository.findOne({
      where: { id, userId: req.user.id },
    });

    if (!notification) {
      res.status(404).json({ message: '通知不存在' });
      return;
    }

    notification.isRead = true;
    await notificationRepository.save(notification);

    res.json({ message: '已标记为已读' });
  } catch (error) {
    console.error('标记已读错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const markAllAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    await notificationRepository.update(
      { userId: req.user.id, isRead: false },
      { isRead: true }
    );

    res.json({ message: '全部已标记为已读' });
  } catch (error) {
    console.error('标记全部已读错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const getUnreadCount = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const counts = await notificationRepository
      .createQueryBuilder('notification')
      .select('notification.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .where('notification.userId = :userId', { userId: req.user.id })
      .andWhere('notification.isRead = :isRead', { isRead: false })
      .groupBy('notification.type')
      .getRawMany();

    const total = counts.reduce((sum, c) => sum + Number(c.count), 0);

    const typeCounts: Record<string, number> = {};
    Object.values(NotificationType).forEach(type => {
      const found = counts.find(c => c.type === type);
      typeCounts[type] = found ? Number(found.count) : 0;
    });

    res.json({
      total,
      ...typeCounts,
    });
  } catch (error) {
    console.error('获取未读数量错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const deleteNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const { id } = req.params;

    const notification = await notificationRepository.findOne({
      where: { id, userId: req.user.id },
    });

    if (!notification) {
      res.status(404).json({ message: '通知不存在' });
      return;
    }

    await notificationRepository.remove(notification);

    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除通知错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const clearAllNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    await notificationRepository.delete({ userId: req.user.id });

    res.json({ message: '已清空所有通知' });
  } catch (error) {
    console.error('清空通知错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};
