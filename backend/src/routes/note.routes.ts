import { Router } from 'express';
import * as noteController from '../controllers/note.controller';
import { authenticate, optionalAuthenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authenticate, noteController.createNote);
router.get('/', optionalAuthenticate, noteController.getNoteList);
router.get('/drafts', authenticate, noteController.getDrafts);
router.get('/:id', optionalAuthenticate, noteController.getNoteDetail);
router.post('/:id/like', authenticate, noteController.likeNote);
router.post('/:id/favorite', authenticate, noteController.favoriteNote);
router.post('/:id/share', noteController.shareNote);
router.delete('/drafts/:id', authenticate, noteController.deleteDraft);
router.post('/drafts/:id/publish', authenticate, noteController.publishDraft);

export default router;
