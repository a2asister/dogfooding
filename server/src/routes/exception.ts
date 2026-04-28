import Router from 'koa-router';
import { authMiddleware } from '../middlewares/auth';
import {
  getExceptions,
  getExceptionById,
  createException,
  updateException,
  updateExceptionStatus,
  assignResponsiblePerson
} from '../controllers/exceptionController';

const router = new Router();

router.get('/', authMiddleware, getExceptions);
router.get('/:id', authMiddleware, getExceptionById);
router.post('/', authMiddleware, createException);
router.put('/:id', authMiddleware, updateException);
router.put('/:id/status', authMiddleware, updateExceptionStatus);
router.put('/:id/assign', authMiddleware, assignResponsiblePerson);

export default router;
