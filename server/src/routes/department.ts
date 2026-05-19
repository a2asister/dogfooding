import { Router } from 'express';
import {
  getDepartments,
  getAllDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from '../controllers/department';
import { authMiddleware, requireRole } from '../middleware/auth';

const router = Router();

router.get('/', getDepartments);
router.get('/all', authMiddleware, requireRole('super_admin', 'hospital_admin'), getAllDepartments);
router.post('/', authMiddleware, requireRole('super_admin', 'hospital_admin'), createDepartment);
router.put('/:id', authMiddleware, requireRole('super_admin', 'hospital_admin'), updateDepartment);
router.delete('/:id', authMiddleware, requireRole('super_admin', 'hospital_admin'), deleteDepartment);

export default router;
