import { Router } from 'express';
import * as contentReviewController from '../controllers/contentReview.controller';
import { authenticate, optionalAuthenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/tasks/pending', authenticate, contentReviewController.getPendingTasks);
router.post('/tasks/:taskId/review', authenticate, contentReviewController.reviewTask);
router.post('/tasks/batch-review', authenticate, contentReviewController.batchReviewTasks);
router.post('/content-restriction', authenticate, contentReviewController.createContentRestriction);
router.post('/user-restriction', authenticate, contentReviewController.createUserRestriction);
router.post('/user-restriction/:restrictionId/lift', authenticate, contentReviewController.liftUserRestriction);
router.get('/user-restriction/check', authenticate, contentReviewController.checkUserRestriction);
router.post('/detect', optionalAuthenticate, contentReviewController.detectContentViolation);
router.get('/logs', authenticate, contentReviewController.getReviewLogs);
router.get('/content-restrictions', authenticate, contentReviewController.getContentRestrictions);
router.get('/user-restrictions', authenticate, contentReviewController.getUserRestrictions);

export default router;
