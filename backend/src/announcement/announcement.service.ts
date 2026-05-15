import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThan, IsNull, In } from 'typeorm';
import { Announcement, AnnouncementStatus } from './announcement.entity';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto, BatchUpdateDto } from './dto/update-announcement.dto';

@Injectable()
export class AnnouncementService {
  constructor(
    @InjectRepository(Announcement)
    private announcementRepository: Repository<Announcement>,
  ) {}

  async checkAndUpdateExpired() {
    const now = new Date();
    await this.announcementRepository.update(
      {
        status: AnnouncementStatus.PUBLISHED,
        expireAt: LessThanOrEqual(now),
      },
      { status: AnnouncementStatus.EXPIRED },
    );
  }

  async findAll(userId?: string) {
    await this.checkAndUpdateExpired();
    const announcements = await this.announcementRepository.find({
      where: { status: AnnouncementStatus.PUBLISHED },
      order: {
        isPinned: 'DESC',
        priority: 'DESC',
        publishedAt: 'DESC',
      },
    });
    return announcements.map((a) => ({
      ...a,
      isRead: userId ? a.readByUsers.includes(userId) : false,
    }));
  }

  async findAllAdmin() {
    await this.checkAndUpdateExpired();
    return this.announcementRepository.find({
      order: {
        isPinned: 'DESC',
        priority: 'DESC',
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: number, userId?: string) {
    await this.checkAndUpdateExpired();
    const announcement = await this.announcementRepository.findOne({
      where: { id },
    });
    if (!announcement) {
      throw new NotFoundException('公告不存在');
    }
    if (
      announcement.status === AnnouncementStatus.PUBLISHED &&
      userId &&
      !announcement.readByUsers.includes(userId)
    ) {
      announcement.viewCount++;
      announcement.readByUsers = [...announcement.readByUsers, userId];
      await this.announcementRepository.save(announcement);
    }
    return {
      ...announcement,
      isRead: userId ? announcement.readByUsers.includes(userId) : false,
    };
  }

  async create(createAnnouncementDto: CreateAnnouncementDto) {
    const announcement = this.announcementRepository.create(createAnnouncementDto);
    if (announcement.status === AnnouncementStatus.PUBLISHED) {
      announcement.publishedAt = new Date();
    }
    return this.announcementRepository.save(announcement);
  }

  async update(id: number, updateAnnouncementDto: UpdateAnnouncementDto) {
    const announcement = await this.announcementRepository.findOne({
      where: { id },
    });
    if (!announcement) {
      throw new NotFoundException('公告不存在');
    }
    if (
      updateAnnouncementDto.status === AnnouncementStatus.PUBLISHED &&
      announcement.status !== AnnouncementStatus.PUBLISHED
    ) {
      announcement.publishedAt = new Date();
    }
    Object.assign(announcement, updateAnnouncementDto);
    return this.announcementRepository.save(announcement);
  }

  async batchUpdate(batchUpdateDto: BatchUpdateDto) {
    const updateData: any = {};
    if (batchUpdateDto.status) {
      updateData.status = batchUpdateDto.status;
      if (batchUpdateDto.status === AnnouncementStatus.PUBLISHED) {
        updateData.publishedAt = new Date();
      }
    }
    if (batchUpdateDto.isPinned !== undefined) {
      updateData.isPinned = batchUpdateDto.isPinned;
    }
    await this.announcementRepository.update(
      { id: In(batchUpdateDto.ids) },
      updateData,
    );
    return { success: true, count: batchUpdateDto.ids.length };
  }

  async remove(id: number) {
    const result = await this.announcementRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('公告不存在');
    }
    return { success: true };
  }

  async batchRemove(ids: number[]) {
    await this.announcementRepository.delete({ id: In(ids) });
    return { success: true, count: ids.length };
  }

  async markAsRead(id: number, userId: string) {
    const announcement = await this.announcementRepository.findOne({
      where: { id },
    });
    if (!announcement) {
      throw new NotFoundException('公告不存在');
    }
    if (!announcement.readByUsers.includes(userId)) {
      announcement.readByUsers = [...announcement.readByUsers, userId];
      await this.announcementRepository.save(announcement);
    }
    return { success: true };
  }
}
