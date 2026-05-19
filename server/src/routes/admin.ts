import { Router } from 'express';
import {
  getAccounts,
  createAccount,
  updateAccount,
  resetPassword,
  getScheduleConfig,
  saveScheduleConfig,
  toggleSchedule,
  getStatistics,
} from '../controllers/admin';
import { authMiddleware, requireRole } from '../middleware/auth';

const router = Router();

router.get('/accounts', authMiddleware, requireRole('super_admin', 'hospital_admin'), getAccounts);
router.post('/accounts', authMiddleware, requireRole('super_admin', 'hospital_admin'), createAccount);
router.put('/accounts/:id', authMiddleware, requireRole('super_admin', 'hospital_admin'), updateAccount);
router.put('/accounts/:id/reset-password', authMiddleware, requireRole('super_admin', 'hospital_admin'), resetPassword);

router.get('/schedule/config', authMiddleware, requireRole('super_admin', 'hospital_admin'), getScheduleConfig);
router.post('/schedule/config', authMiddleware, requireRole('super_admin', 'hospital_admin'), saveScheduleConfig);
router.put('/schedule/:id/toggle', authMiddleware, requireRole('super_admin', 'hospital_admin'), toggleSchedule);

router.get('/statistics/overview', authMiddleware, requireRole('super_admin', 'hospital_admin'), getStatistics);

export default router;
