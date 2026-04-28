import Router from 'koa-router';
import { authMiddleware } from '../middlewares/auth';
import {
  getBranches,
  getBranchById,
  createBranch,
  updateBranch,
  updateBranchStatus,
  deleteBranch
} from '../controllers/branchController';

const router = new Router();

router.get('/', authMiddleware, getBranches);
router.get('/:id', authMiddleware, getBranchById);
router.post('/', authMiddleware, createBranch);
router.put('/:id', authMiddleware, updateBranch);
router.put('/:id/status', authMiddleware, updateBranchStatus);
router.delete('/:id', authMiddleware, deleteBranch);

export default router;
