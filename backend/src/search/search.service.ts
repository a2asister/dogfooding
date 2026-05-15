import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Raw } from 'typeorm';
import { FileItem } from '../entities/file.entity';

export type SearchCategory = 'all' | 'files' | 'folders' | 'apps' | 'settings';

export interface SearchResult {
  id: string | number;
  name: string;
  type: string;
  category: SearchCategory;
  icon?: string;
  description?: string;
  path?: string;
  relevance: number;
}

interface SystemApp {
  id: string;
  name: string;
  icon: string;
  description: string;
}

interface SystemSetting {
  id: string;
  name: string;
  icon: string;
  description: string;
  path: string;
}

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  private readonly systemApps: SystemApp[] = [
    { id: 'explorer', name: '文件资源管理器', icon: 'folder', description: '浏览和管理文件' },
    { id: 'settings', name: '设置', icon: 'settings', description: '系统设置中心' },
    { id: 'notepad', name: '记事本', icon: 'file', description: '文本编辑器' },
    { id: 'calculator', name: '计算器', icon: 'calculator', description: '科学计算器' },
    { id: 'browser', name: '浏览器', icon: 'browser', description: '网页浏览器' },
    { id: 'terminal', name: '终端', icon: 'terminal', description: '命令行终端' },
  ];

  private readonly systemSettings: SystemSetting[] = [
    { id: 'theme', name: '主题设置', icon: 'palette', description: '更改系统主题和外观', path: '/settings/theme' },
    { id: 'wallpaper', name: '壁纸设置', icon: 'image', description: '更换桌面壁纸', path: '/settings/wallpaper' },
    { id: 'taskbar', name: '任务栏设置', icon: 'menu', description: '自定义任务栏', path: '/settings/taskbar' },
    { id: 'datetime', name: '日期时间', icon: 'clock', description: '设置日期和时间', path: '/settings/datetime' },
    { id: 'display', name: '显示设置', icon: 'monitor', description: '调整显示参数', path: '/settings/display' },
    { id: 'notifications', name: '通知设置', icon: 'bell', description: '管理通知偏好', path: '/settings/notifications' },
  ];

  constructor(
    @InjectRepository(FileItem)
    private fileRepository: Repository<FileItem>,
  ) {}

  async search(
    userId: number,
    query: string,
    category: SearchCategory = 'all',
    limit: number = 20,
    exactMatch: boolean = false,
  ): Promise<{ results: SearchResult[]; total: number }> {
    try {
      if (!query || query.trim().length === 0) {
        return { results: [], total: 0 };
      }

      const searchTerm = query.trim().toLowerCase();
      const results: SearchResult[] = [];

      if (category === 'all' || category === 'files') {
        const fileResults = await this.searchFiles(userId, searchTerm, exactMatch);
        results.push(...fileResults);
      }

      if (category === 'all' || category === 'folders') {
        const folderResults = await this.searchFolders(userId, searchTerm, exactMatch);
        results.push(...folderResults);
      }

      if (category === 'all' || category === 'apps') {
        const appResults = this.searchApps(searchTerm, exactMatch);
        results.push(...appResults);
      }

      if (category === 'all' || category === 'settings') {
        const settingResults = this.searchSettings(searchTerm, exactMatch);
        results.push(...settingResults);
      }

      results.sort((a, b) => b.relevance - a.relevance);
      const limitedResults = results.slice(0, limit);

      return {
        results: limitedResults,
        total: results.length,
      };
    } catch (error: any) {
      this.logger.error(`搜索失败: ${error.message}`);
      throw new BadRequestException('搜索失败');
    }
  }

  private async searchFiles(userId: number, searchTerm: string, exactMatch: boolean): Promise<SearchResult[]> {
    try {
      const whereCondition = exactMatch
        ? { name: searchTerm, type: 'file' as const, userId, isDeleted: false }
        : {
            name: Raw((alias) => `LOWER(${alias}) LIKE :term`, { term: `%${searchTerm}%` }),
            type: 'file' as const,
            userId,
            isDeleted: false,
          };

      const files = await this.fileRepository.find({
        where: whereCondition,
        take: 10,
      });

      return files.map((file) => ({
        id: file.id,
        name: file.name,
        type: 'file',
        category: 'files' as SearchCategory,
        icon: 'file',
        description: this.formatFileSize(file.size),
        relevance: this.calculateRelevance(file.name, searchTerm, exactMatch),
      }));
    } catch (error: any) {
      this.logger.error(`搜索文件失败: ${error.message}`);
      return [];
    }
  }

  private async searchFolders(userId: number, searchTerm: string, exactMatch: boolean): Promise<SearchResult[]> {
    try {
      const whereCondition = exactMatch
        ? { name: searchTerm, type: 'folder' as const, userId, isDeleted: false }
        : {
            name: Raw((alias) => `LOWER(${alias}) LIKE :term`, { term: `%${searchTerm}%` }),
            type: 'folder' as const,
            userId,
            isDeleted: false,
          };

      const folders = await this.fileRepository.find({
        where: whereCondition,
        take: 10,
      });

      return folders.map((folder) => ({
        id: folder.id,
        name: folder.name,
        type: 'folder',
        category: 'folders' as SearchCategory,
        icon: 'folder',
        description: '文件夹',
        relevance: this.calculateRelevance(folder.name, searchTerm, exactMatch),
      }));
    } catch (error: any) {
      this.logger.error(`搜索文件夹失败: ${error.message}`);
      return [];
    }
  }

  private searchApps(searchTerm: string, exactMatch: boolean): SearchResult[] {
    return this.systemApps
      .filter((app) => {
        const nameMatch = exactMatch
          ? app.name.toLowerCase() === searchTerm
          : app.name.toLowerCase().includes(searchTerm);
        const descMatch = !exactMatch && app.description.toLowerCase().includes(searchTerm);
        return nameMatch || descMatch;
      })
      .map((app) => ({
        id: app.id,
        name: app.name,
        type: 'app',
        category: 'apps' as SearchCategory,
        icon: app.icon,
        description: app.description,
        relevance: this.calculateRelevance(app.name, searchTerm, exactMatch),
      }));
  }

  private searchSettings(searchTerm: string, exactMatch: boolean): SearchResult[] {
    return this.systemSettings
      .filter((setting) => {
        const nameMatch = exactMatch
          ? setting.name.toLowerCase() === searchTerm
          : setting.name.toLowerCase().includes(searchTerm);
        const descMatch = !exactMatch && setting.description.toLowerCase().includes(searchTerm);
        return nameMatch || descMatch;
      })
      .map((setting) => ({
        id: setting.id,
        name: setting.name,
        type: 'setting',
        category: 'settings' as SearchCategory,
        icon: setting.icon,
        description: setting.description,
        path: setting.path,
        relevance: this.calculateRelevance(setting.name, searchTerm, exactMatch) * 0.9,
      }));
  }

  private calculateRelevance(name: string, searchTerm: string, exactMatch: boolean): number {
    if (exactMatch) {
      return 100;
    }

    const nameLower = name.toLowerCase();
    const termLower = searchTerm.toLowerCase();

    if (nameLower === termLower) {
      return 100;
    }
    if (nameLower.startsWith(termLower)) {
      return 90;
    }
    if (nameLower.includes(termLower)) {
      return 70;
    }
    return 50;
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  async getRecentSearches(userId: number): Promise<string[]> {
    try {
      const result = await this.fileRepository
        .createQueryBuilder('file')
        .select('file.name')
        .where('file.userId = :userId', { userId })
        .andWhere('file.isDeleted = :isDeleted', { isDeleted: false })
        .orderBy('file.updatedAt', 'DESC')
        .limit(5)
        .getMany();

      return result.map((f) => f.name).slice(0, 5);
    } catch (error: any) {
      this.logger.error(`获取最近搜索失败: ${error.message}`);
      return [];
    }
  }

  async repairSearchIndex(userId: number) {
    try {
      await this.fileRepository
        .createQueryBuilder()
        .update(FileItem)
        .set({ isDeleted: false })
        .where('userId = :userId AND isDeleted IS NULL', { userId })
        .execute();

      return { success: true, message: '搜索索引修复完成' };
    } catch (error: any) {
      this.logger.error(`修复搜索索引失败: ${error.message}`);
      throw new BadRequestException('修复搜索索引失败');
    }
  }
}
