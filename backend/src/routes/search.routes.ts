import express from 'express';
import {
  search,
  getSearchSuggestions,
  getSearchHistory,
  clearSearchHistory,
  deleteSearchHistory,
  getHotSearches,
} from '../controllers/search.controller';
import { authenticate, optionalAuthenticate } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/', optionalAuthenticate, search);
router.get('/suggestions', getSearchSuggestions);
router.get('/history', authenticate, getSearchHistory);
router.delete('/history', authenticate, clearSearchHistory);
router.delete('/history/:id', authenticate, deleteSearchHistory);
router.get('/hot', getHotSearches);

export default router;
