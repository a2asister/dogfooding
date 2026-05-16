import { FriendController } from '../../../src/controllers/friendcontroller';
import db from '../../../src/config/database';

jest.mock('../../../src/config/database', () => ({
  run: jest.fn(),
  get: jest.fn(),
  all: jest.fn(),
}));

describe('FriendController', () => {
  let ctx: any;

  beforeEach(() => {
    jest.clearAllMocks();
    ctx = {
      request: { body: {} },
      body: null,
      state: { userId: 1 },
      query: {},
    };
  });

  describe('getFriends', () => {
    it('should return friends list', async () => {
      const mockFriends = [
        { friend_id: 2, username: 'friend1', avatar: 'avatar1.jpg', remark: '备注1', group_id: 1, group_name: '好友', created_at: '2024-01-01' },
        { friend_id: 3, username: 'friend2', avatar: 'avatar2.jpg', remark: null, group_id: null, group_name: null, created_at: '2024-01-02' },
      ];
      (db.all as jest.Mock).mockImplementation((_query: string, _params: any[], callback: (_err: any, rows: any[]) => void) => {
        callback(null, mockFriends);
      });

      await FriendController.getFriends(ctx);
      expect(ctx.body).toEqual({
        code: 200,
        data: [
          { id: 2, username: 'friend1', avatar: 'avatar1.jpg', remark: '备注1', groupId: 1, groupName: '好友', createdAt: '2024-01-01' },
          { id: 3, username: 'friend2', avatar: 'avatar2.jpg', remark: null, groupId: null, groupName: null, createdAt: '2024-01-02' },
        ],
      });
    });

    it('should return empty array when no friends', async () => {
      (db.all as jest.Mock).mockImplementation((_query: string, _params: any[], callback: (_err: any, rows: any[]) => void) => {
        callback(null, []);
      });

      await FriendController.getFriends(ctx);
      expect(ctx.body).toEqual({ code: 200, data: [] });
    });
  });

  describe('addFriend', () => {
    it('should return error when trying to add self', async () => {
      ctx.request.body = { friendId: 1 };
      await FriendController.addFriend(ctx);
      expect(ctx.body).toEqual({ code: 400, message: '不能添加自己为好友' });
    });

    it('should return error when already friends', async () => {
      ctx.request.body = { friendId: 2 };
      (db.get as jest.Mock).mockImplementation((_query: string, _params: any[], callback: (_err: any, row: any) => void) => {
        callback(null, { '1': 1 });
      });

      await FriendController.addFriend(ctx);
      expect(ctx.body).toEqual({ code: 400, message: '已经是好友了' });
    });

    it('should add friend successfully', async () => {
      ctx.request.body = { friendId: 2, remark: '新好友' };
      (db.get as jest.Mock).mockImplementation((_query: string, _params: any[], callback: (_err: any, row: any) => void) => {
        callback(null, null);
      });
      (db.run as jest.Mock).mockImplementation((_query: string, _params: any[], callback: () => void) => {
        callback();
      });

      await FriendController.addFriend(ctx);
      expect(ctx.body).toEqual({ code: 200, message: '添加成功' });
    });

    it('should add friend without remark', async () => {
      ctx.request.body = { friendId: 2 };
      (db.get as jest.Mock).mockImplementation((_query: string, _params: any[], callback: (_err: any, row: any) => void) => {
        callback(null, null);
      });
      (db.run as jest.Mock).mockImplementation((_query: string, _params: any[], callback: () => void) => {
        callback();
      });

      await FriendController.addFriend(ctx);
      expect(ctx.body).toEqual({ code: 200, message: '添加成功' });
    });
  });

  describe('deleteFriend', () => {
    it('should delete friend successfully', async () => {
      ctx.request.body = { friendId: 2 };
      (db.run as jest.Mock).mockImplementation((_query: string, _params: any[], callback: () => void) => {
        callback();
      });

      await FriendController.deleteFriend(ctx);
      expect(ctx.body).toEqual({ code: 200, message: '删除成功' });
    });
  });

  describe('updateRemark', () => {
    it('should update friend remark successfully', async () => {
      ctx.request.body = { friendId: 2, remark: '新备注' };
      (db.run as jest.Mock).mockImplementation((_query: string, _params: any[], callback: () => void) => {
        callback();
      });

      await FriendController.updateRemark(ctx);
      expect(ctx.body).toEqual({ code: 200, message: '更新成功' });
    });
  });

  describe('createGroup', () => {
    it('should return error when group name is empty', async () => {
      ctx.request.body = { groupName: '' };
      await FriendController.createGroup(ctx);
      expect(ctx.body).toEqual({ code: 400, message: '分组名称不能为空' });
    });

    it('should create group successfully', async () => {
      ctx.request.body = { groupName: '新分组' };
      (db.run as jest.Mock).mockImplementation(function (_query: string, _params: any[], callback: () => void) {
        callback.call({ lastID: 1 });
      });

      await FriendController.createGroup(ctx);
      expect(ctx.body).toEqual({
        code: 200,
        message: '创建成功',
        data: { groupId: 1, groupName: '新分组' },
      });
    });
  });

  describe('deleteGroup', () => {
    it('should delete group successfully', async () => {
      ctx.request.body = { groupId: 1 };
      (db.run as jest.Mock).mockImplementation((_query: string, _params: any[], callback: () => void) => {
        callback();
      });

      await FriendController.deleteGroup(ctx);
      expect(ctx.body).toEqual({ code: 200, message: '删除成功' });
    });
  });

  describe('updateGroup', () => {
    it('should update group name successfully', async () => {
      ctx.request.body = { groupId: 1, groupName: '更新后的分组' };
      (db.run as jest.Mock).mockImplementation((_query: string, _params: any[], callback: () => void) => {
        callback();
      });

      await FriendController.updateGroup(ctx);
      expect(ctx.body).toEqual({ code: 200, message: '更新成功' });
    });
  });

  describe('moveFriendToGroup', () => {
    it('should move friend to group successfully', async () => {
      ctx.request.body = { friendId: 2, groupId: 1 };
      (db.run as jest.Mock).mockImplementation((_query: string, _params: any[], callback: () => void) => {
        callback();
      });

      await FriendController.moveFriendToGroup(ctx);
      expect(ctx.body).toEqual({ code: 200, message: '移动成功' });
    });

    it('should move friend to ungrouped (null)', async () => {
      ctx.request.body = { friendId: 2, groupId: null };
      (db.run as jest.Mock).mockImplementation((_query: string, _params: any[], callback: () => void) => {
        callback();
      });

      await FriendController.moveFriendToGroup(ctx);
      expect(ctx.body).toEqual({ code: 200, message: '移动成功' });
    });
  });

  describe('getGroups', () => {
    it('should return groups list with ungrouped count', async () => {
      const mockGroups = [
        { id: 1, group_name: '好友', sort_order: 0, friend_count: 2, created_at: '2024-01-01' },
        { id: 2, group_name: '同事', sort_order: 1, friend_count: 1, created_at: '2024-01-02' },
      ];
      (db.all as jest.Mock).mockImplementation((_query: string, _params: any[], callback: (_err: any, rows: any[]) => void) => {
        callback(null, mockGroups);
      });
      (db.get as jest.Mock).mockImplementation((_query: string, _params: any[], callback: (_err: any, row: any) => void) => {
        callback(null, { count: 3 });
      });

      await FriendController.getGroups(ctx);
      expect(ctx.body).toEqual({
        code: 200,
        data: {
          groups: [
            { id: 1, groupName: '好友', sortOrder: 0, friendCount: 2, createdAt: '2024-01-01' },
            { id: 2, groupName: '同事', sortOrder: 1, friendCount: 1, createdAt: '2024-01-02' },
          ],
          ungroupedCount: 3,
        },
      });
    });

    it('should return zero for ungrouped count when no ungrouped friends', async () => {
      const mockGroups = [
        { id: 1, group_name: '好友', sort_order: 0, friend_count: 2, created_at: '2024-01-01' },
      ];
      (db.all as jest.Mock).mockImplementation((_query: string, _params: any[], callback: (_err: any, rows: any[]) => void) => {
        callback(null, mockGroups);
      });
      (db.get as jest.Mock).mockImplementation((_query: string, _params: any[], callback: (_err: any, row: any) => void) => {
        callback(null, { count: 0 });
      });

      await FriendController.getGroups(ctx);
      expect(ctx.body?.data.ungroupedCount).toBe(0);
    });
  });

  describe('getGroupFriends', () => {
    it('should return ungrouped friends', async () => {
      ctx.query = { groupId: 'ungrouped' };
      const mockFriends = [
        { friend_id: 2, username: 'friend1', avatar: 'avatar1.jpg', remark: '备注1', created_at: '2024-01-01' },
      ];
      (db.all as jest.Mock).mockImplementation((_query: string, _params: any[], callback: (_err: any, rows: any[]) => void) => {
        callback(null, mockFriends);
      });

      await FriendController.getGroupFriends(ctx);
      expect(ctx.body).toEqual({
        code: 200,
        data: [
          { id: 2, username: 'friend1', avatar: 'avatar1.jpg', remark: '备注1', createdAt: '2024-01-01' },
        ],
      });
    });

    it('should return friends in specific group', async () => {
      ctx.query = { groupId: '1' };
      const mockFriends = [
        { friend_id: 2, username: 'friend1', avatar: 'avatar1.jpg', remark: '备注1', created_at: '2024-01-01' },
        { friend_id: 3, username: 'friend2', avatar: 'avatar2.jpg', remark: '备注2', created_at: '2024-01-02' },
      ];
      (db.all as jest.Mock).mockImplementation((_query: string, _params: any[], callback: (_err: any, rows: any[]) => void) => {
        callback(null, mockFriends);
      });

      await FriendController.getGroupFriends(ctx);
      expect(ctx.body?.data.length).toBe(2);
    });

    it('should return empty array when groupId not provided', async () => {
      ctx.query = {};
      await FriendController.getGroupFriends(ctx);
      expect(ctx.body?.data).toEqual([]);
    });
  });
});
