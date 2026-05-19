import Router from 'koa-router';
import {
  getDashboardData,
  getSchedule,
  getGrades,
  getCourses,
  selectCourse,
  dropCourse,
  getEvaluations,
  submitEvaluation,
  getMessages,
  readMessage,
  getProfile,
  getLoginRecords,
} from '../controllers/studentController';
import { authMiddleware, roleMiddleware } from '../middleware/auth';

const router = new Router({ prefix: '/api/student' });

router.use(authMiddleware);
const checkRole = roleMiddleware(['student', 'admin']);
router.use(checkRole);

router.get('/dashboard', getDashboardData);
router.get('/schedule', getSchedule);
router.get('/grades', getGrades);
router.get('/courses', getCourses);
router.post('/courses/:id/select', selectCourse);
router.delete('/courses/:id/drop', dropCourse);
router.get('/evaluations', getEvaluations);
router.post('/evaluations/:id', submitEvaluation);
router.get('/messages', getMessages);
router.post('/messages/:id/read', readMessage);
router.get('/profile', getProfile);
router.get('/login-records', getLoginRecords);

export default router;
