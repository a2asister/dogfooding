import { Router } from 'express';
import * as recommendController from '../controllers/recommend.controller';
import { authenticate, optionalAuthenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/personalized', optionalAuthenticate, recommendController.getPersonalizedFeed);
router.get('/hot', optionalAuthenticate, recommendController.getHotFeed);
router.put('/:recommendId/interaction', authenticate, recommendController.updateRecommendInteraction);
router.get('/stats', authenticate, recommendController.getRecommendStats);

export default router;
