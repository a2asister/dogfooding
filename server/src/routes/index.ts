import Router from 'koa-router';
import authRoutes from './auth';
import orderRoutes from './order';
import waybillRoutes from './waybill';
import dashboardRoutes from './dashboard';
import branchRoutes from './branch';
import vehicleRoutes from './vehicle';
import userRoutes from './user';
import exceptionRoutes from './exception';
import returnRoutes from './return';
import feedbackRoutes from './feedback';
import inventoryRoutes from './inventory';

const router = new Router();

router.get('/health', (ctx) => {
  ctx.body = {
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString()
  };
});

router.use('/auth', authRoutes.routes());
router.use('/orders', orderRoutes.routes());
router.use('/waybills', waybillRoutes.routes());
router.use('/dashboard', dashboardRoutes.routes());
router.use('/branches', branchRoutes.routes());
router.use('/vehicles', vehicleRoutes.routes());
router.use('/users', userRoutes.routes());
router.use('/exceptions', exceptionRoutes.routes());
router.use('/returns', returnRoutes.routes());
router.use('/feedbacks', feedbackRoutes.routes());
router.use('/inventory', inventoryRoutes.routes());

export default router;
