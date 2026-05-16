import db from '../config/database';
import { AuthContext } from '../middleware/auth';

export class FriendController {
  static async getFriends(ctx: AuthContext) {
    const userId = ctx.state.userId!;

    const friends = await new Promise<any[]>((resolve) => {
      db.all(
        `SELECT u.id, u.username, u.avatar, 
         (SELECT COUNT(*) FROM messages m 
          WHERE m.from_user_id = u.id AND m.to_user_id = ? AND m.is_read = 0) as unread_count
         FROM friends f
         JOIN users u ON f.friend_id = u.id
         WHERE f.user_id = ?`,
        [userId, userId],
        (_, rows) => resolve(rows || [])
      );
    });

    ctx.body = { code: 200, data: friends };
  }

  static async addFriend(ctx: AuthContext) {
    const userId = ctx.state.userId!;
    const { friendId } = ctx.request.body as { friendId: number };

    if (userId === friendId) {
      ctx.body = { code: 400, message: '不能添加自己为好友' };
      return;
    }

    try {
      await new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO friends (user_id, friend_id) VALUES (?, ?)',
          [userId, friendId],
          (err) => {
            if (err) reject(err);
            else resolve(null);
          }
        );
      });

      await new Promise((resolve) => {
        db.run(
          'INSERT INTO friends (user_id, friend_id) VALUES (?, ?)',
          [friendId, userId],
          (err) => {
            if (err) resolve(null);
            else resolve(null);
          }
        );
      });

      ctx.body = { code: 200, message: '添加好友成功' };
    } catch (err: any) {
      if (err.errno === 19) {
        ctx.body = { code: 400, message: '已经是好友' };
      } else {
        ctx.body = { code: 500, message: '添加失败' };
      }
    }
  }

  static async deleteFriend(ctx: AuthContext) {
    const userId = ctx.state.userId!;
    const { friendId } = ctx.request.body as { friendId: number };

    await new Promise((resolve) => {
      db.run(
        'DELETE FROM friends WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)',
        [userId, friendId, friendId, userId],
        () => resolve(null)
      );
    });

    ctx.body = { code: 200, message: '删除好友成功' };
  }
}
