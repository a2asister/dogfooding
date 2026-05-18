import type { Request, Response } from 'express';
import { settingModel } from '../models/setting.model';

export const settingController = {
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const settings = settingModel.getAll();
      const result: Record<string, string> = {};
      settings.forEach(setting => {
        result[setting.key] = setting.value;
      });
      res.json({ code: 0, message: 'success', data: result });
    } catch (error) {
      res.status(500).json({ code: 500, message: '服务器错误', data: null });
    }
  },

  async getFullList(req: Request, res: Response): Promise<void> {
    try {
      const settings = settingModel.getAll();
      res.json({ code: 0, message: 'success', data: settings });
    } catch (error) {
      res.status(500).json({ code: 500, message: '服务器错误', data: null });
    }
  },

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { key, value } = req.body;
      
      if (!key) {
        res.status(400).json({ code: 400, message: '配置键不能为空', data: null });
        return;
      }

      const success = settingModel.update(key, value);
      
      if (!success) {
        res.status(404).json({ code: 404, message: '配置不存在', data: null });
        return;
      }
      
      res.json({ code: 0, message: '更新成功', data: null });
    } catch (error) {
      res.status(500).json({ code: 500, message: '服务器错误', data: null });
    }
  },

  async batchUpdate(req: Request, res: Response): Promise<void> {
    try {
      const settings: Record<string, string> = req.body;
      
      for (const [key, value] of Object.entries(settings)) {
        settingModel.update(key, value);
      }
      
      res.json({ code: 0, message: '批量更新成功', data: null });
    } catch (error) {
      res.status(500).json({ code: 500, message: '服务器错误', data: null });
    }
  }
};
