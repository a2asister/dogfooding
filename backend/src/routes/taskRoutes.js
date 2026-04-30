const Router = require('koa-router');
const taskController = require('../controllers/taskController');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = new Router({ prefix: '/api/tasks' });

router.use(authMiddleware);

router.get('/', taskController.getAllTasks);
router.get('/:id', taskController.getTaskById);
router.post('/', requireRole('admin', 'user'), taskController.createTask);
router.put('/:id', requireRole('admin', 'user'), taskController.updateTask);
router.delete('/:id', requireRole('admin'), taskController.deleteTask);
router.put('/:id/toggle', taskController.toggleTask);

module.exports = router;