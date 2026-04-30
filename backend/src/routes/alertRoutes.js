const Router = require('koa-router');
const alertController = require('../controllers/alertController');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = new Router({ prefix: '/api/alerts' });

router.use(authMiddleware);

router.get('/', alertController.getAllAlerts);
router.get('/stats', alertController.getAlertStats);
router.get('/:id', alertController.getAlertById);
router.put('/:id/read', alertController.markAsRead);
router.put('/read-all', alertController.markAllAsRead);
router.put('/:id/resolve', alertController.resolveAlert);

module.exports = router;