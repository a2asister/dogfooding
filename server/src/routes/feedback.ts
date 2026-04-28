import Router from 'koa-router';
import { authMiddleware } from '../middlewares/auth';
import {
  getFeedbacks,
  getFeedbackById,
  createFeedback,
  assignFeedback,
  respondFeedback,
  closeFeedback
} from '../controllers/feedbackController';

const router = new Router();

router.get('/', authMiddleware, getFeedbacks);
router.get('/:id', authMiddleware, getFeedbackById);
router.post('/', authMiddleware, createFeedback);
router.put('/:id/assign', authMiddleware, assignFeedback);
router.put('/:id/respond', authMiddleware, respondFeedback);
router.put('/:id/close', authMiddleware, closeFeedback);

export default router;
