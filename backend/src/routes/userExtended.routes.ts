import express from 'express';
import {
  updateProfileExtended,
  getPrivacySettings,
  updatePrivacySettings,
  getNotificationSettings,
  updateNotificationSettings,
  addToBlacklist,
  removeFromBlacklist,
  getBlacklist,
} from '../controllers/userExtended.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

router.put('/profile', authenticate, updateProfileExtended);
router.get('/privacy', authenticate, getPrivacySettings);
router.put('/privacy', authenticate, updatePrivacySettings);
router.get('/notification-settings', authenticate, getNotificationSettings);
router.put('/notification-settings', authenticate, updateNotificationSettings);
router.post('/blacklist', authenticate, addToBlacklist);
router.delete('/blacklist', authenticate, removeFromBlacklist);
router.get('/blacklist', authenticate, getBlacklist);

export default router;
