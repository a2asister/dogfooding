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
import { faqController } from '../controllers/faq.controller';
import { statisticsController } from '../controllers/statistics.controller';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// 资讯相关
router.get('/news', newsController.getList);
router.get('/news/latest', newsController.getLatest);
router.get('/news/hot', newsController.getHotRecommend);
router.get('/news/:id', newsController.getDetail);
router.post('/news/:id/share', newsController.incrementShare);
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

// FAQ相关
router.get('/faqs', faqController.getFaqs);
router.get('/faqs/categories', faqController.getCategories);
router.get('/faqs/:id', faqController.getFaqById);
router.post('/admin/faqs', (req, res) => { res.json({ code: 0, message: 'FAQ创建功能待实现' }); });
router.put('/admin/faqs/:id', (req, res) => { res.json({ code: 0, message: 'FAQ更新功能待实现' }); });
router.delete('/admin/faqs/:id', (req, res) => { res.json({ code: 0, message: 'FAQ删除功能待实现' }); });

// 统计相关
router.get('/admin/statistics/summary', statisticsController.getSummary);
router.get('/admin/statistics/date-range', statisticsController.getByDateRange);
router.get('/admin/statistics/export', statisticsController.exportCSV);

// 日志相关
router.get('/admin/logs/operation', (req, res) => { res.json({ code: 0, message: '操作日志功能待实现', data: { list: [], total: 0 } }); });
router.get('/admin/logs/access', (req, res) => { res.json({ code: 0, message: '访问日志功能待实现', data: { list: [], total: 0 } }); });

// 媒体库相关
router.get('/admin/media', (req, res) => { res.json({ code: 0, message: '媒体库功能待实现', data: { list: [], total: 0 } }); });
router.post('/admin/media/batch', upload.array('files', 20), (req, res) => { res.json({ code: 0, message: '批量上传功能待实现' }); });
router.delete('/admin/media/:id', (req, res) => { res.json({ code: 0, message: '删除媒体功能待实现' }); });

// 文件上传
router.post('/upload/image', upload.single('image'), uploadController.uploadImage);

export default router;
