import express from 'express';
import {
  createCollection,
  getCollectionList,
  getCollectionDetail,
  getCollectionItems,
  addNoteToCollection,
  removeNoteFromCollection,
  updateCollection,
  deleteCollection,
  batchAddToCollection,
} from '../controllers/collection.controller';
import { authenticate, optionalAuthenticate } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/', authenticate, createCollection);
router.get('/', optionalAuthenticate, getCollectionList);
router.get('/:id', optionalAuthenticate, getCollectionDetail);
router.get('/:id/items', optionalAuthenticate, getCollectionItems);
router.post('/items', authenticate, addNoteToCollection);
router.delete('/items', authenticate, removeNoteFromCollection);
router.post('/items/batch', authenticate, batchAddToCollection);
router.put('/:id', authenticate, updateCollection);
router.delete('/:id', authenticate, deleteCollection);

export default router;
