import { Router } from 'express';
import { login, register, getProfile, updatePassword, updateProfile } from '../controllers/auth';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.get('/profile', authMiddleware, getProfile);
router.put('/password', authMiddleware, updatePassword);
router.put('/profile', authMiddleware, updateProfile);

export default router;
