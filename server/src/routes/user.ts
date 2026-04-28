import Router from 'koa-router';
import { authMiddleware } from '../middlewares/auth';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  updateUserStatus,
  resetPassword,
  deleteUser
} from '../controllers/userController';

const router = new Router();

router.get('/', authMiddleware, getUsers);
router.get('/:id', authMiddleware, getUserById);
router.post('/', authMiddleware, createUser);
router.put('/:id', authMiddleware, updateUser);
router.put('/:id/status', authMiddleware, updateUserStatus);
router.put('/:id/reset-password', authMiddleware, resetPassword);
router.delete('/:id', authMiddleware, deleteUser);

export default router;
