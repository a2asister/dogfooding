import type { Request, Response } from 'express';
import { eventModel } from '../models/event.model';

export const eventController = {
  async getList(req: Request, res: Response): Promise<void> {
    try {
      const page = Number(req.query.page) || 1;
      const pageSize = Number(req.query.pageSize) || 10;
      const status = req.query.status as string | undefined;

      const result = eventModel.getList({ page, pageSize, status });
      
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

  async getAdminList(req: Request, res: Response): Promise<void> {
    try {
      const page = Number(req.query.page) || 1;
      const pageSize = Number(req.query.pageSize) || 10;

      const result = eventModel.getAdminList({ page, pageSize });
      
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
      const event = eventModel.getById(id);
      
      if (!event) {
        res.status(404).json({ code: 404, message: '活动不存在', data: null });
        return;
      }
      
      res.json({ code: 0, message: 'success', data: event });
    } catch (error) {
      res.status(500).json({ code: 500, message: '服务器错误', data: null });
    }
  },

  async getOngoing(req: Request, res: Response): Promise<void> {
    try {
      const limit = Number(req.query.limit) || 3;
      const list = eventModel.getOngoing(limit);
      
      res.json({ code: 0, message: 'success', data: list });
    } catch (error) {
      res.status(500).json({ code: 500, message: '服务器错误', data: null });
    }
  },

  async create(req: Request, res: Response): Promise<void> {
    try {
      const { title, description, cover_image, start_time, end_time, status, is_published, link_url, sort_order, is_hot, scheduled_publish_time, scheduled_offline_time } = req.body;
      
      if (!title) {
        res.status(400).json({ code: 400, message: '标题不能为空', data: null });
        return;
      }

      let finalIsPublished = is_published || 0;
      
      if (scheduled_publish_time) {
        const now = new Date();
        const scheduleTime = new Date(scheduled_publish_time);
        if (scheduleTime > now) {
          finalIsPublished = 0;
        } else {
          finalIsPublished = is_published || 1;
        }
      }

      const id = eventModel.create({
        title,
        description: description || null,
        cover_image: cover_image || null,
        start_time: start_time || null,
        end_time: end_time || null,
        status: status || 'upcoming',
        is_published: finalIsPublished,
        is_hot: is_hot || 0,
        link_url: link_url || null,
        sort_order: sort_order || 0,
        scheduled_publish_time: scheduled_publish_time || null,
        scheduled_offline_time: scheduled_offline_time || null
      });
      
      res.json({ code: 0, message: finalIsPublished ? '创建成功' : '已创建，将在指定时间发布', data: { id } });
    } catch (error) {
      res.status(500).json({ code: 500, message: '服务器错误', data: null });
    }
  },

  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      const success = eventModel.update(id, req.body);
      
      if (!success) {
        res.status(404).json({ code: 404, message: '活动不存在', data: null });
        return;
      }
      
      res.json({ code: 0, message: '更新成功', data: null });
    } catch (error) {
      res.status(500).json({ code: 500, message: '服务器错误', data: null });
    }
  },

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      const success = eventModel.delete(id);
      
      if (!success) {
        res.status(404).json({ code: 404, message: '活动不存在', data: null });
        return;
      }
      
      res.json({ code: 0, message: '删除成功', data: null });
    } catch (error) {
      res.status(500).json({ code: 500, message: '服务器错误', data: null });
    }
  }
};
