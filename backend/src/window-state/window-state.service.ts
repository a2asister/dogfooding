import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WindowState } from '../entities/window-state.entity';
import { CreateWindowStateDto, UpdateWindowStateDto } from './dto/window-state.dto';

@Injectable()
export class WindowStateService {
  constructor(
    @InjectRepository(WindowState)
    private windowStateRepository: Repository<WindowState>,
  ) {}

  async getAllWindows(userId: number) {
    return this.windowStateRepository.find({
      where: { userId },
      order: { zIndex: 'ASC', createdAt: 'ASC' },
    });
  }

  async getWindowByWindowId(userId: number, windowId: string) {
    const window = await this.windowStateRepository.findOne({
      where: { userId, windowId },
    });

    if (!window) {
      throw new NotFoundException('窗口不存在');
    }

    return window;
  }

  async createWindow(userId: number, createDto: CreateWindowStateDto) {
    const existing = await this.windowStateRepository.findOne({
      where: { userId, windowId: createDto.windowId },
    });

    if (existing) {
      return existing;
    }

    const maxZIndex = await this.windowStateRepository
      .createQueryBuilder('w')
      .select('MAX(w.zIndex)', 'max')
      .where('w.userId = :userId', { userId })
      .getRawOne();

    const window = this.windowStateRepository.create({
      ...createDto,
      userId,
      x: createDto.x ?? 100,
      y: createDto.y ?? 100,
      width: createDto.width ?? 800,
      height: createDto.height ?? 600,
      isMinimized: createDto.isMinimized ?? false,
      isMaximized: createDto.isMaximized ?? false,
      zIndex: (maxZIndex?.max ?? 0) + 1,
    });

    return this.windowStateRepository.save(window);
  }

  async updateWindow(userId: number, windowId: string, updateDto: UpdateWindowStateDto) {
    const window = await this.getWindowByWindowId(userId, windowId);

    Object.assign(window, updateDto);
    return this.windowStateRepository.save(window);
  }

  async closeWindow(userId: number, windowId: string) {
    const window = await this.getWindowByWindowId(userId, windowId);
    await this.windowStateRepository.delete(window.id);
    return { message: '窗口已关闭' };
  }

  async closeAllWindows(userId: number) {
    const result = await this.windowStateRepository.delete({ userId });
    return { message: '所有窗口已关闭', count: result.affected };
  }

  async bringToFront(userId: number, windowId: string) {
    const window = await this.getWindowByWindowId(userId, windowId);
    
    const maxZIndex = await this.windowStateRepository
      .createQueryBuilder('w')
      .select('MAX(w.zIndex)', 'max')
      .where('w.userId = :userId', { userId })
      .getRawOne();

    window.zIndex = (maxZIndex?.max ?? 0) + 1;
    return this.windowStateRepository.save(window);
  }

  async minimizeWindow(userId: number, windowId: string) {
    const window = await this.getWindowByWindowId(userId, windowId);
    window.isMinimized = true;
    return this.windowStateRepository.save(window);
  }

  async maximizeWindow(userId: number, windowId: string) {
    const window = await this.getWindowByWindowId(userId, windowId);
    window.isMaximized = !window.isMaximized;
    return this.windowStateRepository.save(window);
  }
}
