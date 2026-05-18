import type { Request, Response } from 'express';
import { ticketModel } from '../models/ticket.model';

export const ticketController = {
  async create(req: Request, res: Response): Promise<void> {
    try {
      const { user_name, contact, title, content } = req.body;
      
      if (!contact || !title || !content) {
        res.status(400).json({ code: 400, message: '联系方式、标题和内容不能为空', data: null });
        return;
      }

      const id = ticketModel.create({
        user_name: user_name || null,
        contact,
        title,
        content
      });
      
      res.json({ code: 0, message: '提交成功，我们会尽快处理', data: { id } });
    } catch (error) {
      res.status(500).json({ code: 500, message: '服务器错误', data: null });
    }
  },

  async getList(req: Request, res: Response): Promise<void> {
    try {
      const page = Number(req.query.page) || 1;
      const pageSize = Number(req.query.pageSize) || 10;
      const status = req.query.status as string | undefined;

      const result = ticketModel.getList({ page, pageSize, status });
      
      res.json({
        code: 0,
        message: 'success',
        data: {
          list: result.list,
          total: result.total,
          page,
          pageSize
        }
      });
    } catch (error) {
      res.status(500).json({ code: 500, message: '服务器错误', data: null });
    }
  },

  async getDetail(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      const ticket = ticketModel.getById(id);
      
      if (!ticket) {
        res.status(404).json({ code: 404, message: '工单不存在', data: null });
        return;
      }
      
      res.json({ code: 0, message: 'success', data: ticket });
    } catch (error) {
      res.status(500).json({ code: 500, message: '服务器错误', data: null });
    }
  },

  async reply(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      const { reply } = req.body;
      
      if (!reply) {
        res.status(400).json({ code: 400, message: '回复内容不能为空', data: null });
        return;
      }

      const success = ticketModel.reply(id, reply);
      
      if (!success) {
        res.status(404).json({ code: 404, message: '工单不存在', data: null });
        return;
      }
      
      res.json({ code: 0, message: '回复成功', data: null });
    } catch (error) {
      res.status(500).json({ code: 500, message: '服务器错误', data: null });
    }
  },

  async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      const { status } = req.body;
      
      const success = ticketModel.updateStatus(id, status);
      
      if (!success) {
        res.status(404).json({ code: 404, message: '工单不存在', data: null });
        return;
      }
      
      res.json({ code: 0, message: '状态更新成功', data: null });
    } catch (error) {
      res.status(500).json({ code: 500, message: '服务器错误', data: null });
    }
  }
};
