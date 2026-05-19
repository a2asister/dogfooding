import { Router } from 'express';
import * as messageController from '../controllers/message.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authenticate, messageController.sendMessage);
router.get('/conversations', authenticate, messageController.getConversations);
router.get('/conversations/:conversationId/messages', authenticate, messageController.getConversationMessages);
router.post('/conversations/:conversationId/read', authenticate, messageController.markMessagesAsRead);
router.delete('/:messageId', authenticate, messageController.deleteMessage);
router.post('/:messageId/recall', authenticate, messageController.recallMessage);
router.delete('/conversations/:conversationId', authenticate, messageController.deleteConversation);
router.post('/conversations/:conversationId/block', authenticate, messageController.blockConversation);
router.post('/conversations/:conversationId/unblock', authenticate, messageController.unblockConversation);
router.get('/unread-count', authenticate, messageController.getUnreadCount);

export default router;
