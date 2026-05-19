import { Router } from 'express';
import * as analyticsController from '../controllers/analytics.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/overview', analyticsController.getOverview);
router.get('/daily', analyticsController.getDailyStats);
router.get('/retention', analyticsController.getRetentionStats);
router.get('/engagement', analyticsController.getEngagementStats);
router.get('/content', analyticsController.getContentPerformance);
router.post('/daily', authenticate, analyticsController.generateDailyStats);
router.get('/range', authenticate, analyticsController.getStatsRange);
router.get('/realtime', analyticsController.getRealtimeStats);
router.post('/traffic', authenticate, analyticsController.recordTrafficSource);
router.get('/traffic-sources', authenticate, analyticsController.getTrafficSources);

export default router;
