import type { Request, Response } from 'express';
import { homeConfigModel } from '../models/homeConfig.model';
import { newsModel } from '../models/news.model';
import { eventModel } from '../models/event.model';

export const homeController = {
  async getConfig(req: Request, res: Response): Promise<void> {
    try {
      const configs = homeConfigModel.getEnabled();
      const result: Record<string, unknown> = {};
      
      configs.forEach(config => {
        try {
          result[config.module_name] = JSON.parse(config.config_data);
        } catch {
          result[config.module_name] = config.config_data;
        }
      });
      
      res.json({ code: 0, message: 'success', data: result });
    } catch (error) {
      res.status(500).json({ code: 500, message: '服务器错误', data: null });
    }
  },

  async getHomeData(req: Request, res: Response): Promise<void> {
    try {
      const configs = homeConfigModel.getEnabled();
      const configData: Record<string, unknown> = {};
      
      configs.forEach(config => {
        try {
          configData[config.module_name] = JSON.parse(config.config_data);
        } catch {
          configData[config.module_name] = config.config_data;
        }
      });

      const latestNews = newsModel.getLatest(3);
      const ongoingEvents = eventModel.getOngoing(3);
      
      res.json({
        code: 0,
        message: 'success',
        data: {
          ...configData,
          latestNews,
          ongoingEvents
        }
      });
    } catch (error) {
      res.status(500).json({ code: 500, message: '服务器错误', data: null });
    }
  },

  async getAllConfig(req: Request, res: Response): Promise<void> {
    try {
      const configs = homeConfigModel.getAll();
      res.json({ code: 0, message: 'success', data: configs });
    } catch (error) {
      res.status(500).json({ code: 500, message: '服务器错误', data: null });
    }
  },

  async updateConfig(req: Request, res: Response): Promise<void> {
    try {
      const { module_name, config_data, is_enabled, sort_order } = req.body;
      
      if (!module_name) {
        res.status(400).json({ code: 400, message: '模块名称不能为空', data: null });
        return;
      }

      const existingConfig = homeConfigModel.getByModuleName(module_name);
      
      if (existingConfig) {
        homeConfigModel.updateByModuleName(module_name, { config_data, is_enabled, sort_order });
      } else {
        homeConfigModel.create({
          module_name,
          config_data: config_data || '{}',
          is_enabled: is_enabled ?? 1,
          sort_order: sort_order || 0
        });
      }
      
      res.json({ code: 0, message: '更新成功', data: null });
    } catch (error) {
      res.status(500).json({ code: 500, message: '服务器错误', data: null });
    }
  }
};
