import { Request, Response } from 'express';
import { faqModel } from '../models/faq.model';

export const faqController = {
  getFaqs: async (req: Request, res: Response): Promise<void> => {
    try {
      const { category, keyword } = req.query;
      const lang = req.headers['accept-language']?.includes('en') ? 'en' : 'zh-CN';

      const faqs = faqModel.getAll(
        category as string,
        keyword as string,
        lang
      );

      res.json({
        code: 0,
        message: 'success',
        data: faqs
      });
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: '获取FAQ失败',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  getFaqById: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const faq = faqModel.getById(Number(id));

      if (!faq) {
        res.status(404).json({
          code: 404,
          message: 'FAQ不存在'
        });
        return;
      }

      faqModel.incrementViewCount(Number(id));

      res.json({
        code: 0,
        message: 'success',
        data: faq
      });
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: '获取FAQ详情失败',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  getCategories: async (req: Request, res: Response): Promise<void> => {
    try {
      const categories = faqModel.getCategories();
      res.json({
        code: 0,
        message: 'success',
        data: categories
      });
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: '获取分类失败',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
};
