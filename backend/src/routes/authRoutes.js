import Router from 'koa-router';
import * as bcryptModule from 'bcryptjs';
const bcrypt = bcryptModule.default || bcryptModule;
import db from '../utils/db.js';
import { authenticate, generateToken } from '../middlewares/authMiddleware.js';

const router = new Router();

router.post('/login', async (ctx) => {
  try {
    const { username, password } = ctx.request.body;
    
    if (!username || !password) {
      ctx.status = 400;
      ctx.body = { error: '用户名和密码不能为空' };
      return;
    }
    
    const user = await db.findOne('users', { username });
    
    if (!user) {
      ctx.status = 401;
      ctx.body = { error: '用户名或密码错误' };
      return;
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      ctx.status = 401;
      ctx.body = { error: '用户名或密码错误' };
      return;
    }
    
    const token = generateToken(user.id, user.role);
    
    ctx.body = {
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      }
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: '登录过程中发生错误' };
  }
});

router.post('/register', async (ctx) => {
  try {
    const { username, email, password } = ctx.request.body;
    
    if (!username || !email || !password) {
      ctx.status = 400;
      ctx.body = { error: '用户名、邮箱和密码不能为空' };
      return;
    }
    
    const existingUser = await db.findOne('users', { username });
    if (existingUser) {
      ctx.status = 400;
      ctx.body = { error: '用户名已存在' };
      return;
    }
    
    const existingEmail = await db.findOne('users', { email });
    if (existingEmail) {
      ctx.status = 400;
      ctx.body = { error: '邮箱已被注册' };
      return;
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await db.create('users', {
      username,
      email,
      password: hashedPassword,
      role: 'editor'
    });
    
    ctx.status = 201;
    ctx.body = {
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: '注册过程中发生错误' };
  }
});

router.get('/me', authenticate, async (ctx) => {
  try {
    const user = ctx.state.user;
    
    ctx.body = {
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: '获取用户信息失败' };
  }
});

export default router;
