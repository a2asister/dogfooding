import { Router } from 'express';
import * as fileController from '../controllers/file.controller';
import { authenticate } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';

const router = Router();

router.post('/image', authenticate, upload.single('image'), fileController.uploadImage);
router.post('/images', authenticate, upload.array('images', 9), fileController.uploadMultipleImages);

export default router;
