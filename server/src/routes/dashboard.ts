import Router from 'koa-router';
import { authMiddleware } from '../middlewares/auth';
import { getDashboardStats } from '../controllers/dashboardController';

const router = new Router();

router.get('/stats', authMiddleware, getDashboardStats);

export default router;
