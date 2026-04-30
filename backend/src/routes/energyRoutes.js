const Router = require('koa-router');
const energyController = require('../controllers/energyController');
const { authMiddleware } = require('../middleware/auth');

const router = new Router({ prefix: '/api/energy' });

router.use(authMiddleware);

router.get('/', energyController.getEnergyStats);
router.get('/summary', energyController.getEnergySummary);

module.exports = router;