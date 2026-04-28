import Router from 'koa-router';
import { 
  getWaybills, 
  getWaybillById, 
  getWaybillByNo, 
  updateWaybillStatus,
  assignCourier
} from '../controllers/waybillController';
import { authMiddleware } from '../middlewares/auth';

const router = new Router();

router.get('/no/:waybillNo', getWaybillByNo);

router.use(authMiddleware);

router.get('/', getWaybills);
router.get('/:id', getWaybillById);
router.put('/:id/status', updateWaybillStatus);
router.post('/:id/assign', assignCourier);

export default router;
