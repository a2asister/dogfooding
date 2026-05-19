import { Router } from 'express';
import { getDoctors, getDoctorDetail, getDoctorSchedules } from '../controllers/doctor';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', authMiddleware, getDoctors);
router.get('/:id', authMiddleware, getDoctorDetail);
router.get('/:doctorId/schedules', authMiddleware, getDoctorSchedules);

export default router;
