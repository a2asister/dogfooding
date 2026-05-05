import Koa from 'koa';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import cors from 'koa-cors';
import staticServer from 'koa-static';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/authRoutes.js';
import siteRoutes from './routes/siteRoutes.js';
import modelRoutes from './routes/modelRoutes.js';
import contentRoutes from './routes/contentRoutes.js';
import routeRoutes from './routes/routeRoutes.js';
import publishRoutes from './routes/publishRoutes.js';
import cdnRoutes from './routes/cdnRoutes.js';
import { cronScheduler } from './utils/cron.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = new Koa();
const router = new Router();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  headers: ['Content-Type', 'Authorization']
}));

app.use(bodyParser({
  enableTypes: ['json', 'form'],
  jsonLimit: '10mb',
  formLimit: '10mb'
}));

router.use('/api/auth', authRoutes.routes(), authRoutes.allowedMethods());
router.use('/api/sites', siteRoutes.routes(), siteRoutes.allowedMethods());
router.use('/api/models', modelRoutes.routes(), modelRoutes.allowedMethods());
router.use('/api/content', contentRoutes.routes(), contentRoutes.allowedMethods());
router.use('/api/routes', routeRoutes.routes(), routeRoutes.allowedMethods());
router.use('/api/publish', publishRoutes.routes(), publishRoutes.allowedMethods());
router.use('/api/cdn', cdnRoutes.routes(), cdnRoutes.allowedMethods());

app.use(router.routes());
app.use(router.allowedMethods());

const staticPath = path.join(__dirname, '../../public');
app.use(staticServer(staticPath));

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`CMS Backend Server running on port ${PORT}`);
  cronScheduler.start();
});

export default app;
