import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DesktopConfig } from '../entities/desktop-config.entity';

@Injectable()
export class DesktopService {
  constructor(
    @InjectRepository(DesktopConfig)
    private desktopConfigRepository: Repository<DesktopConfig>,
  ) {}

  async getDesktopConfig(userId: number) {
    let config = await this.desktopConfigRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!config) {
      config = this.desktopConfigRepository.create({
        user: { id: userId },
        wallpaper: 'https://images.wallpapersden.com/image/download/windows-11-4k-esthetics_bWpmZ22UmZqaraWkpJRobWllrWdpZWU.jpg',
        layout: [
          { id: '1', name: '此电脑', icon: 'computer', x: 20, y: 20, type: 'app' },
          { id: '2', name: '回收站', icon: 'recycle', x: 20, y: 120, type: 'app' },
          { id: '3', name: '文档', icon: 'folder', x: 20, y: 220, type: 'folder' },
        ],
        taskbarConfig: { showTime: true, position: 'bottom' },
        startMenu: [
          { id: '1', name: '文件资源管理器', icon: 'explorer' },
          { id: '2', name: '设置', icon: 'settings' },
        ],
      });
      config = await this.desktopConfigRepository.save(config);
    }

    return config;
  }

  async saveLayout(userId: number, layout: Array<{ id: string; name: string; icon: string; x: number; y: number; type: 'folder' | 'file' | 'app' }>) {
    const config = await this.desktopConfigRepository.findOne({
      where: { user: { id: userId } },
    });

    if (config) {
      config.layout = layout;
      return this.desktopConfigRepository.save(config);
    }

    return null;
  }

  getDefaultIcons() {
    return [
      { id: 'computer', name: '此电脑', icon: 'computer' },
      { id: 'recycle', name: '回收站', icon: 'recycle' },
      { id: 'folder', name: '文件夹', icon: 'folder' },
      { id: 'file', name: '文本文档', icon: 'file' },
      { id: 'explorer', name: '文件资源管理器', icon: 'explorer' },
      { id: 'settings', name: '设置', icon: 'settings' },
    ];
  }
}