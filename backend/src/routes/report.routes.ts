import express from 'express';
import {
  createReport,
  getReportList,
  handleReport,
  getUserReportList,
} from '../controllers/report.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/', authenticate, createReport);
router.get('/my', authenticate, getUserReportList);
router.get('/', authenticate, getReportList);
router.post('/:id/handle', authenticate, handleReport);

export default router;
