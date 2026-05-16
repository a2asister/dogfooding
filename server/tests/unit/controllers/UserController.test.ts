import { UserController } from '../../../src/controllers/usercontroller';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../../../src/config/database';

jest.mock('../../../src/config/database', () => ({
  run: jest.fn(),
  get: jest.fn(),
  all: jest.fn(),
}));

describe('UserController', () => {
  let ctx: any;

  beforeEach(() => {
    jest.clearAllMocks();
    ctx = {
      request: { body: {} },
      body: null,
      state: {},
    };
  });

  describe('register', () => {
    it('should return error when username is empty', async () => {
      ctx.request.body = { username: '', password: 'password123' };
      await UserController.register(ctx);
      expect(ctx.body).toEqual({ code: 400, message: '用户名和密码不能为空' });
    });

    it('should return error when password is empty', async () => {
      ctx.request.body = { username: 'testuser', password: '' };
      await UserController.register(ctx);
      expect(ctx.body).toEqual({ code: 400, message: '用户名和密码不能为空' });
    });

    it('should register successfully with valid data', async () => {
      ctx.request.body = { username: 'testuser', password: 'password123' };
      
      (db.run as jest.Mock).mockImplementation((_query: string, _params: any[], callback: (err: any) => void) => {
        callback.call({ lastID: 1 }, null);
      });

      await UserController.register(ctx);
      expect(ctx.body).toEqual({
        code: 200,
        message: '注册成功',
        data: { userId: 1, username: 'testuser' },
      });
    });

    it('should return error when username already exists', async () => {
      ctx.request.body = { username: 'existinguser', password: 'password123' };
      
      (db.run as jest.Mock).mockImplementation((_query: string, _params: any[], callback: (err: any) => void) => {
        callback({ errno: 19 });
      });

      await UserController.register(ctx);
      expect(ctx.body).toEqual({ code: 400, message: '用户名或手机号已存在' });
    });

    it('should handle other database errors', async () => {
      ctx.request.body = { username: 'testuser', password: 'password123' };
      
      (db.run as jest.Mock).mockImplementation((_query: string, _params: any[], callback: (err: any) => void) => {
        callback({ errno: 1 });
      });

      await UserController.register(ctx);
      expect(ctx.body).toEqual({ code: 500, message: '注册失败' });
    });
  });

  describe('login', () => {
    it('should return error when user does not exist', async () => {
      ctx.request.body = { username: 'nonexistent', password: 'password123' };
      
      (db.get as jest.Mock).mockImplementation((_query: string, _params: any[], callback: (_err: any, row: any) => void) => {
        callback(null, null);
      });

      await UserController.login(ctx);
      expect(ctx.body).toEqual({ code: 400, message: '用户不存在' });
    });

    it('should return error when password is incorrect', async () => {
      ctx.request.body = { username: 'testuser', password: 'wrongpassword' };
      
      const mockUser = { id: 1, username: 'testuser', password: 'hashedpassword' };
      (db.get as jest.Mock).mockImplementation((_query: string, _params: any[], callback: (_err: any, row: any) => void) => {
        callback(null, mockUser);
      });

      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

      await UserController.login(ctx);
      expect(ctx.body).toEqual({ code: 400, message: '密码错误' });
    });

    it('should login successfully with correct credentials', async () => {
      ctx.request.body = { username: 'testuser', password: 'password123' };
      
      const mockUser = { id: 1, username: 'testuser', password: 'hashedpassword', avatar: 'avatar.jpg' };
      (db.get as jest.Mock).mockImplementation((_query: string, _params: any[], callback: (_err: any, row: any) => void) => {
        callback(null, mockUser);
      });

      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
      jest.spyOn(jwt, 'sign').mockReturnValue('testtoken' as never);

      await UserController.login(ctx);
      expect(ctx.body).toEqual({
        code: 200,
        message: '登录成功',
        data: {
          token: 'testtoken',
          user: {
            id: 1,
            username: 'testuser',
            avatar: 'avatar.jpg',
          },
        },
      });
    });
  });

  describe('getUserInfo', () => {
    it('should return user info', async () => {
      ctx.state.userId = 1;
      
      const mockUser = { id: 1, username: 'testuser', avatar: 'avatar.jpg' };
      (db.get as jest.Mock).mockImplementation((_query: string, _params: any[], callback: (_err: any, row: any) => void) => {
        callback(null, mockUser);
      });

      await UserController.getUserInfo(ctx);
      expect(ctx.body).toEqual({ code: 200, data: mockUser });
    });
  });

  describe('searchUser', () => {
    it('should return users matching keyword', async () => {
      ctx.state.userId = 1;
      ctx.query = { keyword: 'test' };
      
      const mockUsers = [
        { id: 1, username: 'testuser1', avatar: 'avatar1.jpg' },
        { id: 2, username: 'testuser2', avatar: 'avatar2.jpg' },
      ];
      (db.all as jest.Mock).mockImplementation((_query: string, _params: any[], callback: (_err: any, rows: any[]) => void) => {
        callback(null, mockUsers);
      });

      await UserController.searchUser(ctx);
      expect(ctx.body).toEqual({ code: 200, data: mockUsers });
    });

    it('should return empty array when no users match', async () => {
      ctx.state.userId = 1;
      ctx.query = { keyword: 'nonexistent' };
      
      (db.all as jest.Mock).mockImplementation((_query: string, _params: any[], callback: (_err: any, rows: any[]) => void) => {
        callback(null, []);
      });

      await UserController.searchUser(ctx);
      expect(ctx.body).toEqual({ code: 200, data: [] });
    });
  });
});
