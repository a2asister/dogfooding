import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { initializeDatabase } from './config/database';
import authRoutes from './routes/auth.routes';
import noteRoutes from './routes/note.routes';
import userRoutes from './routes/user.routes';
import fileRoutes from './routes/file.routes';
import adminRoutes from './routes/admin.routes';
import commentRoutes from './routes/comment.routes';
import feedRoutes from './routes/feed.routes';
import searchRoutes from './routes/search.routes';
import topicRoutes from './routes/topic.routes';
import collectionRoutes from './routes/collection.routes';
import notificationRoutes from './routes/notification.routes';
import reportRoutes from './routes/report.routes';
import userExtendedRoutes from './routes/userExtended.routes';
import noteExtendedRoutes from './routes/noteExtended.routes';
import userProfileRoutes from './routes/userProfile.routes';
import recommendRoutes from './routes/recommend.routes';
import contentReviewRoutes from './routes/contentReview.routes';
import riskControlRoutes from './routes/riskControl.routes';
import operationRoutes from './routes/operation.routes';
import creatorRoutes from './routes/creator.routes';
import orderRoutes from './routes/order.routes';
import earningRoutes from './routes/earning.routes';
import membershipRoutes from './routes/membership.routes';
import promotionRoutes from './routes/promotion.routes';
import analyticsRoutes from './routes/analytics.routes';
import messageRoutes from './routes/message.routes';
import communityRoutes from './routes/community.routes';
import creatorReportRoutes from './routes/creatorReport.routes';
import productRoutes from './routes/product.routes';
import { User, UserRole } from './entities/User';
import bcrypt from 'bcryptjs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/notes', noteExtendedRoutes);
app.use('/api/users', userRoutes);
app.use('/api/users', userExtendedRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/user-profile', userProfileRoutes);
app.use('/api/recommend', recommendRoutes);
app.use('/api/content-review', contentReviewRoutes);
app.use('/api/risk-control', riskControlRoutes);
app.use('/api/operation', operationRoutes);
app.use('/api/creator', creatorRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/earnings', earningRoutes);
app.use('/api/membership', membershipRoutes);
app.use('/api/promotions', promotionRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/communities', communityRoutes);
app.use('/api/creator-reports', creatorReportRoutes);
app.use('/api/products', productRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: '图文社区服务运行正常' });
});

app.use((_req, res) => {
  res.status(404).json({ message: '接口不存在' });
});

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || '服务器内部错误' });
});

const createAdminUser = async () => {
  const userRepository = (await import('./config/database')).AppDataSource.getRepository(User);
  const adminExists = await userRepository.findOne({ where: { role: UserRole.ADMIN } });
  if (!adminExists) {
    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10);
    const admin = userRepository.create({
      username: 'admin',
      password: hashedPassword,
      nickname: '管理员',
      role: UserRole.ADMIN,
      isActive: true,
    });
    await userRepository.save(admin);
    console.log('管理员账号创建成功: admin / admin123');
  }
};

const startServer = async () => {
  try {
    await initializeDatabase();
    await createAdminUser();
    app.listen(PORT, () => {
      console.log(`服务器运行在 http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('服务器启动失败:', error);
    process.exit(1);
  }
};

startServer();

export default app;
