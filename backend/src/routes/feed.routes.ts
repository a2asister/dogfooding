import express from 'express';
import {
  getHotFeed,
  getNearbyFeed,
  dislikeNote,
  blockUser,
  blockTopic,
  getBlockList,
} from '../controllers/feed.controller';
import { authenticate, optionalAuthenticate } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/hot', optionalAuthenticate, getHotFeed);
router.get('/nearby', optionalAuthenticate, getNearbyFeed);
router.post('/dislike/:id', authenticate, dislikeNote);
router.post('/block/user', authenticate, blockUser);
router.post('/block/topic', authenticate, blockTopic);
router.get('/blocks', authenticate, getBlockList);

export default router;
