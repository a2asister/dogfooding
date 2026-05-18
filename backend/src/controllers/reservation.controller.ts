import type { Request, Response } from 'express';
import { reservationModel } from '../models/reservation.model';

export const reservationController = {
  async create(req: Request, res: Response): Promise<void> {
    try {
      const { phone, platform } = req.body;
      
      if (!phone) {
        res.status(400).json({ code: 400, message: '手机号不能为空', data: null });
        return;
      }

      if (reservationModel.hasPhone(phone)) {
        res.status(400).json({ code: 400, message: '该手机号已预约', data: null });
        return;
      }

      const id = reservationModel.create({ phone, platform: platform || null });
      
      res.json({ code: 0, message: '预约成功', data: { id } });
    } catch (error) {
      res.status(500).json({ code: 500, message: '服务器错误', data: null });
    }
  },

  async getList(req: Request, res: Response): Promise<void> {
    try {
      const page = Number(req.query.page) || 1;
      const pageSize = Number(req.query.pageSize) || 10;

      const result = reservationModel.getList({ page, pageSize });
      
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

  async getStats(req: Request, res: Response): Promise<void> {
    try {
      const total = reservationModel.getTotalCount();
      res.json({ code: 0, message: 'success', data: { total } });
    } catch (error) {
      res.status(500).json({ code: 500, message: '服务器错误', data: null });
    }
  }
};
