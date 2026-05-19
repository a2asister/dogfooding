import { Router } from 'express';
import * as earningController from '../controllers/earning.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/summary', authenticate, earningController.getEarningsSummary);
router.get('/', authenticate, earningController.getEarnings);
router.get('/range', authenticate, earningController.getEarningsByDateRange);
router.post('/withdrawal', authenticate, earningController.createWithdrawal);
router.get('/withdrawals', authenticate, earningController.getWithdrawals);
router.post('/tip', authenticate, earningController.createTip);

export default router;
