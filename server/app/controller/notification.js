'use strict';

const { v4: uuidv4 } = require('uuid');

const Controller = require('egg').Controller;

class NotificationController extends Controller {
  async list() {
    const { ctx, app } = this;
    const { page = 1, pageSize = 20 } = ctx.query;
    const offset = (page - 1) * pageSize;

    const db = app.db;

    const totalStmt = db.prepare('SELECT COUNT(*) as count FROM notifications');
    const totalResult = totalStmt.get();
    const total = totalResult.count;

    const notifications = db.prepare(
      `SELECT * FROM notifications ORDER BY created_at DESC LIMIT ? OFFSET ?`
    ).all(pageSize, offset);

    const unreadStmt = db.prepare('SELECT COUNT(*) as count FROM notifications WHERE is_read = 0');
    const unreadResult = unreadStmt.get();
    const unreadCount = unreadResult.count;

    ctx.body = {
      success: true,
      data: {
        notifications: notifications.map(n => ({
          ...n,
          extra_data: n.extra_data ? JSON.parse(n.extra_data) : null,
          created_at: n.created_at
        })),
        total,
        unreadCount,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      }
    };
  }

  async create() {
    const { ctx, app } = this;
    const { type, title, content, extra_data } = ctx.request.body;

    if (!type || !title || !content) {
      ctx.status = 400;
      ctx.body = { success: false, message: 'type, title and content are required' };
      return;
    }

    const id = uuidv4();
    const now = Date.now();
    const extraDataStr = extra_data ? JSON.stringify(extra_data) : null;

    const db = app.db;

    db.prepare(
      `INSERT INTO notifications (id, type, title, content, extra_data, is_read, created_at)
       VALUES (?, ?, ?, ?, ?, 0, ?)`
    ).run(id, type, title, content, extraDataStr, now);

    const notification = {
      id,
      type,
      title,
      content,
      extra_data,
      is_read: false,
      created_at: now
    };

    app.notificationQueue.add(notification);

    ctx.status = 201;
    ctx.body = {
      success: true,
      data: notification
    };
  }

  async markAsRead() {
    const { ctx, app } = this;
    const { id } = ctx.params;

    const db = app.db;
    const result = db.prepare(
      'UPDATE notifications SET is_read = 1 WHERE id = ?'
    ).run(id);

    if (result.changes === 0) {
      ctx.status = 404;
      ctx.body = { success: false, message: 'Notification not found' };
      return;
    }

    ctx.body = { success: true };
  }

  async markAllAsRead() {
    const { ctx, app } = this;
    const db = app.db;

    db.prepare('UPDATE notifications SET is_read = 1 WHERE is_read = 0').run();

    ctx.body = { success: true };
  }

  async delete() {
    const { ctx, app } = this;
    const { id } = ctx.params;

    const db = app.db;
    const result = db.prepare('DELETE FROM notifications WHERE id = ?').run(id);

    if (result.changes === 0) {
      ctx.status = 404;
      ctx.body = { success: false, message: 'Notification not found' };
      return;
    }

    ctx.body = { success: true };
  }

  async batchDelete() {
    const { ctx, app } = this;
    const { ids } = ctx.request.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      ctx.status = 400;
      ctx.body = { success: false, message: 'ids must be a non-empty array' };
      return;
    }

    const db = app.db;
    const placeholders = ids.map(() => '?').join(',');
    const result = db.prepare(`DELETE FROM notifications WHERE id IN (${placeholders})`).run(...ids);

    ctx.body = {
      success: true,
      data: { deletedCount: result.changes }
    };
  }

  async queuePush() {
    const { ctx, app } = this;

    const notifications = [
      {
        type: 'like',
        title: '动态获得新赞',
        content: `你的动态获得了新的点赞！`,
        extra_data: { userName: `用户${Math.floor(Math.random() * 1000)}` }
      },
      {
        type: 'comment',
        title: '收到新评论',
        content: `有人评论了你的文章！`,
        extra_data: { userName: `用户${Math.floor(Math.random() * 1000)}` }
      },
      {
        type: 'follow',
        title: '新关注',
        content: `有人关注了你！`,
        extra_data: {
          userName: `用户${Math.floor(Math.random() * 1000)}`,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`
        }
      }
    ];

    const randomNotif = notifications[Math.floor(Math.random() * notifications.length)];

    const id = uuidv4();
    const now = Date.now();
    const extraDataStr = randomNotif.extra_data ? JSON.stringify(randomNotif.extra_data) : null;

    const db = app.db;

    db.prepare(
      `INSERT INTO notifications (id, type, title, content, extra_data, is_read, created_at)
       VALUES (?, ?, ?, ?, ?, 0, ?)`
    ).run(id, randomNotif.type, randomNotif.title, randomNotif.content, extraDataStr, now);

    const notification = {
      id,
      ...randomNotif,
      is_read: false,
      created_at: now
    };

    app.notificationQueue.add(notification);

    ctx.body = {
      success: true,
      data: notification
    };
  }
}

module.exports = NotificationController;
