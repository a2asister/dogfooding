import Router from 'koa-router';
import { login, logout, getCurrentUser, changePassword } from '../controllers/authController';
import { authMiddleware, roleMiddleware } from '../middleware/auth';

const router = new Router({ prefix: '/api/auth' });

router.post('/login', login);
router.post('/logout', authMiddleware, logout);
router.get('/info', authMiddleware, getCurrentUser);
router.post('/password', authMiddleware, changePassword);

export default router;
