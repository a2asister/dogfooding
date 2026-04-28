import Router from 'koa-router';
import { authMiddleware } from '../middlewares/auth';
import {
  getVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  updateVehicleStatus,
  assignDriver,
  deleteVehicle
} from '../controllers/vehicleController';

const router = new Router();

router.get('/', authMiddleware, getVehicles);
router.get('/:id', authMiddleware, getVehicleById);
router.post('/', authMiddleware, createVehicle);
router.put('/:id', authMiddleware, updateVehicle);
router.put('/:id/status', authMiddleware, updateVehicleStatus);
router.put('/:id/assign', authMiddleware, assignDriver);
router.delete('/:id', authMiddleware, deleteVehicle);

export default router;
