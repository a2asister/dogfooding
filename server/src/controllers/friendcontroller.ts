import db from '../config/database';
import { AuthContext } from '../middleware/auth';

export class FriendController {
  static async getFriends(ctx: AuthContext) {
    const userId = ctx.state.userId!;

    const friends = await new Promise<any[]>((resolve) => {
      db.all(
        `SELECT f.*, u.username, u.avatar, fg.id as group_id, fg.group_name 
         FROM friends f
         JOIN users u ON f.friend_id = u.id
         LEFT JOIN friend_groups fg ON f.group_id = fg.id
         WHERE f.user_id = ?
         ORDER BY fg.sort_order ASC, f.created_at DESC`,
        [userId],
        (_, rows) => resolve(rows || [])
      );
    });

    const transformed = friends.map((f: any) => ({
      id: f.friend_id,
      username: f.username,
      avatar: f.avatar,
      remark: f.remark,
      groupId: f.group_id,
      groupName: f.group_name,
      createdAt: f.created_at
    }));

    ctx.body = { code: 200, data: transformed };
  }

  static async addFriend(ctx: AuthContext) {
    const userId = ctx.state.userId!;
    const { friendId, remark } = ctx.request.body as {
      friendId: number;
      remark?: string;
    };

    if (userId === friendId) {
      ctx.body = { code: 400, message: '不能添加自己为好友' };
      return;
    }

    const exists = await new Promise<any>((resolve) => {
      db.get(
        'SELECT 1 FROM friends WHERE user_id = ? AND friend_id = ?',
        [userId, friendId],
        (_, row) => resolve(row)
      );
    });

    if (exists) {
      ctx.body = { code: 400, message: '已经是好友了' };
      return;
    }

    await new Promise((resolve) => {
      db.run(
        'INSERT INTO friends (user_id, friend_id, remark) VALUES (?, ?, ?)',
        [userId, friendId, remark || ''],
        () => resolve(null)
      );
    });

    await FriendController.logOperation(userId, 'add_friend', 'friend', friendId.toString(), '添加好友');

    ctx.body = { code: 200, message: '添加成功' };
  }

  static async deleteFriend(ctx: AuthContext) {
    const userId = ctx.state.userId!;
    const { friendId } = ctx.request.body as { friendId: number };

    await new Promise((resolve) => {
      db.run(
        'DELETE FROM friends WHERE user_id = ? AND friend_id = ?',
        [userId, friendId],
        () => resolve(null)
      );
    });

    await FriendController.logOperation(userId, 'delete_friend', 'friend', friendId.toString(), '删除好友');

    ctx.body = { code: 200, message: '删除成功' };
  }

  static async updateRemark(ctx: AuthContext) {
    const userId = ctx.state.userId!;
    const { friendId, remark } = ctx.request.body as {
      friendId: number;
      remark: string;
    };

    await new Promise((resolve) => {
      db.run(
        'UPDATE friends SET remark = ? WHERE user_id = ? AND friend_id = ?',
        [remark, userId, friendId],
        () => resolve(null)
      );
    });

    await FriendController.logOperation(userId, 'update_remark', 'friend', friendId.toString(), `更新备注: ${remark}`);

    ctx.body = { code: 200, message: '更新成功' };
  }

  static async createGroup(ctx: AuthContext) {
    const userId = ctx.state.userId!;
    const { groupName } = ctx.request.body as { groupName: string };

    if (!groupName) {
      ctx.body = { code: 400, message: '分组名称不能为空' };
      return;
    }

    const result = await new Promise<any>((resolve) => {
      db.run(
        'INSERT INTO friend_groups (user_id, group_name) VALUES (?, ?)',
        [userId, groupName],
        function (err) {
          resolve({ id: this.lastID });
        }
      );
    });

    await FriendController.logOperation(userId, 'create_group', 'friend_group', result.id.toString(), `创建分组: ${groupName}`);

    ctx.body = { code: 200, message: '创建成功', data: { groupId: result.id, groupName } };
  }

  static async deleteGroup(ctx: AuthContext) {
    const userId = ctx.state.userId!;
    const { groupId } = ctx.request.body as { groupId: number };

    await new Promise((resolve) => {
      db.run(
        'DELETE FROM friend_groups WHERE id = ? AND user_id = ?',
        [groupId, userId],
        () => resolve(null)
      );
    });

    await FriendController.logOperation(userId, 'delete_group', 'friend_group', groupId.toString(), '删除分组');

    ctx.body = { code: 200, message: '删除成功' };
  }

  static async updateGroup(ctx: AuthContext) {
    const userId = ctx.state.userId!;
    const { groupId, groupName } = ctx.request.body as {
      groupId: number;
      groupName: string;
    };

    await new Promise((resolve) => {
      db.run(
        'UPDATE friend_groups SET group_name = ? WHERE id = ? AND user_id = ?',
        [groupName, groupId, userId],
        () => resolve(null)
      );
    });

    await FriendController.logOperation(userId, 'update_group', 'friend_group', groupId.toString(), `更新分组: ${groupName}`);

    ctx.body = { code: 200, message: '更新成功' };
  }

  static async moveFriendToGroup(ctx: AuthContext) {
    const userId = ctx.state.userId!;
    const { friendId, groupId } = ctx.request.body as {
      friendId: number;
      groupId: number | null;
    };

    await new Promise((resolve) => {
      db.run(
        'UPDATE friends SET group_id = ? WHERE user_id = ? AND friend_id = ?',
        [groupId, userId, friendId],
        () => resolve(null)
      );
    });

    await FriendController.logOperation(userId, 'move_friend', 'friend', friendId.toString(), `移动好友到分组 ${groupId}`);

    ctx.body = { code: 200, message: '移动成功' };
  }

  static async getGroups(ctx: AuthContext) {
    const userId = ctx.state.userId!;

    const groups = await new Promise<any[]>((resolve) => {
      db.all(
        `SELECT fg.*, COUNT(f.id) as friend_count
         FROM friend_groups fg
         LEFT JOIN friends f ON fg.id = f.group_id AND f.user_id = ?
         WHERE fg.user_id = ?
         GROUP BY fg.id
         ORDER BY fg.sort_order ASC, fg.created_at DESC`,
        [userId, userId],
        (_, rows) => resolve(rows || [])
      );
    });

    const ungroupedCount = await new Promise<number>((resolve) => {
      db.get(
        'SELECT COUNT(*) as count FROM friends WHERE user_id = ? AND group_id IS NULL',
        [userId],
        (_, row: any) => resolve(row?.count || 0)
      );
    });

    const transformed = groups.map((g: any) => ({
      id: g.id,
      groupName: g.group_name,
      sortOrder: g.sort_order,
      friendCount: g.friend_count,
      createdAt: g.created_at
    }));

    ctx.body = {
      code: 200,
      data: {
        groups: transformed,
        ungroupedCount
      }
    };
  }

  static async getGroupFriends(ctx: AuthContext) {
    const userId = ctx.state.userId!;
    const { groupId } = ctx.query as { groupId?: string };

    let friends: any[] = [];

    if (groupId === 'ungrouped') {
      friends = await new Promise<any[]>((resolve) => {
        db.all(
          `SELECT f.*, u.username, u.avatar
           FROM friends f
           JOIN users u ON f.friend_id = u.id
           WHERE f.user_id = ? AND f.group_id IS NULL
           ORDER BY f.created_at DESC`,
          [userId],
          (_, rows) => resolve(rows || [])
        );
      });
    } else if (groupId) {
      friends = await new Promise<any[]>((resolve) => {
        db.all(
          `SELECT f.*, u.username, u.avatar
           FROM friends f
           JOIN users u ON f.friend_id = u.id
           WHERE f.user_id = ? AND f.group_id = ?
           ORDER BY f.created_at DESC`,
          [userId, parseInt(groupId)],
          (_, rows) => resolve(rows || [])
        );
      });
    }

    ctx.body = {
      code: 200,
      data: friends.map((f: any) => ({
        id: f.friend_id,
        username: f.username,
        avatar: f.avatar,
        remark: f.remark,
        createdAt: f.created_at
      }))
    };
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
