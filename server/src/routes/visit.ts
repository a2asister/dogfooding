import { Router } from 'express';
import { getTodayVisits, receiveVisit, finishVisit, createWalkInVisit } from '../controllers/visit';
import { authMiddleware, requireRole } from '../middleware/auth';

const router = Router();

router.get('/today', authMiddleware, requireRole('doctor', 'nurse', 'super_admin', 'hospital_admin'), getTodayVisits);
router.put('/:id/receive', authMiddleware, requireRole('doctor', 'super_admin'), receiveVisit);
router.put('/:id/finish', authMiddleware, requireRole('doctor', 'super_admin'), finishVisit);
router.post('/walk-in', authMiddleware, requireRole('doctor', 'nurse', 'super_admin', 'hospital_admin'), createWalkInVisit);

export default router;
