import Router from 'koa-router';
import { authMiddleware } from '../middlewares/auth';
import {
  getInventoryItems,
  getInventoryItemById,
  createInventoryItem,
  updateInventoryItem,
  updateStock,
  deleteInventoryItem
} from '../controllers/inventoryController';

const router = new Router();

router.get('/', authMiddleware, getInventoryItems);
router.get('/:id', authMiddleware, getInventoryItemById);
router.post('/', authMiddleware, createInventoryItem);
router.put('/:id', authMiddleware, updateInventoryItem);
router.put('/:id/stock', authMiddleware, updateStock);
router.delete('/:id', authMiddleware, deleteInventoryItem);

export default router;
