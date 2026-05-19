import type { Request, Response } from 'express';
import { newsModel } from '../models/news.model';
import type { ApiResponse, PaginatedResponse, News } from '../types';

export const newsController = {
  async getList(req: Request, res: Response): Promise<void> {
    try {
      const page = Number(req.query.page) || 1;
      const pageSize = Number(req.query.pageSize) || 10;
      const category = req.query.category as string | undefined;
      const keyword = req.query.keyword as string | undefined;

      const result = newsModel.getList({ page, pageSize, category, keyword });
      
      const response: ApiResponse<PaginatedResponse<News>> = {
        code: 0,
        message: 'success',
        data: {
          list: result.list,
          total: result.total,
          page,
          pageSize
        }
      };
      
      res.json(response);
    } catch (error) {
      res.status(500).json({ code: 500, message: '服务器错误', data: null });
    }
  },

  async getDetail(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      const news = newsModel.getById(id);
      
      if (!news) {
        res.status(404).json({ code: 404, message: '资讯不存在', data: null });
        return;
      }

      newsModel.incrementViewCount(id);
      
      const prevNext = newsModel.getPrevNext(id);
      const hotRecommend = newsModel.getHotRecommend(5);
      
      res.json({ 
        code: 0, 
        message: 'success', 
        data: {
          ...news,
          prev: prevNext.prev,
          next: prevNext.next,
          hot_recommend: hotRecommend
        } 
      });
    } catch (error) {
      res.status(500).json({ code: 500, message: '服务器错误', data: null });
    }
  },

  async getLatest(req: Request, res: Response): Promise<void> {
    try {
      const limit = Number(req.query.limit) || 3;
      const list = newsModel.getLatest(limit);
      
      res.json({ code: 0, message: 'success', data: list });
    } catch (error) {
      res.status(500).json({ code: 500, message: '服务器错误', data: null });
    }
  },

  async create(req: Request, res: Response): Promise<void> {
    try {
      const { title, content, category, cover_image, is_top } = req.body;
      
      if (!title || !content) {
        res.status(400).json({ code: 400, message: '标题和内容不能为空', data: null });
        return;
      }

      const id = newsModel.create({
        title,
        content,
        category: category || 'announcement',
        cover_image: cover_image || null,
        is_top: is_top || 0
      });
      
      res.json({ code: 0, message: '创建成功', data: { id } });
    } catch (error) {
      res.status(500).json({ code: 500, message: '服务器错误', data: null });
    }
  },

  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      const { title, content, category, cover_image, is_top } = req.body;
      
      const success = newsModel.update(id, {
        title,
        content,
        category,
        cover_image,
        is_top
      });
      
      if (!success) {
        res.status(404).json({ code: 404, message: '资讯不存在', data: null });
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
      const success = newsModel.delete(id);
      
      if (!success) {
        res.status(404).json({ code: 404, message: '资讯不存在', data: null });
        return;
      }
      
      res.json({ code: 0, message: '删除成功', data: null });
    } catch (error) {
      res.status(500).json({ code: 500, message: '服务器错误', data: null });
    }
  },

  async incrementShare(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      newsModel.incrementShareCount(id);
      res.json({ code: 0, message: 'success', data: null });
    } catch (error) {
      res.status(500).json({ code: 500, message: '服务器错误', data: null });
    }
  },

  async getHotRecommend(req: Request, res: Response): Promise<void> {
    try {
      const limit = Number(req.query.limit) || 5;
      const list = newsModel.getHotRecommend(limit);
      res.json({ code: 0, message: 'success', data: list });
    } catch (error) {
      res.status(500).json({ code: 500, message: '服务器错误', data: null });
    }
  }
};
