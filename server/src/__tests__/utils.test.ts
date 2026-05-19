import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import { createTestDb, closeTestDb, clearTables } from './testDb';

let db: Database.Database;

beforeAll(() => {
  db = createTestDb();
});

afterEach(() => {
  clearTables();
});

afterAll(() => {
  closeTestDb();
});

describe('utils', () => {
  describe('calculateLevel', () => {
    let calculateLevel: (points: number) => number;
    
    beforeEach(async () => {
      const mod = await import('../utils');
      calculateLevel = mod.calculateLevel;
    });

    it('should return level 1 for 0 points', () => {
      expect(calculateLevel(0)).toBe(1);
    });

    it('should return level 1 for 99 points', () => {
      expect(calculateLevel(99)).toBe(1);
    });

    it('should return level 2 for 100 points', () => {
      expect(calculateLevel(100)).toBe(2);
    });

    it('should return level 2 for 499 points', () => {
      expect(calculateLevel(499)).toBe(2);
    });

    it('should return level 3 for 500 points', () => {
      expect(calculateLevel(500)).toBe(3);
    });

    it('should return level 3 for 1999 points', () => {
      expect(calculateLevel(1999)).toBe(3);
    });

    it('should return level 4 for 2000 points', () => {
      expect(calculateLevel(2000)).toBe(4);
    });

    it('should return level 4 for 4999 points', () => {
      expect(calculateLevel(4999)).toBe(4);
    });

    it('should return level 5 for 5000 points', () => {
      expect(calculateLevel(5000)).toBe(5);
    });

    it('should return level 5 for 19999 points', () => {
      expect(calculateLevel(19999)).toBe(5);
    });

    it('should return level 6 for 20000 points', () => {
      expect(calculateLevel(20000)).toBe(6);
    });

    it('should return level 6 for very high points', () => {
      expect(calculateLevel(100000)).toBe(6);
    });
  });

  describe('addPoints', () => {
    let addPoints: (userId: number, action: string, points: number, description: string, relatedId?: number, relatedType?: string) => void;
    let userId: number;

    beforeEach(async () => {
      const mod = await import('../utils');
      addPoints = mod.addPoints;
      
      const hashedPassword = await bcrypt.hash('password123', 10);
      const result = db.prepare('INSERT INTO users (username, email, password, points) VALUES (?, ?, ?, ?)').run(
        'testuser',
        'test@example.com',
        hashedPassword,
        0
      );
      userId = Number(result.lastInsertRowid);
    });

    it('should add positive points to user', () => {
      addPoints(userId, 'daily_login', 5, '每日登录');
      
      const user = db.prepare('SELECT points, level FROM users WHERE id = ?').get(userId) as { points: number; level: number };
      expect(user.points).toBe(5);
      expect(user.level).toBe(1);
    });

    it('should create a point log entry', () => {
      addPoints(userId, 'daily_login', 5, '每日登录', 1, 'article');
      
      const log = db.prepare('SELECT * FROM point_logs WHERE user_id = ?').get(userId) as { action: string; points: number; description: string };
      expect(log.action).toBe('daily_login');
      expect(log.points).toBe(5);
      expect(log.description).toBe('每日登录');
    });

    it('should not let points go below 0', () => {
      addPoints(userId, 'violation', -50, '违规内容删除');
      
      const user = db.prepare('SELECT points FROM users WHERE id = ?').get(userId) as { points: number };
      expect(user.points).toBe(0);
    });

    it('should level up when points reach threshold', () => {
      addPoints(userId, 'publish_article', 100, '发布文章');
      
      const user = db.prepare('SELECT points, level FROM users WHERE id = ?').get(userId) as { points: number; level: number };
      expect(user.points).toBe(100);
      expect(user.level).toBe(2);
    });

    it('should ban user when points are set to CHEAT value', async () => {
      const { POINT_RULES } = await import('../types');
      addPoints(userId, 'cheat', POINT_RULES.CHEAT, '作弊刷分');
      
      const user = db.prepare('SELECT status FROM users WHERE id = ?').get(userId) as { status: string };
      expect(user.status).toBe('banned');
    });

    it('should handle non-existent user gracefully', () => {
      expect(() => {
        addPoints(9999, 'daily_login', 5, '每日登录');
      }).not.toThrow();
    });
  });

  describe('createNotification', () => {
    let createNotification: (userId: number, type: string, content: string, relatedId?: number, relatedType?: string) => void;
    let userId: number;

    beforeEach(async () => {
      const mod = await import('../utils');
      createNotification = mod.createNotification;
      
      const hashedPassword = await bcrypt.hash('password123', 10);
      const result = db.prepare('INSERT INTO users (username, email, password) VALUES (?, ?, ?)').run(
        'testuser',
        'test@example.com',
        hashedPassword
      );
      userId = Number(result.lastInsertRowid);
    });

    it('should create a notification', () => {
      createNotification(userId, 'like', '有人点赞了你的文章', 1, 'article');
      
      const notification = db.prepare('SELECT * FROM notifications WHERE user_id = ?').get(userId) as { type: string; content: string; related_id: number; related_type: string };
      expect(notification.type).toBe('like');
      expect(notification.content).toBe('有人点赞了你的文章');
      expect(notification.related_id).toBe(1);
      expect(notification.related_type).toBe('article');
      expect(notification.is_read).toBe(0);
    });

    it('should handle optional parameters', () => {
      createNotification(userId, 'system', '系统通知');
      
      const notification = db.prepare('SELECT * FROM notifications WHERE user_id = ?').get(userId) as { related_id: number; related_type: string };
      expect(notification.related_id).toBeNull();
      expect(notification.related_type).toBeNull();
    });
  });

  describe('updateTags', () => {
    let updateTags: (tagNames: string[]) => void;

    beforeEach(async () => {
      const mod = await import('../utils');
      updateTags = mod.updateTags;
    });

    it('should insert new tags', () => {
      updateTags(['React', 'TypeScript']);
      
      const tags = db.prepare('SELECT name, usage_count FROM tags').all() as { name: string; usage_count: number }[];
      expect(tags).toHaveLength(2);
      expect(tags.find(t => t.name === 'React')?.usage_count).toBe(1);
      expect(tags.find(t => t.name === 'TypeScript')?.usage_count).toBe(1);
    });

    it('should increment usage count for existing tags', () => {
      db.prepare('INSERT INTO tags (name, usage_count) VALUES (?, ?)').run('React', 1);
      
      updateTags(['React']);
      
      const tag = db.prepare('SELECT usage_count FROM tags WHERE name = ?').get('React') as { usage_count: number };
      expect(tag.usage_count).toBe(2);
    });

    it('should handle empty array', () => {
      expect(() => {
        updateTags([]);
      }).not.toThrow();
    });
  });

  describe('parseTags', () => {
    let parseTags: (tagsStr: string) => string[];

    beforeEach(async () => {
      const mod = await import('../utils');
      parseTags = mod.parseTags;
    });

    it('should parse comma-separated tags', () => {
      expect(parseTags('React,TypeScript,Frontend')).toEqual(['React', 'TypeScript', 'Frontend']);
    });

    it('should trim whitespace', () => {
      expect(parseTags(' React , TypeScript , Frontend ')).toEqual(['React', 'TypeScript', 'Frontend']);
    });

    it('should filter empty strings', () => {
      expect(parseTags('React,,TypeScript,')).toEqual(['React', 'TypeScript']);
    });

    it('should handle empty string', () => {
      expect(parseTags('')).toEqual([]);
    });
  });

  describe('checkBadges', () => {
    let checkBadges: (userId: number) => void;
    let userId: number;

    beforeEach(async () => {
      const mod = await import('../utils');
      checkBadges = mod.checkBadges;
      
      const hashedPassword = await bcrypt.hash('password123', 10);
      const result = db.prepare('INSERT INTO users (username, email, password) VALUES (?, ?, ?)').run(
        'testuser',
        'test@example.com',
        hashedPassword
      );
      userId = Number(result.lastInsertRowid);
    });

    it('should award first_article badge when user has one article', () => {
      db.prepare('INSERT INTO articles (user_id, title, content, status) VALUES (?, ?, ?, ?)').run(
        userId, 'Test Article', 'Content', 'approved'
      );
      
      checkBadges(userId);
      
      const userBadge = db.prepare(`
        SELECT b.name FROM user_badges ub 
        JOIN badges b ON ub.badge_id = b.id 
        WHERE ub.user_id = ? AND b.condition = ?
      `).get(userId, 'first_article');
      expect(userBadge).toBeDefined();
    });

    it('should not award duplicate badges', () => {
      db.prepare('INSERT INTO articles (user_id, title, content, status) VALUES (?, ?, ?, ?)').run(
        userId, 'Test Article', 'Content', 'approved'
      );
      
      checkBadges(userId);
      checkBadges(userId);
      
      const count = db.prepare('SELECT COUNT(*) as count FROM user_badges WHERE user_id = ?').get(userId) as { count: number };
      expect(count.count).toBe(1);
    });

    it('should award articles_50 badge when user has 50 articles', () => {
      for (let i = 0; i < 50; i++) {
        db.prepare('INSERT INTO articles (user_id, title, content, status) VALUES (?, ?, ?, ?)').run(
          userId, `Article ${i}`, 'Content', 'approved'
        );
      }
      
      checkBadges(userId);
      
      const badge = db.prepare(`
        SELECT b.name FROM user_badges ub 
        JOIN badges b ON ub.badge_id = b.id 
        WHERE ub.user_id = ? AND b.condition = ?
      `).get(userId, 'articles_50');
      expect(badge).toBeDefined();
    });

    it('should award projects_5 badge when user has 5 projects', () => {
      for (let i = 0; i < 5; i++) {
        db.prepare('INSERT INTO projects (user_id, title, description, content) VALUES (?, ?, ?, ?)').run(
          userId, `Project ${i}`, 'Description', 'Content'
        );
      }
      
      checkBadges(userId);
      
      const badge = db.prepare(`
        SELECT b.name FROM user_badges ub 
        JOIN badges b ON ub.badge_id = b.id 
        WHERE ub.user_id = ? AND b.condition = ?
      `).get(userId, 'projects_5');
      expect(badge).toBeDefined();
    });

    it('should award likes_1000 badge when user has 1000 total likes', () => {
      db.prepare('INSERT INTO articles (user_id, title, content, status, likes) VALUES (?, ?, ?, ?, ?)').run(
        userId, 'Test Article', 'Content', 'approved', 1000
      );
      
      checkBadges(userId);
      
      const badge = db.prepare(`
        SELECT b.name FROM user_badges ub 
        JOIN badges b ON ub.badge_id = b.id 
        WHERE ub.user_id = ? AND b.condition = ?
      `).get(userId, 'likes_1000');
      expect(badge).toBeDefined();
    });

    it('should award points_2000 badge when user has 2000 points', () => {
      db.prepare('UPDATE users SET points = ? WHERE id = ?').run(2000, userId);
      
      checkBadges(userId);
      
      const badge = db.prepare(`
        SELECT b.name FROM user_badges ub 
        JOIN badges b ON ub.badge_id = b.id 
        WHERE ub.user_id = ? AND b.condition = ?
      `).get(userId, 'points_2000');
      expect(badge).toBeDefined();
    });

    it('should award checkin_30 badge when user has 30 checkins', () => {
      const today = new Date();
      for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        db.prepare('INSERT INTO daily_check_ins (user_id, check_in_date) VALUES (?, ?)').run(
          userId, date.toISOString().split('T')[0]
        );
      }
      
      checkBadges(userId);
      
      const badge = db.prepare(`
        SELECT b.name FROM user_badges ub 
        JOIN badges b ON ub.badge_id = b.id 
        WHERE ub.user_id = ? AND b.condition = ?
      `).get(userId, 'checkin_30');
      expect(badge).toBeDefined();
    });

    it('should award accepted_answers_10 badge when user has 10 accepted answers', () => {
      for (let i = 0; i < 10; i++) {
        db.prepare('INSERT INTO answers (question_id, user_id, content, is_accepted) VALUES (?, ?, ?, ?)').run(
          1, userId, 'Answer', 1
        );
      }
      
      checkBadges(userId);
      
      const badge = db.prepare(`
        SELECT b.name FROM user_badges ub 
        JOIN badges b ON ub.badge_id = b.id 
        WHERE ub.user_id = ? AND b.condition = ?
      `).get(userId, 'accepted_answers_10');
      expect(badge).toBeDefined();
    });

    it('should award resources_100 badge when user has 100 resources', () => {
      for (let i = 0; i < 100; i++) {
        db.prepare('INSERT INTO resources (project_id, user_id, title, url) VALUES (?, ?, ?, ?)').run(
          1, userId, `Resource ${i}`, 'http://example.com'
        );
      }
      
      checkBadges(userId);
      
      const badge = db.prepare(`
        SELECT b.name FROM user_badges ub 
        JOIN badges b ON ub.badge_id = b.id 
        WHERE ub.user_id = ? AND b.condition = ?
      `).get(userId, 'resources_100');
      expect(badge).toBeDefined();
    });
  });
});
