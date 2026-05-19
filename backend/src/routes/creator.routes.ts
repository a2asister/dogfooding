import { Router } from 'express';
import * as creatorController from '../controllers/creator.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/overview', authenticate, creatorController.getCreatorOverview);
router.get('/data', authenticate, creatorController.getCreatorDataRange);
router.post('/data/generate', authenticate, creatorController.generateDailyData);

router.post('/verification/apply', authenticate, creatorController.applyForVerification);
router.post('/verification/:verificationId/review', authenticate, creatorController.reviewVerification);
router.get('/verifications', authenticate, creatorController.getVerifications);
router.get('/verification/me', authenticate, creatorController.getMyVerification);

export default router;
