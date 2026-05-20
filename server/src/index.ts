import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import { initDatabase } from './db/schema';
import { authMiddleware } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';
import { corsMiddleware } from './middleware/cors';

import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import roleRoutes from './routes/roles';
import departmentRoutes from './routes/departments';
import employeeRoutes from './routes/employees';
import indicatorRoutes from './routes/indicators';
import schemeRoutes from './routes/schemes';
import planRoutes from './routes/plans';
import personalKpiRoutes from './routes/personalKpis';
import resultRoutes from './routes/results';
import statisticsRoutes from './routes/statistics';
import notificationRoutes from './routes/notifications';
import systemRoutes from './routes/system';

const app = new Koa();
const PORT = process.env.PORT ? Number(process.env.PORT) : 48763;

initDatabase();

app.use(corsMiddleware);
app.use(errorHandler);
app.use(bodyParser({
  jsonLimit: '50mb',
  formLimit: '50mb',
}));
app.use(authMiddleware);

app.use(authRoutes.routes());
app.use(authRoutes.allowedMethods());
app.use(userRoutes.routes());
app.use(userRoutes.allowedMethods());
app.use(roleRoutes.routes());
app.use(roleRoutes.allowedMethods());
app.use(departmentRoutes.routes());
app.use(departmentRoutes.allowedMethods());
app.use(employeeRoutes.routes());
app.use(employeeRoutes.allowedMethods());
app.use(indicatorRoutes.routes());
app.use(indicatorRoutes.allowedMethods());
app.use(schemeRoutes.routes());
app.use(schemeRoutes.allowedMethods());
app.use(planRoutes.routes());
app.use(planRoutes.allowedMethods());
app.use(personalKpiRoutes.routes());
app.use(personalKpiRoutes.allowedMethods());
app.use(resultRoutes.routes());
app.use(resultRoutes.allowedMethods());
app.use(statisticsRoutes.routes());
app.use(statisticsRoutes.allowedMethods());
app.use(notificationRoutes.routes());
app.use(notificationRoutes.allowedMethods());
app.use(systemRoutes.routes());
app.use(systemRoutes.allowedMethods());

app.listen(PORT, () => {
  console.log(`KPI Platform Server is running on port ${PORT}`);
  console.log(`API Base URL: http://localhost:${PORT}/api`);
});
