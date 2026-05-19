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

describe('Comments API', () => {
  let router: Router;
  let token: string;
  let userId: number;
  let articleId: number;

  beforeEach(async () => {
    const commentsModule = await import('../routes/comments');
    router = new Router({ prefix: '/api' });
    commentsModule.default(router);
    app.use(router.routes());
    app.use(router.allowedMethods());

    const hashedPassword = await bcrypt.hash('password123', 10);
    const userResult = db.prepare('INSERT INTO users (username, email, password) VALUES (?, ?, ?)').run(
      'testuser',
      'test@example.com',
      hashedPassword
    );
    userId = Number(userResult.lastInsertRowid);

    const articleResult = db.prepare('INSERT INTO articles (user_id, title, content, status) VALUES (?, ?, ?, ?)').run(
      userId,
      'Test Article',
      'Content',
      'approved'
    );
    articleId = Number(articleResult.lastInsertRowid);

    const middleware = await import('../middleware');
    token = middleware.generateToken({ id: userId, username: 'testuser', role: 'user' });
  });

  afterEach(() => {
    app.middleware = app.middleware.slice(0, 3);
  });

  describe('POST /api/comments', () => {
    it('should create a comment', async () => {
      const response = await request(app.callback())
        .post('/api/comments')
        .set('Authorization', `Bearer ${token}`)
        .send({
          target_type: 'article',
          target_id: articleId,
          content: 'Test comment'
        });

      expect(response.status).toBe(201);
      expect(response.body.comment.content).toBe('Test comment');
      expect(response.body.comment.user_id).toBe(userId);
    });

    it('should return 400 if content is missing', async () => {
      const response = await request(app.callback())
        .post('/api/comments')
        .set('Authorization', `Bearer ${token}`)
        .send({
          target_type: 'article',
          target_id: articleId
        });

      expect(response.status).toBe(400);
    });

    it('should increment article comments count', async () => {
      await request(app.callback())
        .post('/api/comments')
        .set('Authorization', `Bearer ${token}`)
        .send({
          target_type: 'article',
          target_id: articleId,
          content: 'Test comment'
        });

      const article = db.prepare('SELECT comments FROM articles WHERE id = ?').get(articleId) as { comments: number };
      expect(article.comments).toBe(1);
    });

    it('should add points for comment', async () => {
      db.prepare('UPDATE users SET points = 0 WHERE id = ?').run(userId);

      await request(app.callback())
        .post('/api/comments')
        .set('Authorization', `Bearer ${token}`)
        .send({
          target_type: 'article',
          target_id: articleId,
          content: 'Test comment'
        });

      const user = db.prepare('SELECT points FROM users WHERE id = ?').get(userId) as { points: number };
      expect(user.points).toBe(2);
    });
  });

  describe('GET /api/comments', () => {
    beforeEach(() => {
      for (let i = 0; i < 3; i++) {
        db.prepare('INSERT INTO comments (target_type, target_id, user_id, content) VALUES (?, ?, ?, ?)').run(
          'article',
          articleId,
          userId,
          `Comment ${i}`
        );
      }
    });

    it('should return comments for a target', async () => {
      const response = await request(app.callback())
        .get(`/api/comments?target_type=article&target_id=${articleId}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(3);
    });
  });

  describe('PUT /api/comments/:id', () => {
    let commentId: number;

    beforeEach(() => {
      const result = db.prepare('INSERT INTO comments (target_type, target_id, user_id, content) VALUES (?, ?, ?, ?)').run(
        'article',
        articleId,
        userId,
        'Original comment'
      );
      commentId = Number(result.lastInsertRowid);
    });

    it('should update a comment', async () => {
      const response = await request(app.callback())
        .put(`/api/comments/${commentId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          content: 'Updated comment'
        });

      expect(response.status).toBe(200);
      expect(response.body.comment.content).toBe('Updated comment');
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
        .put(`/api/comments/${commentId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({
          content: 'Hacked comment'
        });

      expect(response.status).toBe(403);
    });
  });

  describe('DELETE /api/comments/:id', () => {
    let commentId: number;

    beforeEach(() => {
      const result = db.prepare('INSERT INTO comments (target_type, target_id, user_id, content) VALUES (?, ?, ?, ?)').run(
        'article',
        articleId,
        userId,
        'Test comment'
      );
      commentId = Number(result.lastInsertRowid);
    });

    it('should delete a comment', async () => {
      const response = await request(app.callback())
        .delete(`/api/comments/${commentId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);

      const comment = db.prepare('SELECT * FROM comments WHERE id = ?').get(commentId);
      expect(comment).toBeUndefined();
    });
  });

  describe('POST /api/comments/:id/like', () => {
    let commentId: number;

    beforeEach(() => {
      const result = db.prepare('INSERT INTO comments (target_type, target_id, user_id, content) VALUES (?, ?, ?, ?)').run(
        'article',
        articleId,
        userId,
        'Test comment'
      );
      commentId = Number(result.lastInsertRowid);
    });

    it('should like a comment', async () => {
      const response = await request(app.callback())
        .post(`/api/comments/${commentId}/like`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.liked).toBe(true);
      expect(response.body.likes).toBe(1);
    });
  });
});
