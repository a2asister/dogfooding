import express from 'express';
import {
  updateNote,
  deleteNoteToTrash,
  restoreNote,
  getTrashNotes,
  permanentlyDeleteNote,
  getNoteStats,
  getUserNotesStats,
  checkNoteSensitiveWords,
} from '../controllers/noteExtended.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

router.put('/:id', authenticate, updateNote);
router.delete('/:id', authenticate, deleteNoteToTrash);
router.post('/:id/restore', authenticate, restoreNote);
router.get('/trash/list', authenticate, getTrashNotes);
router.delete('/:id/permanent', authenticate, permanentlyDeleteNote);
router.get('/:id/stats', authenticate, getNoteStats);
router.get('/stats/summary', authenticate, getUserNotesStats);
router.post('/check-sensitive', checkNoteSensitiveWords);

export default router;
