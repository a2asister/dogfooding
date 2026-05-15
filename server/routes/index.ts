import Router from 'koa-router';
import sqlController from '../controllers/sqlController.js';

const router = new Router({ prefix: '/api' });

router.post('/connect', sqlController.connect);
router.get('/tables', sqlController.getTables);
router.get('/tables/:tableName', sqlController.getTableStructure);
router.post('/execute', sqlController.executeSql);
router.get('/logs', sqlController.getLogs);

export default router;
