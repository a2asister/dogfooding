import { Router } from 'express';
import * as orderController from '../controllers/order.controller';
import { authenticate, optionalAuthenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/membership', authenticate, orderController.createMembershipOrder);
router.post('/promotion', authenticate, orderController.createPromotionOrder);
router.post('/private-note', authenticate, orderController.createPrivateNoteOrder);
router.post('/product', authenticate, orderController.createProductOrder);
router.post('/:id/pay', authenticate, orderController.processPayment);
router.get('/:id', authenticate, orderController.getOrder);
router.get('/no/:orderNo', authenticate, orderController.getOrderByNo);
router.get('/', authenticate, orderController.getUserOrders);
router.post('/:id/cancel', authenticate, orderController.cancelOrder);

export default router;
