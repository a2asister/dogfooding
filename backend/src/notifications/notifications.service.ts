import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Notification, NotificationType, NotificationCategory } from '../entities/notification.entity';

export interface CreateNotificationDto {
  title: string;
  message: string;
  type?: NotificationType;
  category?: NotificationCategory;
  actionData?: {
    actionType: string;
    payload: any;
  };
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
  ) {}

  async create(userId: number, dto: CreateNotificationDto) {
    try {
      const notification = this.notificationsRepository.create({
        ...dto,
        user: { id: userId },
      });
      return await this.notificationsRepository.save(notification);
    } catch (error: any) {
      this.logger.error(`创建通知失败: ${error.message}`);
      throw new BadRequestException('创建通知失败');
    }
  }

  async findAll(userId: number, limit: number = 50, offset: number = 0) {
    try {
      const [notifications, total] = await this.notificationsRepository.findAndCount({
        where: { user: { id: userId } },
        order: { createdAt: 'DESC' },
        take: limit,
        skip: offset,
      });
      return { notifications, total };
    } catch (error: any) {
      this.logger.error(`获取通知列表失败: ${error.message}`);
      throw new BadRequestException('获取通知列表失败');
    }
  }

  async getUnreadCount(userId: number) {
    try {
      return await this.notificationsRepository.count({
        where: { user: { id: userId }, isRead: false },
      });
    } catch (error: any) {
      this.logger.error(`获取未读数量失败: ${error.message}`);
      return 0;
    }
  }

  async markAsRead(userId: number, notificationId: number) {
    try {
      const notification = await this.notificationsRepository.findOne({
        where: { id: notificationId, user: { id: userId } },
      });

      if (!notification) {
        throw new NotFoundException('通知不存在');
      }

      notification.isRead = true;
      notification.readAt = new Date();
      return await this.notificationsRepository.save(notification);
    } catch (error: any) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`标记已读失败: ${error.message}`);
      throw new BadRequestException('标记已读失败');
    }
  }

  async markAllAsRead(userId: number) {
    try {
      const result = await this.notificationsRepository
        .createQueryBuilder()
        .update(Notification)
        .set({ isRead: true, readAt: new Date() })
        .where('userId = :userId AND isRead = :isRead', { userId, isRead: false })
        .execute();

      return { affected: result.affected };
    } catch (error: any) {
      this.logger.error(`标记全部已读失败: ${error.message}`);
      throw new BadRequestException('标记全部已读失败');
    }
  }

  async delete(userId: number, notificationId: number) {
    try {
      const result = await this.notificationsRepository.delete({
        id: notificationId,
        user: { id: userId },
      });

      if (result.affected === 0) {
        throw new NotFoundException('通知不存在');
      }

      return { success: true };
    } catch (error: any) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`删除通知失败: ${error.message}`);
      throw new BadRequestException('删除通知失败');
    }
  }

  async clearAll(userId: number) {
    try {
      const result = await this.notificationsRepository.delete({
        user: { id: userId },
      });
      return { affected: result.affected };
    } catch (error: any) {
      this.logger.error(`清空通知失败: ${error.message}`);
      throw new BadRequestException('清空通知失败');
    }
  }

  async batchDelete(userId: number, notificationIds: number[]) {
    try {
      const result = await this.notificationsRepository.delete({
        id: In(notificationIds),
        user: { id: userId },
      });
      return { affected: result.affected };
    } catch (error: any) {
      this.logger.error(`批量删除通知失败: ${error.message}`);
      throw new BadRequestException('批量删除通知失败');
    }
  }

  async createSystemNotification(userId: number, message: string, type: NotificationType = 'info') {
    return this.create(userId, {
      title: '系统通知',
      message,
      type,
      category: 'system',
    });
  }

  async repairNotifications(userId: number) {
    try {
      await this.notificationsRepository
        .createQueryBuilder()
        .update(Notification)
        .set({ isRead: false })
        .where('userId = :userId AND isRead IS NULL', { userId })
        .execute();

      return { success: true, message: '通知数据修复完成' };
    } catch (error: any) {
      this.logger.error(`修复通知数据失败: ${error.message}`);
      throw new BadRequestException('修复通知数据失败');
    }
  }
}
