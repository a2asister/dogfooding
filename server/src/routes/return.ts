import Router from 'koa-router';
import { authMiddleware } from '../middlewares/auth';
import {
  getReturns,
  getReturnById,
  createReturn,
  approveReturn,
  rejectReturn,
  updateReturnStatus,
  getClaims,
  getClaimById,
  createClaim,
  updateClaim
} from '../controllers/returnController';

const router = new Router();

router.get('/returns', authMiddleware, getReturns);
router.get('/returns/:id', authMiddleware, getReturnById);
router.post('/returns', authMiddleware, createReturn);
router.put('/returns/:id/approve', authMiddleware, approveReturn);
router.put('/returns/:id/reject', authMiddleware, rejectReturn);
router.put('/returns/:id/status', authMiddleware, updateReturnStatus);

router.get('/claims', authMiddleware, getClaims);
router.get('/claims/:id', authMiddleware, getClaimById);
router.post('/claims', authMiddleware, createClaim);
router.put('/claims/:id', authMiddleware, updateClaim);

export default router;
