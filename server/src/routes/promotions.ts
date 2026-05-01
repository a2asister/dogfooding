import Router from 'koa-router';
import { dataStore, Promotion } from '../utils/dataStore';

const router = new Router({ prefix: '/api/promotions' });

router.get('/', async (ctx) => {
  try {
    const storeId = ctx.query.storeId as string;
    const promotions = dataStore.getPromotions(storeId);
    ctx.body = { success: true, data: promotions };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { success: false, message: '获取营销活动列表失败' };
  }
});

router.post('/', async (ctx) => {
  try {
    const body = ctx.request.body as Omit<Promotion, 'id'>;
    const newPromotion = dataStore.addPromotion({
      storeId: body.storeId,
      name: body.name,
      description: body.description,
      discountType: body.discountType,
      discountValue: body.discountValue,
      minPurchase: body.minPurchase || 0,
      startDate: body.startDate,
      endDate: body.endDate,
      status: body.status || 'active'
    });
    ctx.body = { success: true, data: newPromotion, message: '营销活动创建成功' };
  } catch (error) {
    ctx.status = 400;
    ctx.body = { success: false, message: '创建营销活动失败' };
  }
});

router.put('/:id', async (ctx) => {
  try {
    const body = ctx.request.body as Partial<Promotion>;
    const updatedPromotion = dataStore.updatePromotion(ctx.params.id, body);
    if (!updatedPromotion) {
      ctx.status = 404;
      ctx.body = { success: false, message: '营销活动不存在' };
      return;
    }
    ctx.body = { success: true, data: updatedPromotion, message: '营销活动更新成功' };
  } catch (error) {
    ctx.status = 400;
    ctx.body = { success: false, message: '更新营销活动失败' };
  }
});

export default router;
