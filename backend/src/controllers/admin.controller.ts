import type { Request, Response } from 'express';
import { adminModel } from '../models/admin.model';

export const adminController = {
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        res.status(400).json({ code: 400, message: '用户名和密码不能为空', data: null });
        return;
      }

      const isValid = adminModel.verifyPassword(username, password);
      
      if (!isValid) {
        res.status(401).json({ code: 401, message: '用户名或密码错误', data: null });
        return;
      }

      const admin = adminModel.getByUsername(username);
      
      res.json({ 
        code: 0, 
        message: '登录成功', 
        data: { 
          id: admin?.id,
          username: admin?.username,
          role: admin?.role
        } 
      });
    } catch (error) {
      res.status(500).json({ code: 500, message: '服务器错误', data: null });
    }
  },

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const admins = adminModel.getAll();
      res.json({ code: 0, message: 'success', data: admins });
    } catch (error) {
      res.status(500).json({ code: 500, message: '服务器错误', data: null });
    }
  },

  async create(req: Request, res: Response): Promise<void> {
    try {
      const { username, password, role } = req.body;
      
      if (!username || !password) {
        res.status(400).json({ code: 400, message: '用户名和密码不能为空', data: null });
        return;
      }

      const existing = adminModel.getByUsername(username);
      if (existing) {
        res.status(400).json({ code: 400, message: '用户名已存在', data: null });
        return;
      }

      const id = adminModel.create({ username, password, role: role || 'admin' });
      
      res.json({ code: 0, message: '创建成功', data: { id } });
    } catch (error) {
      res.status(500).json({ code: 500, message: '服务器错误', data: null });
    }
  }
};
