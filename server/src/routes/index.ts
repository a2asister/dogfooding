import Router from 'koa-router';
import { UserController } from '../controllers/UserController';
import { FriendController } from '../controllers/FriendController';
import { MessageController } from '../controllers/MessageController';
import { authMiddleware } from '../middleware/auth';

const router = new Router({ prefix: '/api' });

router.post('/register', UserController.register);
router.post('/login', UserController.login);
router.get('/user/info', authMiddleware, UserController.getUserInfo);
router.get('/user/search', authMiddleware, UserController.searchUser);

router.get('/friends', authMiddleware, FriendController.getFriends);
router.post('/friends/add', authMiddleware, FriendController.addFriend);
router.post('/friends/delete', authMiddleware, FriendController.deleteFriend);

router.get('/messages/history', authMiddleware, MessageController.getHistoryMessages);
router.post('/messages/read', authMiddleware, MessageController.markAsRead);

export default router;
