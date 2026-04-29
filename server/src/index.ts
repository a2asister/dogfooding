import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import cors from '@koa/cors';
import dotenv from 'dotenv';
import router from './routes';
import { errorHandler } from './middleware/errorHandler';
import { sequelize } from './models';
import { hashPassword } from './utils/password';
import { User, CourseCategory, Grade, SystemConfig } from './models';

dotenv.config();

const app = new Koa();
const PORT = process.env.PORT || 3001;

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  })
);

app.use(bodyParser());
app.use(errorHandler);
app.use(router.routes()).use(router.allowedMethods());

const waitForDatabase = async (maxRetries = 10, delay = 3000): Promise<void> => {
  let retries = 0;
  while (retries < maxRetries) {
    try {
      await sequelize.authenticate();
      console.log('数据库连接成功');
      return;
    } catch (error) {
      retries++;
      console.log(`数据库连接尝试 ${retries}/${maxRetries} 失败，${delay/1000}秒后重试...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('数据库连接失败，已达到最大重试次数');
};

const initializeDatabase = async () => {
  try {
    await waitForDatabase();

    const syncOptions = {
      alter: process.env.NODE_ENV === 'development' || process.env.DB_SYNC_ALTER === 'true',
    };
    await sequelize.sync(syncOptions);
    console.log('数据库同步完成');

    const adminCount = await User.count({ where: { role: 'admin' } });
    if (adminCount === 0) {
      const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
      const hashedPassword = await hashPassword(adminPassword);

      await User.create({
        username: process.env.ADMIN_USERNAME || 'admin',
        password: hashedPassword,
        name: '系统管理员',
        role: 'admin',
        email: process.env.ADMIN_EMAIL || 'admin@university.edu',
        isActive: true,
      });

      console.log('默认管理员账号已创建');
    }

    const categoryCount = await CourseCategory.count();
    if (categoryCount === 0) {
      const defaultCategories = [
        { name: '人文社科', code: 'HS', description: '人文社会科学类课程', sortOrder: 1 },
        { name: '自然科学', code: 'NS', description: '自然科学类课程', sortOrder: 2 },
        { name: '工程技术', code: 'ET', description: '工程技术类课程', sortOrder: 3 },
        { name: '艺术体育', code: 'AS', description: '艺术体育类课程', sortOrder: 4 },
        { name: '创新创业', code: 'IE', description: '创新创业类课程', sortOrder: 5 },
      ];

      await CourseCategory.bulkCreate(defaultCategories);
      console.log('默认课程分类已创建');
    }

    const gradeCount = await Grade.count();
    if (gradeCount === 0) {
      const currentYear = new Date().getFullYear();
      const defaultGrades = [
        { name: `${currentYear}级`, year: currentYear, description: '新生年级' },
        { name: `${currentYear - 1}级`, year: currentYear - 1, description: '二年级' },
        { name: `${currentYear - 2}级`, year: currentYear - 2, description: '三年级' },
        { name: `${currentYear - 3}级`, year: currentYear - 3, description: '四年级' },
      ];

      await Grade.bulkCreate(defaultGrades);
      console.log('默认年级数据已创建');
    }

    const configCount = await SystemConfig.count();
    if (configCount === 0) {
      const defaultConfigs = [
        { key: 'system.name', value: '大学选修课填报系统', description: '系统名称', group: 'general' },
        { key: 'system.version', value: '1.0.0', description: '系统版本', group: 'general' },
        { key: 'elective.maxRetries', value: '3', description: '选课失败最大重试次数', group: 'elective' },
        { key: 'schedule.periodsPerDay', value: '12', description: '每天最大节数', group: 'schedule' },
      ];

      await SystemConfig.bulkCreate(defaultConfigs);
      console.log('默认系统配置已创建');
    }

    console.log('数据库初始化完成');
  } catch (error) {
    console.error('数据库初始化失败:', error);
    throw error;
  }
};

app.listen(PORT, async () => {
  console.log(`服务器启动成功，端口: ${PORT}`);
  console.log(`环境: ${process.env.NODE_ENV || 'development'}`);

  await initializeDatabase();
});

export default app;
