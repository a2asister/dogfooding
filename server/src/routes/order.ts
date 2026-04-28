import Router from 'koa-router';
import { 
  createOrder, 
  getOrders, 
  getOrderById, 
  updateOrder, 
  cancelOrder 
} from '../controllers/orderController';
import { authMiddleware } from '../middlewares/auth';

const router = new Router();

router.use(authMiddleware);

router.post('/', createOrder);
router.get('/', getOrders);
router.get('/:id', getOrderById);
router.put('/:id', updateOrder);
router.post('/:id/cancel', cancelOrder);

export default router;
