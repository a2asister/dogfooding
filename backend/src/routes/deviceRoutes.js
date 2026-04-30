const Router = require('koa-router');
const deviceController = require('../controllers/deviceController');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = new Router({ prefix: '/api/devices' });

router.use(authMiddleware);

router.get('/', deviceController.getAllDevices);
router.get('/stats', deviceController.getDeviceStats);
router.get('/:id', deviceController.getDeviceById);
router.post('/', requireRole('admin', 'user'), deviceController.createDevice);
router.put('/:id', requireRole('admin', 'user'), deviceController.updateDevice);
router.delete('/:id', requireRole('admin'), deviceController.deleteDevice);
router.post('/:id/control', deviceController.controlDevice);

module.exports = router;