import db from '../config/database';
import { v4 as uuidv4 } from 'uuid';
import { AuthContext } from '../middleware/auth';

const CHAT_TYPE_GROUP = 2;

export class GroupController {
  static async createGroup(ctx: AuthContext) {
    const userId = ctx.state.userId!;
    const { groupName, memberIds = [], groupAvatar } = ctx.request.body as {
      groupName: string;
      memberIds?: number[];
      groupAvatar?: string;
    };

    if (!groupName) {
      ctx.body = { code: 400, message: '群名称不能为空' };
      return;
    }

    const groupId = uuidv4();

    await new Promise((resolve) => {
      db.run(
        'INSERT INTO groups (group_id, group_name, group_avatar, owner_id) VALUES (?, ?, ?, ?)',
        [groupId, groupName, groupAvatar, userId],
        () => resolve(null)
      );
    });

    const allMemberIds = [userId, ...memberIds];
    for (const memberId of allMemberIds) {
      const role = memberId === userId ? 1 : 0;
      await new Promise((resolve) => {
        db.run(
          'INSERT OR IGNORE INTO group_members (group_id, user_id, role) VALUES (?, ?, ?)',
          [groupId, memberId, role],
          () => resolve(null)
        );
      });
    }

    await GroupController.logOperation(userId, 'create_group', 'group', groupId, `创建群聊: ${groupName}`);

    ctx.body = { code: 200, message: '创建成功', data: { groupId, groupName } };
  }

  static async getMyGroups(ctx: AuthContext) {
    const userId = ctx.state.userId!;

    const groups = await new Promise<any[]>((resolve) => {
      db.all(
        `SELECT g.*, gm.role 
         FROM groups g
         JOIN group_members gm ON g.group_id = gm.group_id
         WHERE gm.user_id = ? AND g.is_dismissed = 0
         ORDER BY g.created_at DESC`,
        [userId],
        (_, rows) => resolve(rows || [])
      );
    });

    const result = [];
    for (const group of groups) {
      const memberCount = await new Promise<number>((resolve) => {
        db.get(
          'SELECT COUNT(*) as count FROM group_members WHERE group_id = ?',
          [group.group_id],
          (_, row: any) => resolve(row?.count || 0)
        );
      });

      const unreadCount = await new Promise<number>((resolve) => {
        db.get(
          `SELECT COUNT(*) as count 
           FROM messages m
           LEFT JOIN message_read_status rs ON m.message_id = rs.message_id AND rs.user_id = ?
           WHERE m.group_id = ? AND m.chat_type = ? 
             AND m.is_recalled = 0 AND m.is_deleted = 0
             AND (rs.is_read IS NULL OR rs.is_read = 0)`,
          [userId, group.group_id, CHAT_TYPE_GROUP],
          (_, row: any) => resolve(row?.count || 0)
        );
      });

      result.push({
        groupId: group.group_id,
        groupName: group.group_name,
        groupAvatar: group.group_avatar,
        ownerId: group.owner_id,
        role: group.role,
        memberCount,
        unreadCount,
        announcement: group.announcement,
        createdAt: group.created_at
      });
    }

    ctx.body = { code: 200, data: result };
  }

  static async getGroupInfo(ctx: AuthContext) {
    const userId = ctx.state.userId!;
    const { groupId } = ctx.query as { groupId: string };

    const isMember = await GroupController.checkGroupMember(groupId, userId);
    if (!isMember) {
      ctx.body = { code: 403, message: '不是群成员' };
      return;
    }

    const group = await new Promise<any>((resolve) => {
      db.get(
        `SELECT g.*, gm.role 
         FROM groups g
         JOIN group_members gm ON g.group_id = gm.group_id
         WHERE g.group_id = ? AND gm.user_id = ? AND g.is_dismissed = 0`,
        [groupId, userId],
        (_, row) => resolve(row)
      );
    });

    if (!group) {
      ctx.body = { code: 404, message: '群不存在' };
      return;
    }

    const members = await new Promise<any[]>((resolve) => {
      db.all(
        `SELECT gm.*, u.username, u.avatar 
         FROM group_members gm
         JOIN users u ON gm.user_id = u.id
         WHERE gm.group_id = ?
         ORDER BY gm.role DESC, gm.joined_at ASC`,
        [groupId],
        (_, rows) => resolve(rows || [])
      );
    });

    ctx.body = {
      code: 200,
      data: {
        groupId: group.group_id,
        groupName: group.group_name,
        groupAvatar: group.group_avatar,
        ownerId: group.owner_id,
        role: group.role,
        announcement: group.announcement,
        maxMembers: group.max_members,
        createdAt: group.created_at,
        members: members.map((m: any) => ({
          userId: m.user_id,
          username: m.username,
          avatar: m.avatar,
          role: m.role,
          groupRemark: m.group_remark,
          joinedAt: m.joined_at
        }))
      }
    };
  }

  static async addMembers(ctx: AuthContext) {
    const userId = ctx.state.userId!;
    const { groupId, memberIds } = ctx.request.body as {
      groupId: string;
      memberIds: number[];
    };

    const isMember = await GroupController.checkGroupMember(groupId, userId);
    if (!isMember) {
      ctx.body = { code: 403, message: '不是群成员' };
      return;
    }

    const group = await new Promise<any>((resolve) => {
      db.get('SELECT * FROM groups WHERE group_id = ?', [groupId], (_, row) => resolve(row));
    });

    const currentCount = await new Promise<number>((resolve) => {
      db.get(
        'SELECT COUNT(*) as count FROM group_members WHERE group_id = ?',
        [groupId],
        (_, row: any) => resolve(row?.count || 0)
      );
    });

    if (currentCount + memberIds.length > group.max_members) {
      ctx.body = { code: 400, message: '群人数已达上限' };
      return;
    }

    for (const memberId of memberIds) {
      await new Promise((resolve) => {
        db.run(
          'INSERT OR IGNORE INTO group_members (group_id, user_id) VALUES (?, ?)',
          [groupId, memberId],
          () => resolve(null)
        );
      });
    }

    await GroupController.logOperation(userId, 'add_members', 'group', groupId, `添加成员: ${memberIds.join(',')}`);

    ctx.body = { code: 200, message: '添加成功' };
  }

  static async removeMember(ctx: AuthContext) {
    const userId = ctx.state.userId!;
    const { groupId, memberId } = ctx.request.body as {
      groupId: string;
      memberId: number;
    };

    const member = await new Promise<any>((resolve) => {
      db.get(
        'SELECT * FROM group_members WHERE group_id = ? AND user_id = ?',
        [groupId, userId],
        (_, row) => resolve(row)
      );
    });

    if (!member || member.role === 0) {
      ctx.body = { code: 403, message: '无权限操作' };
      return;
    }

    if (memberId === userId && member.role === 1) {
      ctx.body = { code: 400, message: '群主不能退出群聊，请先解散群聊' };
      return;
    }

    await new Promise((resolve) => {
      db.run(
        'DELETE FROM group_members WHERE group_id = ? AND user_id = ?',
        [groupId, memberId],
        () => resolve(null)
      );
    });

    await GroupController.logOperation(userId, 'remove_member', 'group', groupId, `移除成员: ${memberId}`);

    ctx.body = { code: 200, message: '移除成功' };
  }

  static async leaveGroup(ctx: AuthContext) {
    const userId = ctx.state.userId!;
    const { groupId } = ctx.request.body as { groupId: string };

    const group = await new Promise<any>((resolve) => {
      db.get('SELECT * FROM groups WHERE group_id = ?', [groupId], (_, row) => resolve(row));
    });

    if (group.owner_id === userId) {
      ctx.body = { code: 400, message: '群主不能退出群聊，请先解散群聊' };
      return;
    }

    await new Promise((resolve) => {
      db.run(
        'DELETE FROM group_members WHERE group_id = ? AND user_id = ?',
        [groupId, userId],
        () => resolve(null)
      );
    });

    await GroupController.logOperation(userId, 'leave_group', 'group', groupId, '退出群聊');

    ctx.body = { code: 200, message: '退出成功' };
  }

  static async dismissGroup(ctx: AuthContext) {
    const userId = ctx.state.userId!;
    const { groupId } = ctx.request.body as { groupId: string };

    const group = await new Promise<any>((resolve) => {
      db.get('SELECT * FROM groups WHERE group_id = ?', [groupId], (_, row) => resolve(row));
    });

    if (!group || group.owner_id !== userId) {
      ctx.body = { code: 403, message: '无权限解散群聊' };
      return;
    }

    await new Promise((resolve) => {
      db.run(
        'UPDATE groups SET is_dismissed = 1 WHERE group_id = ?',
        [groupId],
        () => resolve(null)
      );
    });

    await GroupController.logOperation(userId, 'dismiss_group', 'group', groupId, '解散群聊');

    ctx.body = { code: 200, message: '解散成功' };
  }

  static async updateGroupInfo(ctx: AuthContext) {
    const userId = ctx.state.userId!;
    const { groupId, groupName, groupAvatar, announcement } = ctx.request.body as {
      groupId: string;
      groupName?: string;
      groupAvatar?: string;
      announcement?: string;
    };

    const member = await new Promise<any>((resolve) => {
      db.get(
        'SELECT * FROM group_members WHERE group_id = ? AND user_id = ?',
        [groupId, userId],
        (_, row) => resolve(row)
      );
    });

    if (!member || member.role === 0) {
      ctx.body = { code: 403, message: '无权限操作' };
      return;
    }

    const updates: string[] = [];
    const params: any[] = [];

    if (groupName !== undefined) {
      updates.push('group_name = ?');
      params.push(groupName);
    }
    if (groupAvatar !== undefined) {
      updates.push('group_avatar = ?');
      params.push(groupAvatar);
    }
    if (announcement !== undefined) {
      updates.push('announcement = ?');
      params.push(announcement);
    }

    if (updates.length > 0) {
      params.push(groupId);
      await new Promise((resolve) => {
        db.run(
          `UPDATE groups SET ${updates.join(', ')} WHERE group_id = ?`,
          params,
          () => resolve(null)
        );
      });
    }

    await GroupController.logOperation(userId, 'update_group', 'group', groupId, '更新群信息');

    ctx.body = { code: 200, message: '更新成功' };
  }

  static async setMemberRole(ctx: AuthContext) {
    const userId = ctx.state.userId!;
    const { groupId, memberId, role } = ctx.request.body as {
      groupId: string;
      memberId: number;
      role: number;
    };

    const member = await new Promise<any>((resolve) => {
      db.get(
        'SELECT * FROM group_members WHERE group_id = ? AND user_id = ?',
        [groupId, userId],
        (_, row) => resolve(row)
      );
    });

    if (!member || member.role !== 1) {
      ctx.body = { code: 403, message: '无权限操作' };
      return;
    }

    await new Promise((resolve) => {
      db.run(
        'UPDATE group_members SET role = ? WHERE group_id = ? AND user_id = ?',
        [role, groupId, memberId],
        () => resolve(null)
      );
    });

    await GroupController.logOperation(userId, 'set_role', 'group', groupId, `设置成员 ${memberId} 角色为 ${role}`);

    ctx.body = { code: 200, message: '设置成功' };
  }

  static async createAnnouncement(ctx: AuthContext) {
    const userId = ctx.state.userId!;
    const { groupId, title, content, isPinned = 0 } = ctx.request.body as {
      groupId: string;
      title: string;
      content: string;
      isPinned?: number;
    };

    const member = await new Promise<any>((resolve) => {
      db.get(
        'SELECT * FROM group_members WHERE group_id = ? AND user_id = ?',
        [groupId, userId],
        (_, row) => resolve(row)
      );
    });

    if (!member || member.role === 0) {
      ctx.body = { code: 403, message: '无权限操作' };
      return;
    }

    await new Promise((resolve) => {
      db.run(
        'INSERT INTO group_announcements (group_id, publisher_id, title, content, is_pinned) VALUES (?, ?, ?, ?, ?)',
        [groupId, userId, title, content, isPinned],
        () => resolve(null)
      );
    });

    await GroupController.logOperation(userId, 'create_announcement', 'group', groupId, `发布公告: ${title}`);

    ctx.body = { code: 200, message: '发布成功' };
  }

  static async getAnnouncements(ctx: AuthContext) {
    const userId = ctx.state.userId!;
    const { groupId } = ctx.query as { groupId: string };

    const isMember = await GroupController.checkGroupMember(groupId, userId);
    if (!isMember) {
      ctx.body = { code: 403, message: '不是群成员' };
      return;
    }

    const announcements = await new Promise<any[]>((resolve) => {
      db.all(
        `SELECT ga.*, u.username as publisher_name
         FROM group_announcements ga
         JOIN users u ON ga.publisher_id = u.id
         WHERE ga.group_id = ?
         ORDER BY ga.is_pinned DESC, ga.created_at DESC`,
        [groupId],
        (_, rows) => resolve(rows || [])
      );
    });

    ctx.body = {
      code: 200,
      data: announcements.map((a: any) => ({
        id: a.id,
        title: a.title,
        content: a.content,
        publisherId: a.publisher_id,
        publisherName: a.publisher_name,
        isPinned: a.is_pinned,
        createdAt: a.created_at
      }))
    };
  }

  private static async checkGroupMember(groupId: string, userId: number): Promise<boolean> {
    return new Promise((resolve) => {
      db.get(
        'SELECT 1 FROM group_members WHERE group_id = ? AND user_id = ?',
        [groupId, userId],
        (_, row) => resolve(!!row)
      );
    });
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
