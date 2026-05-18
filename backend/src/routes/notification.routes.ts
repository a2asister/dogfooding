import express from 'express';
import {
  getNotificationList,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  deleteNotification,
  clearAllNotifications,
} from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/', authenticate, getNotificationList);
router.get('/unread-count', authenticate, getUnreadCount);
router.post('/:id/read', authenticate, markAsRead);
router.post('/read-all', authenticate, markAllAsRead);
router.delete('/:id', authenticate, deleteNotification);
router.delete('/', authenticate, clearAllNotifications);

export default router;
