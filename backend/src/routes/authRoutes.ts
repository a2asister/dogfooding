import { Router, Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { createAuthMiddleware } from '../middleware/authMiddleware';

export function createAuthRouter(authService: AuthService): Router {
  const router = Router();
  const authMiddleware = createAuthMiddleware(authService);

  router.post('/register', async (req: Request, res: Response) => {
    try {
      const { username, password, role } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: '用户名和密码不能为空' });
      }

      const user = await authService.register(
        username, 
        password, 
        role === 'admin' ? 'admin' : 'user'
      );
      
      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  router.post('/login', async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: '用户名和密码不能为空' });
      }

      const result = await authService.login(username, password);
      res.json(result);
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  });

  router.get('/me', authMiddleware, (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: '未授权' });
      }
      
      const user = authService.getUserById(req.user.userId);
      if (!user) {
        return res.status(404).json({ error: '用户不存在' });
      }
      
      res.json(user);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  router.get('/users', authMiddleware, (req: Request, res: Response) => {
    try {
      if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: '权限不足' });
      }
      
      const users = authService.getAllUsers();
      res.json(users);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  return router;
}
