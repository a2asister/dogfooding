import db from '../config/database';
import { AuthContext } from '../middleware/auth';

export class MessageController {
  static async getHistoryMessages(ctx: AuthContext) {
    const userId = ctx.state.userId!;
    const { friendId, page = 1, pageSize = 50 } = ctx.query as {
      friendId: string;
      page?: string;
      pageSize?: string;
    };

    const friendIdNum = parseInt(friendId);
    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    
    console.log(`查询历史消息: userId=${userId}, friendId=${friendIdNum}`);

    const messages = await new Promise<any[]>((resolve) => {
      db.all(
        `SELECT m.*, u.username as from_username 
         FROM messages m
         JOIN users u ON m.from_user_id = u.id
         WHERE (m.from_user_id = ? AND m.to_user_id = ?) 
            OR (m.from_user_id = ? AND m.to_user_id = ?)
         ORDER BY m.created_at DESC
         LIMIT ? OFFSET ?`,
        [userId, friendIdNum, friendIdNum, userId, parseInt(pageSize), offset],
        (err, rows) => {
          if (err) console.error('查询消息错误:', err);
          console.log(`查询到 ${rows?.length || 0} 条消息`);
          resolve(rows || []);
        }
      );
    });

    const transformedMessages = messages.map((msg: any) => ({
      messageId: msg.message_id,
      fromUserId: Number(msg.from_user_id),
      toUserId: Number(msg.to_user_id),
      content: msg.content,
      createdAt: msg.created_at,
      isRead: msg.is_read,
      fromUsername: msg.from_username
    }));

    ctx.body = { code: 200, data: transformedMessages.reverse() };
  }

  static async markAsRead(ctx: AuthContext) {
    const userId = ctx.state.userId!;
    const { fromUserId } = ctx.request.body as { fromUserId: number };

    await new Promise((resolve) => {
      db.run(
        'UPDATE messages SET is_read = 1 WHERE from_user_id = ? AND to_user_id = ? AND is_read = 0',
        [fromUserId, userId],
        () => resolve(null)
      );
    });

    ctx.body = { code: 200, message: '已标记为已读' };
  }
}
