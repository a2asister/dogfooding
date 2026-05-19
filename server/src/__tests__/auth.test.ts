import request from 'supertest';
import Koa from 'koa';
import Router from 'koa-router';
import { koaBody } from 'koa-body';
import cors from '@koa/cors';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import { createTestDb, closeTestDb, clearTables } from './testDb';

let db: Database.Database;
let app: Koa;

beforeAll(() => {
  db = createTestDb();
  
  app = new Koa();
  app.use(cors());
  app.use(koaBody());
  
  app.use(async (ctx, next) => {
    (ctx as any).db = db;
    await next();
  });
});

afterEach(() => {
  clearTables();
});

afterAll(() => {
  closeTestDb();
});

describe('Auth API', () => {
  let router: Router;
  
  beforeEach(async () => {
    const authModule = await import('../routes/auth');
    router = new Router({ prefix: '/api' });
    authModule.default(router);
    app.use(router.routes());
    app.use(router.allowedMethods());
  });

  afterEach(() => {
    app.middleware = app.middleware.slice(0, 3);
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app.callback())
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toMatchObject({
        username: 'testuser',
        email: 'test@example.com',
        points: 0,
        level: 1
      });
    });

    it('should return 400 if username is missing', async () => {
      const response = await request(app.callback())
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('用户名、邮箱和密码是必填项');
    });

    it('should return 400 if email is missing', async () => {
      const response = await request(app.callback())
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          password: 'password123'
        });

      expect(response.status).toBe(400);
    });

    it('should return 400 if password is missing', async () => {
      const response = await request(app.callback())
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com'
        });

      expect(response.status).toBe(400);
    });

    it('should return 409 if username already exists', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      db.prepare('INSERT INTO users (username, email, password) VALUES (?, ?, ?)').run(
        'testuser',
        'existing@example.com',
        hashedPassword
      );

      const response = await request(app.callback())
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(409);
      expect(response.body.error).toBe('用户名或邮箱已存在');
    });

    it('should return 409 if email already exists', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      db.prepare('INSERT INTO users (username, email, password) VALUES (?, ?, ?)').run(
        'existinguser',
        'test@example.com',
        hashedPassword
      );

      const response = await request(app.callback())
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(409);
    });

    it('should award registration points to new user', async () => {
      const response = await request(app.callback())
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.body.user.points).toBeGreaterThan(0);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      db.prepare('INSERT INTO users (username, email, password) VALUES (?, ?, ?)').run(
        'testuser',
        'test@example.com',
        hashedPassword
      );
    });

    it('should login with correct credentials', async () => {
      const response = await request(app.callback())
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.username).toBe('testuser');
    });

    it('should return 400 if username is missing', async () => {
      const response = await request(app.callback())
        .post('/api/auth/login')
        .send({
          password: 'password123'
        });

      expect(response.status).toBe(400);
    });

    it('should return 401 for non-existent user', async () => {
      const response = await request(app.callback())
        .post('/api/auth/login')
        .send({
          username: 'nonexistent',
          password: 'password123'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('用户名或密码错误');
    });

    it('should return 401 for wrong password', async () => {
      const response = await request(app.callback())
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
    });

    it('should return 403 for banned user', async () => {
      db.prepare("UPDATE users SET status = 'banned' WHERE username = ?").run('testuser');

      const response = await request(app.callback())
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'password123'
        });

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('账号已被封禁');
    });
  });

  describe('GET /api/auth/profile', () => {
    let token: string;
    let userId: number;

    beforeEach(async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const result = db.prepare('INSERT INTO users (username, email, password) VALUES (?, ?, ?)').run(
        'testuser',
        'test@example.com',
        hashedPassword
      );
      userId = Number(result.lastInsertRowid);

      const middleware = await import('../middleware');
      token = middleware.generateToken({ id: userId, username: 'testuser', role: 'user' });
    });

    it('should return user profile with valid token', async () => {
      const response = await request(app.callback())
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.username).toBe('testuser');
      expect(response.body.email).toBe('test@example.com');
    });

    it('should return 401 without token', async () => {
      const response = await request(app.callback())
        .get('/api/auth/profile');

      expect(response.status).toBe(401);
    });

    it('should return 401 with invalid token', async () => {
      const response = await request(app.callback())
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /api/auth/profile', () => {
    let token: string;
    let userId: number;

    beforeEach(async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const result = db.prepare('INSERT INTO users (username, email, password) VALUES (?, ?, ?)').run(
        'testuser',
        'test@example.com',
        hashedPassword
      );
      userId = Number(result.lastInsertRowid);

      const middleware = await import('../middleware');
      token = middleware.generateToken({ id: userId, username: 'testuser', role: 'user' });
    });

    it('should update user profile', async () => {
      const response = await request(app.callback())
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({
          bio: 'Updated bio',
          avatar: 'https://example.com/avatar.png'
        });

      expect(response.status).toBe(200);
      expect(response.body.bio).toBe('Updated bio');
      expect(response.body.avatar).toBe('https://example.com/avatar.png');
    });

    it('should update password', async () => {
      const response = await request(app.callback())
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({
          password: 'newpassword123'
        });

      expect(response.status).toBe(200);

      const user = db.prepare('SELECT password FROM users WHERE id = ?').get(userId) as { password: string };
      const isMatch = await bcrypt.compare('newpassword123', user.password);
      expect(isMatch).toBe(true);
    });
  });

  describe('POST /api/auth/checkin', () => {
    let token: string;
    let userId: number;

    beforeEach(async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const result = db.prepare('INSERT INTO users (username, email, password, points) VALUES (?, ?, ?, ?)').run(
        'testuser',
        'test@example.com',
        hashedPassword,
        0
      );
      userId = Number(result.lastInsertRowid);

      const middleware = await import('../middleware');
      token = middleware.generateToken({ id: userId, username: 'testuser', role: 'user' });
    });

    it('should allow check-in and award points', async () => {
      const response = await request(app.callback())
        .post('/api/auth/checkin')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.points).toBe(5);
      expect(response.body.checkedIn).toBe(true);
    });

    it('should not allow duplicate check-in on same day', async () => {
      await request(app.callback())
        .post('/api/auth/checkin')
        .set('Authorization', `Bearer ${token}`);

      const response = await request(app.callback())
        .post('/api/auth/checkin')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('今日已签到');
    });
  });
});
