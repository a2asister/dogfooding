import { Router } from 'express';
import * as creatorReportController from '../controllers/creatorReport.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authenticate, creatorReportController.generateCreatorReport);
router.get('/', authenticate, creatorReportController.getCreatorReports);
router.get('/latest', authenticate, creatorReportController.getLatestReport);
router.post('/generate-daily', authenticate, creatorReportController.generateAllDailyReports);
router.post('/generate-weekly', authenticate, creatorReportController.generateWeeklyReports);

export default router;
