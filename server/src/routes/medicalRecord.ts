import { Router } from 'express';
import { getMedicalRecord, saveMedicalRecord, getPatientRecords } from '../controllers/medicalRecord';
import { authMiddleware, requireRole } from '../middleware/auth';

const router = Router();

router.get('/visit/:visitId', authMiddleware, getMedicalRecord);
router.post('/', authMiddleware, requireRole('doctor', 'super_admin'), saveMedicalRecord);
router.get('/patient', authMiddleware, getPatientRecords);

export default router;
