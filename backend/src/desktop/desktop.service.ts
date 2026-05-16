import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DesktopConfig, ThemeConfig, DisplayConfig, DateTimeConfig, PersonalizationConfig } from '../entities/desktop-config.entity';

@Injectable()
export class DesktopService {
  private readonly logger = new Logger(DesktopService.name);

  constructor(
    @InjectRepository(DesktopConfig)
    private desktopConfigRepository: Repository<DesktopConfig>,
  ) {}

  private getDefaultTheme(): ThemeConfig {
    return {
      mode: 'dark',
      primaryColor: '#0078d7',
      glassmorphism: {
        enabled: true,
        blur: 20,
        opacity: 0.85,
        saturation: 1.2,
      },
      transparency: 0.85,
    };
  }

  private getDefaultDisplay(): DisplayConfig {
    return {
      scale: 1,
      fontFamily: 'Segoe UI',
      animationsEnabled: true,
      iconSize: 'medium',
    };
  }

  private getDefaultDateTime(): DateTimeConfig {
    return {
      timeFormat: '24h',
      dateFormat: 'YYYY-MM-DD',
      showSeconds: false,
      showDate: true,
    };
  }

  private getDefaultPersonalization(): PersonalizationConfig {
    return {
      accentColor: '#0078d7',
      soundEffects: true,
      notificationsEnabled: true,
    };
  }

  async getDesktopConfig(userId: number) {
    try {
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
            { id: '4', name: '任务管理器', icon: 'task-manager', x: 20, y: 320, type: 'app' },
            { id: '5', name: '应用商店', icon: 'app-store', x: 20, y: 420, type: 'app' },
          ],
          taskbarConfig: { showTime: true, position: 'bottom', showSearch: true, showNotifications: true, autoHide: false },
          startMenu: [
            { id: '1', name: '文件资源管理器', icon: 'explorer' },
            { id: '2', name: '设置', icon: 'settings' },
            { id: '4', name: '任务管理器', icon: 'task-manager' },
            { id: '5', name: '应用商店', icon: 'app-store' },
          ],
          theme: this.getDefaultTheme(),
          display: this.getDefaultDisplay(),
          dateTime: this.getDefaultDateTime(),
          personalization: this.getDefaultPersonalization(),
        });
        config = await this.desktopConfigRepository.save(config);
      }

      return this.validateAndFixConfig(config);
    } catch (error: any) {
      this.logger.error(`获取桌面配置失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  private validateAndFixConfig(config: DesktopConfig): DesktopConfig {
    let needsFix = false;
    const fixedConfig = { ...config };

    if (!fixedConfig.theme || typeof fixedConfig.theme !== 'object') {
      fixedConfig.theme = this.getDefaultTheme();
      needsFix = true;
    } else {
      if (!['light', 'dark', 'auto'].includes(fixedConfig.theme.mode)) {
        fixedConfig.theme.mode = 'dark';
        needsFix = true;
      }
      if (!fixedConfig.theme.glassmorphism || typeof fixedConfig.theme.glassmorphism !== 'object') {
        fixedConfig.theme.glassmorphism = this.getDefaultTheme().glassmorphism;
        needsFix = true;
      }
    }

    if (!fixedConfig.display || typeof fixedConfig.display !== 'object') {
      fixedConfig.display = this.getDefaultDisplay();
      needsFix = true;
    }

    if (!fixedConfig.dateTime || typeof fixedConfig.dateTime !== 'object') {
      fixedConfig.dateTime = this.getDefaultDateTime();
      needsFix = true;
    }

    if (!fixedConfig.personalization || typeof fixedConfig.personalization !== 'object') {
      fixedConfig.personalization = this.getDefaultPersonalization();
      needsFix = true;
    }

    if (!fixedConfig.taskbarConfig || typeof fixedConfig.taskbarConfig !== 'object') {
      fixedConfig.taskbarConfig = { showTime: true, position: 'bottom', showSearch: true, showNotifications: true, autoHide: false };
      needsFix = true;
    }

    if (!fixedConfig.layout || !Array.isArray(fixedConfig.layout) || fixedConfig.layout.length < 3) {
      fixedConfig.layout = [
        { id: '1', name: '此电脑', icon: 'computer', x: 20, y: 20, type: 'app' },
        { id: '2', name: '回收站', icon: 'recycle', x: 20, y: 120, type: 'app' },
        { id: '3', name: '文档', icon: 'folder', x: 20, y: 220, type: 'folder' },
        { id: '4', name: '任务管理器', icon: 'task-manager', x: 20, y: 320, type: 'app' },
        { id: '5', name: '应用商店', icon: 'app-store', x: 20, y: 420, type: 'app' },
      ];
      needsFix = true;
    } else {
      const hasTaskManager = fixedConfig.layout.some(item => item.id === '4');
      const hasAppStore = fixedConfig.layout.some(item => item.id === '5');
      
      if (!hasTaskManager) {
        fixedConfig.layout.push({ id: '4', name: '任务管理器', icon: 'task-manager', x: 20, y: 320, type: 'app' });
        needsFix = true;
      }
      if (!hasAppStore) {
        fixedConfig.layout.push({ id: '5', name: '应用商店', icon: 'app-store', x: 20, y: 420, type: 'app' });
        needsFix = true;
      }
    }

    if (!fixedConfig.startMenu || !Array.isArray(fixedConfig.startMenu) || fixedConfig.startMenu.length < 2) {
      fixedConfig.startMenu = [
        { id: '1', name: '文件资源管理器', icon: 'explorer' },
        { id: '2', name: '设置', icon: 'settings' },
        { id: '4', name: '任务管理器', icon: 'task-manager' },
        { id: '5', name: '应用商店', icon: 'app-store' },
      ];
      needsFix = true;
    } else {
      const hasTaskManager = fixedConfig.startMenu.some(item => item.id === '4');
      const hasAppStore = fixedConfig.startMenu.some(item => item.id === '5');
      
      if (!hasTaskManager) {
        fixedConfig.startMenu.push({ id: '4', name: '任务管理器', icon: 'task-manager' });
        needsFix = true;
      }
      if (!hasAppStore) {
        fixedConfig.startMenu.push({ id: '5', name: '应用商店', icon: 'app-store' });
        needsFix = true;
      }
    }

    if (needsFix) {
      this.logger.log('检测到配置异常，已自动修复');
      this.desktopConfigRepository.save(fixedConfig).catch(err => {
        this.logger.error('保存修复后的配置失败:', err);
      });
    }

    return fixedConfig;
  }

  private ensureDefaults(config: DesktopConfig): DesktopConfig {
    let needsSave = false;
    
    if (!config.theme) {
      config.theme = this.getDefaultTheme();
      needsSave = true;
    }
    if (!config.display) {
      config.display = this.getDefaultDisplay();
      needsSave = true;
    }
    if (!config.dateTime) {
      config.dateTime = this.getDefaultDateTime();
      needsSave = true;
    }
    if (!config.personalization) {
      config.personalization = this.getDefaultPersonalization();
      needsSave = true;
    }
    if (!config.taskbarConfig) {
      config.taskbarConfig = { showTime: true, position: 'bottom', showSearch: true, showNotifications: true, autoHide: false };
      needsSave = true;
    }
    if (!config.startMenu || !Array.isArray(config.startMenu) || config.startMenu.length === 0) {
      config.startMenu = [
        { id: '1', name: '文件资源管理器', icon: 'explorer' },
        { id: '2', name: '设置', icon: 'settings' },
        { id: '4', name: '任务管理器', icon: 'task-manager' },
        { id: '5', name: '应用商店', icon: 'app-store' },
      ];
      needsSave = true;
    }
    
    return config;
  }

  async saveLayout(userId: number, layout: Array<{ id: string; name: string; icon: string; x: number; y: number; type: 'folder' | 'file' | 'app' }>) {
    try {
      const config = await this.desktopConfigRepository.findOne({
        where: { user: { id: userId } },
      });

      if (config) {
        config.layout = layout;
        config.updatedAt = new Date();
        this.ensureDefaults(config);
        return this.desktopConfigRepository.save(config);
      }

      return null;
    } catch (error: any) {
      this.logger.error(`保存布局失败: ${error.message}`);
      throw new BadRequestException('保存布局失败');
    }
  }

  async saveTheme(userId: number, theme: ThemeConfig) {
    try {
      const config = await this.desktopConfigRepository.findOne({
        where: { user: { id: userId } },
      });

      if (config) {
        config.theme = theme;
        config.updatedAt = new Date();
        this.ensureDefaults(config);
        return this.desktopConfigRepository.save(config);
      }

      return null;
    } catch (error: any) {
      this.logger.error(`保存主题配置失败: ${error.message}`);
      throw new BadRequestException('保存主题配置失败');
    }
  }

  async saveWallpaper(userId: number, wallpaper: string) {
    try {
      const config = await this.desktopConfigRepository.findOne({
        where: { user: { id: userId } },
      });

      if (config) {
        config.wallpaper = wallpaper;
        config.updatedAt = new Date();
        this.ensureDefaults(config);
        return this.desktopConfigRepository.save(config);
      }

      return null;
    } catch (error: any) {
      this.logger.error(`保存壁纸失败: ${error.message}`);
      throw new BadRequestException('保存壁纸失败');
    }
  }

  async saveTaskbarConfig(userId: number, taskbarConfig: any) {
    try {
      const config = await this.desktopConfigRepository.findOne({
        where: { user: { id: userId } },
      });

      if (config) {
        config.taskbarConfig = taskbarConfig;
        config.updatedAt = new Date();
        this.ensureDefaults(config);
        return this.desktopConfigRepository.save(config);
      }

      return null;
    } catch (error: any) {
      this.logger.error(`保存任务栏配置失败: ${error.message}`);
      throw new BadRequestException('保存任务栏配置失败');
    }
  }

  async saveDisplayConfig(userId: number, display: DisplayConfig) {
    try {
      const config = await this.desktopConfigRepository.findOne({
        where: { user: { id: userId } },
      });

      if (config) {
        config.display = display;
        config.updatedAt = new Date();
        this.ensureDefaults(config);
        return this.desktopConfigRepository.save(config);
      }

      return null;
    } catch (error: any) {
      this.logger.error(`保存显示配置失败: ${error.message}`);
      throw new BadRequestException('保存显示配置失败');
    }
  }

  async saveDateTimeConfig(userId: number, dateTime: DateTimeConfig) {
    try {
      const config = await this.desktopConfigRepository.findOne({
        where: { user: { id: userId } },
      });

      if (config) {
        config.dateTime = dateTime;
        config.updatedAt = new Date();
        this.ensureDefaults(config);
        return this.desktopConfigRepository.save(config);
      }

      return null;
    } catch (error: any) {
      this.logger.error(`保存时间日期配置失败: ${error.message}`);
      throw new BadRequestException('保存时间日期配置失败');
    }
  }

  async savePersonalizationConfig(userId: number, personalization: PersonalizationConfig) {
    try {
      const config = await this.desktopConfigRepository.findOne({
        where: { user: { id: userId } },
      });

      if (config) {
        config.personalization = personalization;
        config.updatedAt = new Date();
        this.ensureDefaults(config);
        return this.desktopConfigRepository.save(config);
      }

      return null;
    } catch (error: any) {
      this.logger.error(`保存个性化配置失败: ${error.message}`);
      throw new BadRequestException('保存个性化配置失败');
    }
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

  async repairConfig(userId: number) {
    try {
      let config = await this.desktopConfigRepository.findOne({
        where: { user: { id: userId } },
      });

      if (!config) {
        return this.getDesktopConfig(userId);
      }

      const fixedConfig = this.validateAndFixConfig(config);
      return fixedConfig;
    } catch (error: any) {
      this.logger.error(`修复配置失败: ${error.message}`);
      throw new BadRequestException('修复配置失败');
    }
  }
}