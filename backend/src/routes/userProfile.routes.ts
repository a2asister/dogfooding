import { Router } from 'express';
import * as userProfileController from '../controllers/userProfile.controller';
import { authenticate, optionalAuthenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/profile', authenticate, userProfileController.getUserProfile);
router.get('/tags', authenticate, userProfileController.getUserTags);
router.post('/tags/generate', authenticate, userProfileController.generateUserTags);
router.post('/behavior', authenticate, userProfileController.recordBehavior);
router.get('/tags/all', optionalAuthenticate, userProfileController.getAllTags);

export default router;
