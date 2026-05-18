import express from 'express';
import {
  getTopicSquare,
  getTopicDetail,
  getTopicNotes,
  followTopic,
  getFollowedTopics,
} from '../controllers/topic.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/square', getTopicSquare);
router.get('/followed', authenticate, getFollowedTopics);
router.get('/:id', getTopicDetail);
router.get('/:id/notes', getTopicNotes);
router.post('/:id/follow', authenticate, followTopic);

export default router;
