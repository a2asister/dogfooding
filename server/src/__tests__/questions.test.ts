import request from 'supertest';
import Koa from 'koa';
import Router from 'koa-router';
import koaBody from 'koa-body';
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

describe('Questions API', () => {
  let router: Router;
  let token: string;
  let userId: number;

  beforeEach(async () => {
    const questionsModule = await import('../routes/questions');
    router = new Router({ prefix: '/api' });
    questionsModule.default(router);
    app.use(router.routes());
    app.use(router.allowedMethods());

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

  afterEach(() => {
    app.middleware = app.middleware.slice(0, 3);
  });

  describe('POST /api/questions', () => {
    it('should create a new question', async () => {
      const response = await request(app.callback())
        .post('/api/questions')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Test Question',
          content: 'This is a question',
          tags: 'React,JavaScript'
        });

      expect(response.status).toBe(201);
      expect(response.body.question.title).toBe('Test Question');
      expect(response.body.question.user_id).toBe(userId);
    });

    it('should return 400 if title is missing', async () => {
      const response = await request(app.callback())
        .post('/api/questions')
        .set('Authorization', `Bearer ${token}`)
        .send({
          content: 'This is a question'
        });

      expect(response.status).toBe(400);
    });

    it('should award points for creating question', async () => {
      db.prepare('UPDATE users SET points = 0 WHERE id = ?').run(userId);

      const response = await request(app.callback())
        .post('/api/questions')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Test Question',
          content: 'This is a question'
        });

      expect(response.status).toBe(201);
      
      const user = db.prepare('SELECT points FROM users WHERE id = ?').get(userId) as { points: number };
      expect(user.points).toBe(10);
    });
  });

  describe('GET /api/questions', () => {
    beforeEach(() => {
      for (let i = 0; i < 5; i++) {
        db.prepare('INSERT INTO questions (user_id, title, content, status) VALUES (?, ?, ?, ?)').run(
          userId,
          `Question ${i}`,
          `Content ${i}`,
          'approved'
        );
      }
    });

    it('should return list of questions', async () => {
      const response = await request(app.callback())
        .get('/api/questions');

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(5);
      expect(response.body.total).toBe(5);
    });

    it('should support pagination', async () => {
      const response = await request(app.callback())
        .get('/api/questions?page=1&pageSize=2');

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.total).toBe(5);
    });

    it('should sort by hot', async () => {
      db.prepare('UPDATE questions SET likes = 100 WHERE id = 1').run();

      const response = await request(app.callback())
        .get('/api/questions?sort=hot');

      expect(response.status).toBe(200);
      expect(response.body.data[0].likes).toBe(100);
    });
  });

  describe('GET /api/questions/:id', () => {
    let questionId: number;

    beforeEach(() => {
      const result = db.prepare('INSERT INTO questions (user_id, title, content, status, views) VALUES (?, ?, ?, ?, ?)').run(
        userId,
        'Test Question',
        'Content',
        'approved',
        0
      );
      questionId = Number(result.lastInsertRowid);
    });

    it('should return question by id', async () => {
      const response = await request(app.callback())
        .get(`/api/questions/${questionId}`);

      expect(response.status).toBe(200);
      expect(response.body.question.title).toBe('Test Question');
    });

    it('should increment views count', async () => {
      await request(app.callback())
        .get(`/api/questions/${questionId}`);

      const question = db.prepare('SELECT views FROM questions WHERE id = ?').get(questionId) as { views: number };
      expect(question.views).toBe(1);
    });

    it('should return 404 for non-existent question', async () => {
      const response = await request(app.callback())
        .get('/api/questions/9999');

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/questions/:id/answers', () => {
    let questionId: number;

    beforeEach(() => {
      const result = db.prepare('INSERT INTO questions (user_id, title, content, status) VALUES (?, ?, ?, ?)').run(
        userId,
        'Test Question',
        'Content',
        'approved'
      );
      questionId = Number(result.lastInsertRowid);
    });

    it('should create an answer', async () => {
      const response = await request(app.callback())
        .post(`/api/questions/${questionId}/answers`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          content: 'This is an answer'
        });

      expect(response.status).toBe(201);
      expect(response.body.answer.content).toBe('This is an answer');
    });

    it('should award points for answer', async () => {
      db.prepare('UPDATE users SET points = 0 WHERE id = ?').run(userId);

      await request(app.callback())
        .post(`/api/questions/${questionId}/answers`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          content: 'This is an answer'
        });

      const user = db.prepare('SELECT points FROM users WHERE id = ?').get(userId) as { points: number };
      expect(user.points).toBe(5);
    });
  });

  describe('POST /api/questions/:id/answers/:answerId/adopt', () => {
    let questionId: number;
    let answerId: number;
    let otherUserId: number;

    beforeEach(async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const otherResult = db.prepare('INSERT INTO users (username, email, password) VALUES (?, ?, ?)').run(
        'otheruser',
        'other@example.com',
        hashedPassword
      );
      otherUserId = Number(otherResult.lastInsertRowid);

      const qResult = db.prepare('INSERT INTO questions (user_id, title, content, status) VALUES (?, ?, ?, ?)').run(
        userId,
        'Test Question',
        'Content',
        'approved'
      );
      questionId = Number(qResult.lastInsertRowid);

      const aResult = db.prepare('INSERT INTO answers (question_id, user_id, content) VALUES (?, ?, ?)').run(
        questionId,
        otherUserId,
        'Answer content'
      );
      answerId = Number(aResult.lastInsertRowid);
    });

    it('should adopt an answer', async () => {
      const response = await request(app.callback())
        .post(`/api/questions/${questionId}/answers/${answerId}/adopt`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.answer.is_accepted).toBe(1);
    });

    it('should award points to answer author', async () => {
      db.prepare('UPDATE users SET points = 0 WHERE id = ?').run(otherUserId);

      await request(app.callback())
        .post(`/api/questions/${questionId}/answers/${answerId}/adopt`)
        .set('Authorization', `Bearer ${token}`);

      const user = db.prepare('SELECT points FROM users WHERE id = ?').get(otherUserId) as { points: number };
      expect(user.points).toBe(30);
    });

    it('should return 403 if not question author', async () => {
      const middleware = await import('../middleware');
      const otherToken = middleware.generateToken({ id: otherUserId, username: 'otheruser', role: 'user' });

      const response = await request(app.callback())
        .post(`/api/questions/${questionId}/answers/${answerId}/adopt`)
        .set('Authorization', `Bearer ${otherToken}`);

      expect(response.status).toBe(403);
    });
  });
});
