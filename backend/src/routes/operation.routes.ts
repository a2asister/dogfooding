import { Router } from 'express';
import * as operationController from '../controllers/operation.controller';
import { authenticate, optionalAuthenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/banners', authenticate, operationController.createBanner);
router.put('/banners/:bannerId', authenticate, operationController.updateBanner);
router.delete('/banners/:bannerId', authenticate, operationController.deleteBanner);
router.get('/banners', optionalAuthenticate, operationController.getBanners);
router.post('/banners/:bannerId/click', optionalAuthenticate, operationController.incrementBannerClick);

router.post('/hot-ranks/generate', authenticate, operationController.generateHotRanks);
router.get('/hot-ranks', optionalAuthenticate, operationController.getHotRanks);
router.post('/hot-ranks/:rankId/boost', authenticate, operationController.manualBoostRank);
router.post('/hot-ranks/:rankId/pin', authenticate, operationController.pinRank);

router.post('/flow-support', authenticate, operationController.createFlowSupport);
router.post('/flow-support/:supportId/cancel', authenticate, operationController.cancelFlowSupport);
router.get('/flow-support', authenticate, operationController.getFlowSupports);

export default router;
