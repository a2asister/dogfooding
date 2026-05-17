import { Router } from 'express';
import * as adminController from '../controllers/admin.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/notes/pending', adminController.getPendingNotes);
router.post('/notes/:id/approve', adminController.approveNote);
router.post('/notes/:id/reject', adminController.rejectNote);
router.post('/notes/:id/take-down', adminController.takeDownNote);
router.get('/users', adminController.getUserList);
router.post('/users/:id/toggle-status', adminController.toggleUserStatus);
router.get('/configs', adminController.getSystemConfigs);
router.put('/configs', adminController.updateSystemConfig);

export default router;
