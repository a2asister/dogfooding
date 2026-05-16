import Router from 'koa-router';
import { UserController } from '../controllers/UserController';
import { FriendController } from '../controllers/FriendController';
import { MessageController } from '../controllers/MessageController';
import { GroupController } from '../controllers/GroupController';
import { UploadController } from '../controllers/UploadController';
import { authMiddleware } from '../middleware/auth';

const router = new Router({ prefix: '/api' });

router.post('/register', UserController.register);
router.post('/login', UserController.login);
router.get('/user/info', authMiddleware, UserController.getUserInfo);
router.get('/user/search', authMiddleware, UserController.searchUser);

router.get('/friends', authMiddleware, FriendController.getFriends);
router.post('/friends/add', authMiddleware, FriendController.addFriend);
router.post('/friends/delete', authMiddleware, FriendController.deleteFriend);
router.post('/friends/remark', authMiddleware, FriendController.updateRemark);

router.get('/friends/groups', authMiddleware, FriendController.getGroups);
router.post('/friends/groups/create', authMiddleware, FriendController.createGroup);
router.post('/friends/groups/delete', authMiddleware, FriendController.deleteGroup);
router.post('/friends/groups/update', authMiddleware, FriendController.updateGroup);
router.post('/friends/groups/move', authMiddleware, FriendController.moveFriendToGroup);
router.get('/friends/groups/members', authMiddleware, FriendController.getGroupFriends);

router.get('/messages/history', authMiddleware, MessageController.getHistoryMessages);
router.post('/messages/read', authMiddleware, MessageController.markAsRead);
router.post('/messages/recall', authMiddleware, MessageController.recallMessage);
router.post('/messages/delete', authMiddleware, MessageController.deleteMessage);
router.get('/messages/unread', authMiddleware, MessageController.getUnreadCount);
router.get('/messages/read-status', authMiddleware, MessageController.getMessageReadStatus);

router.get('/groups', authMiddleware, GroupController.getMyGroups);
router.get('/groups/info', authMiddleware, GroupController.getGroupInfo);
router.post('/groups/create', authMiddleware, GroupController.createGroup);
router.post('/groups/dismiss', authMiddleware, GroupController.dismissGroup);
router.post('/groups/update', authMiddleware, GroupController.updateGroupInfo);
router.post('/groups/add-members', authMiddleware, GroupController.addMembers);
router.post('/groups/remove-member', authMiddleware, GroupController.removeMember);
router.post('/groups/leave', authMiddleware, GroupController.leaveGroup);
router.post('/groups/set-role', authMiddleware, GroupController.setMemberRole);
router.post('/groups/announcement/create', authMiddleware, GroupController.createAnnouncement);
router.get('/groups/announcements', authMiddleware, GroupController.getAnnouncements);

router.post('/upload/image', authMiddleware, UploadController.uploadImage);
router.post('/upload/file', authMiddleware, UploadController.uploadFile);
router.get('/uploads/:fileName', authMiddleware, UploadController.downloadFile);

export default router;
