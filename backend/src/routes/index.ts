import express from 'express';
import multer from 'multer';
import { newsController } from '../controllers/news.controller';
import { eventController } from '../controllers/event.controller';
import { homeController } from '../controllers/home.controller';
import { reservationController } from '../controllers/reservation.controller';
import { ticketController } from '../controllers/ticket.controller';
import { complianceController } from '../controllers/compliance.controller';
import { settingController } from '../controllers/setting.controller';
import { adminController } from '../controllers/admin.controller';
import { uploadController } from '../controllers/upload.controller';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// 资讯相关
router.get('/news', newsController.getList);
router.get('/news/latest', newsController.getLatest);
router.get('/news/:id', newsController.getDetail);
router.post('/news', newsController.create);
router.put('/news/:id', newsController.update);
router.delete('/news/:id', newsController.delete);

// 活动相关
router.get('/events', eventController.getList);
router.get('/events/ongoing', eventController.getOngoing);
router.get('/events/admin', eventController.getAdminList);
router.get('/events/:id', eventController.getDetail);
router.post('/events', eventController.create);
router.put('/events/:id', eventController.update);
router.delete('/events/:id', eventController.delete);

// 首页配置
router.get('/home/config', homeController.getConfig);
router.get('/home/data', homeController.getHomeData);
router.get('/admin/home/config', homeController.getAllConfig);
router.post('/admin/home/config', homeController.updateConfig);

// 预约相关
router.post('/reservation', reservationController.create);
router.get('/admin/reservations', reservationController.getList);
router.get('/admin/reservations/stats', reservationController.getStats);

// 工单相关
router.post('/ticket', ticketController.create);
router.get('/admin/tickets', ticketController.getList);
router.get('/admin/tickets/:id', ticketController.getDetail);
router.post('/admin/tickets/:id/reply', ticketController.reply);
router.put('/admin/tickets/:id/status', ticketController.updateStatus);

// 合规文档
router.get('/compliance', complianceController.getAll);
router.get('/compliance/:type', complianceController.getByType);
router.put('/admin/compliance/:type', complianceController.update);

// 系统设置
router.get('/settings', settingController.getAll);
router.get('/admin/settings', settingController.getFullList);
router.put('/admin/settings', settingController.update);
router.post('/admin/settings/batch', settingController.batchUpdate);

// 管理员相关
router.post('/admin/login', adminController.login);
router.get('/admin/users', adminController.getAll);
router.post('/admin/users', adminController.create);

// 文件上传
router.post('/upload/image', upload.single('image'), uploadController.uploadImage);

export default router;
