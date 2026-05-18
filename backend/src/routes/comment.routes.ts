import express from 'express';
import {
  createComment,
  getCommentList,
  getReplyList,
  likeComment,
  deleteComment,
  pinComment,
} from '../controllers/comment.controller';
import { authenticate, optionalAuthenticate } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/', authenticate, createComment);
router.get('/', optionalAuthenticate, getCommentList);
router.get('/replies', optionalAuthenticate, getReplyList);
router.post('/like/:id', authenticate, likeComment);
router.delete('/:id', authenticate, deleteComment);
router.post('/pin/:id', authenticate, pinComment);

export default router;
