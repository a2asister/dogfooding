import { Context } from 'koa';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/database';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config';
import { AuthContext } from '../middleware/auth';

export class UserController {
  static async register(ctx: Context) {
    const { username, password, phone } = ctx.request.body as {
      username: string;
      password: string;
      phone?: string;
    };

    if (!username || !password) {
      ctx.body = { code: 400, message: '用户名和密码不能为空' };
      return;
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const result = await new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO users (username, password, phone) VALUES (?, ?, ?)',
          [username, hashedPassword, phone],
          function (err) {
            if (err) reject(err);
            else resolve(this);
          }
        );
      }) as { lastID: number };

      ctx.body = {
        code: 200,
        message: '注册成功',
        data: { userId: result.lastID, username }
      };
    } catch (err: any) {
      if (err.errno === 19) {
        ctx.body = { code: 400, message: '用户名或手机号已存在' };
      } else {
        ctx.body = { code: 500, message: '注册失败' };
      }
    }
  }

  static async login(ctx: Context) {
    const { username, password } = ctx.request.body as {
      username: string;
      password: string;
    };

    const user = await new Promise<any>((resolve) => {
      db.get('SELECT * FROM users WHERE username = ?', [username], (_, row) => {
        resolve(row);
      });
    });

    if (!user) {
      ctx.body = { code: 400, message: '用户不存在' };
      return;
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      ctx.body = { code: 400, message: '密码错误' };
      return;
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN
    });

    ctx.body = {
      code: 200,
      message: '登录成功',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          avatar: user.avatar
        }
      }
    };
  }

  static async getUserInfo(ctx: AuthContext) {
    const userId = ctx.state.userId;
    
    const user = await new Promise<any>((resolve) => {
      db.get('SELECT id, username, avatar FROM users WHERE id = ?', [userId], (_, row) => {
        resolve(row);
      });
    });

    ctx.body = { code: 200, data: user };
  }

  static async searchUser(ctx: AuthContext) {
    const { keyword } = ctx.query as { keyword: string };
    
    const users = await new Promise<any[]>((resolve) => {
      db.all(
        'SELECT id, username, avatar FROM users WHERE username LIKE ? LIMIT 10',
        [`%${keyword}%`],
        (_, rows) => resolve(rows || [])
      );
    });

    ctx.body = { code: 200, data: users };
  }
}
