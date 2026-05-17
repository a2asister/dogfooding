import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authenticate, optionalAuthenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/:id', optionalAuthenticate, userController.getUserProfile);
router.post('/:id/follow', authenticate, userController.followUser);
router.put('/profile', authenticate, userController.updateProfile);

export default router;
