import db from '../config/database';
import { AuthContext } from '../middleware/auth';

const CHAT_TYPE_PRIVATE = 1;
const CHAT_TYPE_GROUP = 2;

export class MessageController {
  static async getHistoryMessages(ctx: AuthContext) {
    const userId = ctx.state.userId!;
    const { friendId, groupId, page = 1, pageSize = 50, chatType } = ctx.query as {
      friendId?: string;
      groupId?: string;
      page?: string;
      pageSize?: string;
      chatType?: string;
    };

    const offset = (parseInt(page) - 1) * parseInt(pageSize);

    let messages: any[] = [];
    const type = parseInt(chatType || '1');

    if (type === CHAT_TYPE_PRIVATE && friendId) {
      const friendIdNum = parseInt(friendId);
      messages = await new Promise<any[]>((resolve) => {
        db.all(
          `SELECT m.*, u.username as from_username 
           FROM messages m
           JOIN users u ON m.from_user_id = u.id
           WHERE (m.from_user_id = ? AND m.to_user_id = ?) 
              OR (m.from_user_id = ? AND m.to_user_id = ?)
           ORDER BY m.created_at DESC
           LIMIT ? OFFSET ?`,
          [userId, friendIdNum, friendIdNum, userId, parseInt(pageSize), offset],
          (_, rows) => resolve(rows || [])
        );
      });
    } else if (type === CHAT_TYPE_GROUP && groupId) {
      const isMember = await new Promise<boolean>((resolve) => {
        db.get(
          'SELECT 1 FROM group_members WHERE group_id = ? AND user_id = ?',
          [groupId, userId],
          (_, row) => resolve(!!row)
        );
      });

      if (!isMember) {
        ctx.body = { code: 403, message: '不是群成员' };
        return;
      }

      messages = await new Promise<any[]>((resolve) => {
        db.all(
          `SELECT m.*, u.username as from_username, u.avatar as from_avatar
           FROM messages m
           JOIN users u ON m.from_user_id = u.id
           WHERE m.group_id = ? AND m.chat_type = ?
             AND m.is_recalled = 0 AND m.is_deleted = 0
           ORDER BY m.created_at DESC
           LIMIT ? OFFSET ?`,
          [groupId, CHAT_TYPE_GROUP, parseInt(pageSize), offset],
          (_, rows) => resolve(rows || [])
        );
      });
    }

    const transformedMessages = messages.map((msg: any) => ({
      messageId: msg.message_id,
      chatType: msg.chat_type,
      fromUserId: Number(msg.from_user_id),
      toUserId: msg.to_user_id ? Number(msg.to_user_id) : null,
      groupId: msg.group_id,
      messageType: msg.message_type,
      content: msg.content,
      mediaUrl: msg.media_url,
      mediaName: msg.media_name,
      mediaSize: msg.media_size,
      isRead: msg.is_read,
      isRecalled: msg.is_recalled,
      createdAt: msg.created_at,
      fromUsername: msg.from_username,
      fromAvatar: msg.from_avatar
    })).reverse();

    ctx.body = { code: 200, data: transformedMessages };
  }

  static async markAsRead(ctx: AuthContext) {
    const userId = ctx.state.userId!;
    const { fromUserId, groupId, messageIds, chatType } = ctx.request.body as {
      fromUserId?: number;
      groupId?: string;
      messageIds?: string[];
      chatType?: number;
    };

    const type = chatType || CHAT_TYPE_PRIVATE;

    if (messageIds && messageIds.length > 0) {
      for (const messageId of messageIds) {
        await new Promise((resolve) => {
          db.run(
            'INSERT OR REPLACE INTO message_read_status (message_id, user_id, is_read, read_at) VALUES (?, ?, 1, ?)',
            [messageId, userId, new Date().toISOString()],
            () => resolve(null)
          );
        });
      }
    } else if (type === CHAT_TYPE_PRIVATE && fromUserId) {
      await new Promise((resolve) => {
        db.run(
          'UPDATE messages SET is_read = 1 WHERE from_user_id = ? AND to_user_id = ? AND is_read = 0',
          [fromUserId, userId],
          () => resolve(null)
        );
      });
    }

    ctx.body = { code: 200, message: '已标记为已读' };
  }

  static async recallMessage(ctx: AuthContext) {
    const userId = ctx.state.userId!;
    const { messageId } = ctx.request.body as { messageId: string };

    const message = await new Promise<any>((resolve) => {
      db.get(
        `SELECT *, 
          (julianday('now') - julianday(created_at)) * 24 * 60 as diff_minutes
         FROM messages WHERE message_id = ? AND from_user_id = ?`,
        [messageId, userId],
        (_, row) => resolve(row)
      );
    });

    if (!message) {
      ctx.body = { code: 404, message: '消息不存在或无权限撤回' };
      return;
    }

    console.log('时间调试 (SQL):', {
      now: new Date().toISOString(),
      createdAt: message.created_at,
      diffMinutes: message.diff_minutes
    });

    if (message.diff_minutes > 2) {
      ctx.body = { code: 400, message: '超过撤回时间（2分钟内）' };
      return;
    }

    await new Promise((resolve) => {
      db.run(
        'UPDATE messages SET is_recalled = 1 WHERE message_id = ?',
        [messageId],
        () => resolve(null)
      );
    });

    await MessageController.logOperation(userId, 'recall_message', 'message', messageId, '撤回消息');

    ctx.body = { code: 200, message: '撤回成功' };
  }

  static async deleteMessage(ctx: AuthContext) {
    const userId = ctx.state.userId!;
    const { messageId } = ctx.request.body as { messageId: string };

    const message = await new Promise<any>((resolve) => {
      db.get(
        'SELECT * FROM messages WHERE message_id = ?',
        [messageId],
        (_, row) => resolve(row)
      );
    });

    if (!message) {
      ctx.body = { code: 404, message: '消息不存在' };
      return;
    }

    if (message.from_user_id !== userId && message.to_user_id !== userId) {
      ctx.body = { code: 403, message: '无权限删除' };
      return;
    }

    await new Promise((resolve) => {
      db.run(
        'UPDATE messages SET is_deleted = 1 WHERE message_id = ?',
        [messageId],
        () => resolve(null)
      );
    });

    await MessageController.logOperation(userId, 'delete_message', 'message', messageId, '删除消息');

    ctx.body = { code: 200, message: '删除成功' };
  }

  static async getUnreadCount(ctx: AuthContext) {
    const userId = ctx.state.userId!;

    const privateUnread = await new Promise<number>((resolve) => {
      db.get(
        `SELECT COUNT(*) as count 
         FROM messages 
         WHERE to_user_id = ? AND chat_type = ? 
           AND is_read = 0 AND is_recalled = 0 AND is_deleted = 0`,
        [userId, CHAT_TYPE_PRIVATE],
        (_, row: any) => resolve(row?.count || 0)
      );
    });

    const groupUnread = await new Promise<number>((resolve) => {
      db.get(
        `SELECT COUNT(*) as count 
         FROM messages m
         JOIN group_members gm ON m.group_id = gm.group_id
         LEFT JOIN message_read_status rs ON m.message_id = rs.message_id AND rs.user_id = ?
         WHERE gm.user_id = ? AND m.chat_type = ? 
           AND m.is_recalled = 0 AND m.is_deleted = 0
           AND (rs.is_read IS NULL OR rs.is_read = 0)`,
        [userId, userId, CHAT_TYPE_GROUP],
        (_, row: any) => resolve(row?.count || 0)
      );
    });

    ctx.body = {
      code: 200,
      data: {
        privateUnread,
        groupUnread,
        total: privateUnread + groupUnread
      }
    };
  }

  static async getMessageReadStatus(ctx: AuthContext) {
    const userId = ctx.state.userId!;
    const { messageId } = ctx.query as { messageId: string };

    const message = await new Promise<any>((resolve) => {
      db.get(
        'SELECT * FROM messages WHERE message_id = ?',
        [messageId],
        (_, row) => resolve(row)
      );
    });

    if (!message) {
      ctx.body = { code: 404, message: '消息不存在' };
      return;
    }

    if (message.chat_type === CHAT_TYPE_PRIVATE) {
      const readStatus = await new Promise<any>((resolve) => {
        db.get(
          'SELECT is_read, read_at FROM message_read_status WHERE message_id = ? AND user_id = ?',
          [messageId, message.to_user_id],
          (_, row) => resolve(row)
        );
      });

      ctx.body = {
        code: 200,
        data: {
          messageId,
          chatType: CHAT_TYPE_PRIVATE,
          readStatus: readStatus?.is_read === 1 ? 'read' : 'unread',
          readAt: readStatus?.read_at
        }
      };
    } else if (message.chat_type === CHAT_TYPE_GROUP) {
      const readMembers = await new Promise<any[]>((resolve) => {
        db.all(
          `SELECT u.id, u.username, rs.read_at 
           FROM message_read_status rs
           JOIN users u ON rs.user_id = u.id
           WHERE rs.message_id = ? AND rs.is_read = 1`,
          [messageId],
          (_, rows) => resolve(rows || [])
        );
      });

      const totalMembers = await new Promise<number>((resolve) => {
        db.get(
          'SELECT COUNT(*) as count FROM group_members WHERE group_id = ?',
          [message.group_id],
          (_, row: any) => resolve(row?.count || 0)
        );
      });

      ctx.body = {
        code: 200,
        data: {
          messageId,
          chatType: CHAT_TYPE_GROUP,
          readCount: readMembers.length,
          totalCount: totalMembers,
          readMembers
        }
      };
    }
  }

  private static async logOperation(
    userId: number,
    operationType: string,
    targetType: string,
    targetId: string,
    detail: string
  ) {
    return new Promise((resolve) => {
      db.run(
        'INSERT INTO operation_logs (user_id, operation_type, target_type, target_id, detail, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, operationType, targetType, targetId, detail, new Date().toISOString()],
        () => resolve(null)
      );
    });
  }
}
