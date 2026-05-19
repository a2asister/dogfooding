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

describe('Articles API', () => {
  let router: Router;
  let token: string;
  let userId: number;

  beforeEach(async () => {
    const articlesModule = await import('../routes/articles');
    router = new Router({ prefix: '/api' });
    articlesModule.default(router);
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

  describe('POST /api/articles', () => {
    it('should create a new article', async () => {
      const response = await request(app.callback())
        .post('/api/articles')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Test Article',
          content: 'This is the article content',
          tags: 'React,TypeScript'
        });

      expect(response.status).toBe(201);
      expect(response.body.article.title).toBe('Test Article');
      expect(response.body.article.user_id).toBe(userId);
      expect(response.body.article.status).toBe('approved');
    });

    it('should return 400 if title is missing', async () => {
      const response = await request(app.callback())
        .post('/api/articles')
        .set('Authorization', `Bearer ${token}`)
        .send({
          content: 'This is the article content'
        });

      expect(response.status).toBe(400);
    });

    it('should return 401 without token', async () => {
      const response = await request(app.callback())
        .post('/api/articles')
        .send({
          title: 'Test Article',
          content: 'Content'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/articles', () => {
    beforeEach(() => {
      for (let i = 0; i < 5; i++) {
        db.prepare('INSERT INTO articles (user_id, title, content, status) VALUES (?, ?, ?, ?)').run(
          userId,
          `Article ${i}`,
          `Content ${i}`,
          'approved'
        );
      }
    });

    it('should return list of articles', async () => {
      const response = await request(app.callback())
        .get('/api/articles');

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(5);
      expect(response.body.total).toBe(5);
    });

    it('should support pagination', async () => {
      const response = await request(app.callback())
        .get('/api/articles?page=1&pageSize=2');

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.total).toBe(5);
    });

    it('should filter by tag', async () => {
      db.prepare('INSERT INTO articles (user_id, title, content, tags, status) VALUES (?, ?, ?, ?, ?)').run(
        userId,
        'Tagged Article',
        'Content',
        'React,TypeScript',
        'approved'
      );

      const response = await request(app.callback())
        .get('/api/articles?tag=React');

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should sort by hot', async () => {
      db.prepare('UPDATE articles SET likes = 100 WHERE id = 1').run();

      const response = await request(app.callback())
        .get('/api/articles?sort=hot');

      expect(response.status).toBe(200);
      expect(response.body.data[0].likes).toBe(100);
    });
  });

  describe('GET /api/articles/:id', () => {
    let articleId: number;

    beforeEach(() => {
      const result = db.prepare('INSERT INTO articles (user_id, title, content, status, views) VALUES (?, ?, ?, ?, ?)').run(
        userId,
        'Test Article',
        'Content',
        'approved',
        0
      );
      articleId = Number(result.lastInsertRowid);
    });

    it('should return article by id', async () => {
      const response = await request(app.callback())
        .get(`/api/articles/${articleId}`);

      expect(response.status).toBe(200);
      expect(response.body.article.title).toBe('Test Article');
    });

    it('should increment views count', async () => {
      await request(app.callback())
        .get(`/api/articles/${articleId}`);

      const article = db.prepare('SELECT views FROM articles WHERE id = ?').get(articleId) as { views: number };
      expect(article.views).toBe(1);
    });

    it('should return 404 for non-existent article', async () => {
      const response = await request(app.callback())
        .get('/api/articles/9999');

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/articles/:id', () => {
    let articleId: number;

    beforeEach(() => {
      const result = db.prepare('INSERT INTO articles (user_id, title, content, status) VALUES (?, ?, ?, ?)').run(
        userId,
        'Original Title',
        'Original Content',
        'approved'
      );
      articleId = Number(result.lastInsertRowid);
    });

    it('should update article', async () => {
      const response = await request(app.callback())
        .put(`/api/articles/${articleId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Updated Title',
          content: 'Updated Content'
        });

      expect(response.status).toBe(200);
      expect(response.body.article.title).toBe('Updated Title');
    });

    it('should return 403 if not author', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const otherUserResult = db.prepare('INSERT INTO users (username, email, password) VALUES (?, ?, ?)').run(
        'otheruser',
        'other@example.com',
        hashedPassword
      );
      const otherUserId = Number(otherUserResult.lastInsertRowid);

      const middleware = await import('../middleware');
      const otherToken = middleware.generateToken({ id: otherUserId, username: 'otheruser', role: 'user' });

      const response = await request(app.callback())
        .put(`/api/articles/${articleId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({
          title: 'Hacked Title'
        });

      expect(response.status).toBe(403);
    });
  });

  describe('DELETE /api/articles/:id', () => {
    let articleId: number;

    beforeEach(() => {
      const result = db.prepare('INSERT INTO articles (user_id, title, content, status) VALUES (?, ?, ?, ?)').run(
        userId,
        'Test Article',
        'Content',
        'approved'
      );
      articleId = Number(result.lastInsertRowid);
    });

    it('should delete article', async () => {
      const response = await request(app.callback())
        .delete(`/api/articles/${articleId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);

      const article = db.prepare('SELECT * FROM articles WHERE id = ?').get(articleId);
      expect(article).toBeUndefined();
    });

    it('should deduct points for deleted article', async () => {
      db.prepare('UPDATE users SET points = 50 WHERE id = ?').run(userId);

      await request(app.callback())
        .delete(`/api/articles/${articleId}`)
        .set('Authorization', `Bearer ${token}`);

      const user = db.prepare('SELECT points FROM users WHERE id = ?').get(userId) as { points: number };
      expect(user.points).toBe(30);
    });
  });

  describe('POST /api/articles/:id/like', () => {
    let articleId: number;

    beforeEach(() => {
      const result = db.prepare('INSERT INTO articles (user_id, title, content, status) VALUES (?, ?, ?, ?)').run(
        userId,
        'Test Article',
        'Content',
        'approved'
      );
      articleId = Number(result.lastInsertRowid);
    });

    it('should like an article', async () => {
      const response = await request(app.callback())
        .post(`/api/articles/${articleId}/like`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.liked).toBe(true);
      expect(response.body.likes).toBe(1);
    });

    it('should unlike an article', async () => {
      db.prepare('INSERT INTO likes (user_id, target_type, target_id) VALUES (?, ?, ?)').run(
        userId, 'article', articleId
      );
      db.prepare('UPDATE articles SET likes = 1 WHERE id = ?').run(articleId);

      const response = await request(app.callback())
        .post(`/api/articles/${articleId}/like`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.liked).toBe(false);
      expect(response.body.likes).toBe(0);
    });
  });

  describe('POST /api/articles/:id/favorite', () => {
    let articleId: number;

    beforeEach(() => {
      const result = db.prepare('INSERT INTO articles (user_id, title, content, status) VALUES (?, ?, ?, ?)').run(
        userId,
        'Test Article',
        'Content',
        'approved'
      );
      articleId = Number(result.lastInsertRowid);
    });

    it('should favorite an article', async () => {
      const response = await request(app.callback())
        .post(`/api/articles/${articleId}/favorite`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.favorited).toBe(true);
      expect(response.body.favorites).toBe(1);
    });

    it('should unfavorite an article', async () => {
      db.prepare('INSERT INTO favorites (user_id, target_type, target_id) VALUES (?, ?, ?)').run(
        userId, 'article', articleId
      );
      db.prepare('UPDATE articles SET favorites = 1 WHERE id = ?').run(articleId);

      const response = await request(app.callback())
        .post(`/api/articles/${articleId}/favorite`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.favorited).toBe(false);
      expect(response.body.favorites).toBe(0);
    });
  });
});
