import { Router } from 'express';
import { getAppointments, createAppointment, cancelAppointment } from '../controllers/appointment';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', authMiddleware, getAppointments);
router.post('/', authMiddleware, createAppointment);
router.put('/:id/cancel', authMiddleware, cancelAppointment);

export default router;
