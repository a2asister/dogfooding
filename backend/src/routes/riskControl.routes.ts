import { Router } from 'express';
import * as riskControlController from '../controllers/riskControl.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/behavior-risks', authenticate, riskControlController.getBehaviorRisks);
router.get('/account-risks', authenticate, riskControlController.getAccountRisks);
router.post('/behavior-risks/:riskId/process', authenticate, riskControlController.processBehaviorRisk);
router.post('/account-risks/:riskId/process', authenticate, riskControlController.processAccountRisk);
router.post('/behavior-risks/batch-process', authenticate, riskControlController.batchProcessBehaviorRisks);
router.post('/account-risks/batch-process', authenticate, riskControlController.batchProcessAccountRisks);
router.get('/login-logs', authenticate, riskControlController.getLoginLogs);
router.get('/register-logs', authenticate, riskControlController.getRegisterLogs);
router.get('/suspicious-registers', authenticate, riskControlController.getSuspiciousRegisters);

export default router;
