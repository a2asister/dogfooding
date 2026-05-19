import { Router } from 'express';
import * as promotionController from '../controllers/promotion.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/plans', promotionController.getPromotionPlans);
router.post('/', authenticate, promotionController.createPromotion);
router.post('/:promotionId/activate', authenticate, promotionController.activatePromotion);
router.get('/:promotionId', authenticate, promotionController.getPromotion);
router.get('/', authenticate, promotionController.getUserPromotions);
router.post('/:promotionId/pause', authenticate, promotionController.pausePromotion);
router.post('/:promotionId/resume', authenticate, promotionController.resumePromotion);
router.post('/:promotionId/cancel', authenticate, promotionController.cancelPromotion);
router.get('/:promotionId/performance', authenticate, promotionController.getPromotionPerformance);

export default router;
