import { Router } from 'express';
import * as productController from '../controllers/product.controller';
import { authenticate, optionalAuthenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authenticate, productController.createProduct);
router.get('/', optionalAuthenticate, productController.getProducts);
router.get('/:productId', optionalAuthenticate, productController.getProduct);
router.put('/:productId', authenticate, productController.updateProduct);
router.post('/:productId/status', authenticate, productController.updateProductStatus);

router.post('/note/add', authenticate, productController.addProductToNote);
router.get('/note/:noteId', optionalAuthenticate, productController.getNoteProducts);
router.delete('/note/:noteProductId', authenticate, productController.removeProductFromNote);
router.post('/note/:noteProductId/click', optionalAuthenticate, productController.recordProductClick);
router.get('/note/:noteProductId/link', optionalAuthenticate, productController.getProductLink);

export default router;
