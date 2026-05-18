import type { Request, Response } from 'express';
import { complianceModel } from '../models/compliance.model';

export const complianceController = {
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const docs = complianceModel.getAll();
      res.json({ code: 0, message: 'success', data: docs });
    } catch (error) {
      res.status(500).json({ code: 500, message: '服务器错误', data: null });
    }
  },

  async getByType(req: Request, res: Response): Promise<void> {
    try {
      const docType = req.params.type;
      const doc = complianceModel.getByType(docType);
      
      if (!doc) {
        res.status(404).json({ code: 404, message: '文档不存在', data: null });
        return;
      }
      
      res.json({ code: 0, message: 'success', data: doc });
    } catch (error) {
      res.status(500).json({ code: 500, message: '服务器错误', data: null });
    }
  },

  async update(req: Request, res: Response): Promise<void> {
    try {
      const docType = req.params.type;
      const { title, content } = req.body;
      
      const success = complianceModel.update(docType, { title, content });
      
      if (!success) {
        res.status(404).json({ code: 404, message: '文档不存在', data: null });
        return;
      }
      
      res.json({ code: 0, message: '更新成功', data: null });
    } catch (error) {
      res.status(500).json({ code: 500, message: '服务器错误', data: null });
    }
  }
};
