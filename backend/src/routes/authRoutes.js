const Router = require('koa-router');
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

const router = new Router({ prefix: '/api/auth' });

router.post('/login', authController.login);
router.post('/register', authController.register);
router.get('/me', authMiddleware, authController.getCurrentUser);
router.put('/change-password', authMiddleware, authController.changePassword);

module.exports = router;