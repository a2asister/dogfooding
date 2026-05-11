'use strict';

const Database = require('better-sqlite3');
const path = require('path');

class AppBootHook {
  constructor(app) {
    this.app = app;
  }

  configWillLoad() {
    const dbPath = path.join(__dirname, 'data', 'notifications.db');
    const db = new Database(dbPath);

    db.exec(`
      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        extra_data TEXT,
        is_read INTEGER DEFAULT 0,
        created_at INTEGER NOT NULL
      )
    `);

    this.app.db = db;

    this.app.notificationQueue = {
      queue: [],
      add(notification) {
        this.queue.push(notification);
        return notification;
      },
      getAll() {
        return this.queue;
      },
      clear() {
        this.queue = [];
      }
    };

    const sampleNotifications = [
      {
        id: '1',
        type: 'like',
        title: '张三赞了你的动态',
        content: '你的文章《前端最佳实践》获得了新赞',
        extra_data: JSON.stringify({ userName: '张三' }),
        is_read: 0,
        created_at: Date.now() - 1000 * 60 * 5
      },
      {
        id: '2',
        type: 'comment',
        title: '李四评论了你的文章',
        content: '写得很棒！我也有类似的想法',
        extra_data: JSON.stringify({ userName: '李四' }),
        is_read: 0,
        created_at: Date.now() - 1000 * 60 * 30
      },
      {
        id: '3',
        type: 'follow',
        title: '王五关注了你',
        content: '王五成为了你的新粉丝',
        extra_data: JSON.stringify({ userName: '王五', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wangwu' }),
        is_read: 1,
        created_at: Date.now() - 1000 * 60 * 60 * 2
      }
    ];

    const insertStmt = db.prepare(`
      INSERT OR IGNORE INTO notifications (id, type, title, content, extra_data, is_read, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    for (const notif of sampleNotifications) {
      insertStmt.run(
        notif.id,
        notif.type,
        notif.title,
        notif.content,
        notif.extra_data,
        notif.is_read,
        notif.created_at
      );
    }
  }

  async didReady() {
    console.log('🚀 Notification Center Server is ready on port 17089');
  }
}

module.exports = AppBootHook;
