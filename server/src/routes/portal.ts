import Router from 'koa-router';
import { getNewsList, getNewsDetail, getOverview } from '../controllers/portalController';

const router = new Router({ prefix: '/api' });

router.get('/news/list', getNewsList);
router.get('/news/:id', getNewsDetail);
router.get('/portal/overview', getOverview);

export default router;
