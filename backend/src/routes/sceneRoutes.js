const Router = require('koa-router');
const sceneController = require('../controllers/sceneController');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = new Router({ prefix: '/api/scenes' });

router.use(authMiddleware);

router.get('/', sceneController.getAllScenes);
router.get('/:id', sceneController.getSceneById);
router.post('/', requireRole('admin', 'user'), sceneController.createScene);
router.put('/:id', requireRole('admin', 'user'), sceneController.updateScene);
router.delete('/:id', requireRole('admin'), sceneController.deleteScene);
router.post('/:id/execute', sceneController.executeScene);

module.exports = router;