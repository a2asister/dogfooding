import { Router } from 'express';
import {
  getDictionary,
  getAllDictionaries,
  createDictionary,
  updateDictionary,
  deleteDictionary,
  getOperationLogs,
} from '../controllers/dictionary';
import { authMiddleware, requireRole } from '../middleware/auth';

const router = Router();

router.get('/type/:type', getDictionary);
router.get('/all', authMiddleware, requireRole('super_admin'), getAllDictionaries);
router.post('/', authMiddleware, requireRole('super_admin'), createDictionary);
router.put('/:id', authMiddleware, requireRole('super_admin'), updateDictionary);
router.delete('/:id', authMiddleware, requireRole('super_admin'), deleteDictionary);

router.get('/operation-logs', authMiddleware, requireRole('super_admin'), getOperationLogs);

export default router;
