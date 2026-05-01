import Router from 'koa-router';
import { dataStore, CustomerFlow } from '../utils/dataStore';

const router = new Router({ prefix: '/api/customer-flows' });

router.get('/', async (ctx) => {
  try {
    const storeId = ctx.query.storeId as string;
    const flows = dataStore.getCustomerFlows(storeId);
    ctx.body = { success: true, data: flows };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { success: false, message: '获取客流数据失败' };
  }
});

router.post('/', async (ctx) => {
  try {
    const body = ctx.request.body as Omit<CustomerFlow, 'id' | 'timestamp'>;
    const newFlow = dataStore.addCustomerFlow({
      storeId: body.storeId,
      date: body.date,
      inCount: body.inCount,
      outCount: body.outCount
    });
    ctx.body = { success: true, data: newFlow, message: '客流数据添加成功' };
  } catch (error) {
    ctx.status = 400;
    ctx.body = { success: false, message: '添加客流数据失败' };
  }
});

export default router;
