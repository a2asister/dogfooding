import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppData } from '../entities/app-data.entity';
import { CreateAppDataDto, UpdateAppDataDto } from './dto/app-data.dto';

@Injectable()
export class AppDataService {
  constructor(
    @InjectRepository(AppData)
    private appDataRepository: Repository<AppData>,
  ) {}

  async getAllByType(userId: number, appType: string) {
    return this.appDataRepository.find({
      where: { userId, appType: appType as any },
      order: { updatedAt: 'DESC' },
    });
  }

  async getById(userId: number, id: number) {
    const data = await this.appDataRepository.findOne({
      where: { id, userId },
    });

    if (!data) {
      throw new NotFoundException('数据不存在');
    }

    return data;
  }

  async getLatestByType(userId: number, appType: string) {
    return this.appDataRepository.findOne({
      where: { userId, appType: appType as any },
      order: { updatedAt: 'DESC' },
    });
  }

  async create(userId: number, createDto: CreateAppDataDto) {
    const data = this.appDataRepository.create({
      ...createDto,
      userId,
    });

    return this.appDataRepository.save(data);
  }

  async update(userId: number, id: number, updateDto: UpdateAppDataDto) {
    const data = await this.getById(userId, id);

    Object.assign(data, updateDto);
    return this.appDataRepository.save(data);
  }

  async delete(userId: number, id: number) {
    const data = await this.getById(userId, id);
    await this.appDataRepository.delete(data.id);
    return { message: '删除成功' };
  }

  async deleteAllByType(userId: number, appType: string) {
    const result = await this.appDataRepository.delete({
      userId,
      appType: appType as any,
    });
    return { message: '删除成功', count: result.affected };
  }
}
