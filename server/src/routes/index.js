const Router = require('koa-router');
const eventController = require('../controllers/eventController');
const sessionController = require('../controllers/sessionController');
const seatController = require('../controllers/seatController');

const router = new Router();

router.prefix('/api');

// 演出相关路由
router.get('/events', eventController.getEvents);
router.get('/events/:id', eventController.getEventById);

// 场次相关路由
router.get('/events/:eventId/sessions', sessionController.getSessionsByEventId);
router.get('/sessions/:id', sessionController.getSessionById);

// 座位相关路由
router.get('/sessions/:sessionId/seats', seatController.getSeatsBySessionId);
router.post('/seats/lock', seatController.lockSeats);
router.post('/seats/unlock', seatController.unlockSeats);
router.post('/seats/confirm', seatController.confirmSeats);

module.exports = router;
