import Router from 'koa-router';
import { dataStore, Inventory } from '../utils/dataStore';

const router = new Router({ prefix: '/api/inventories' });

router.get('/', async (ctx) => {
  try {
    const storeId = ctx.query.storeId as string;
    const items = dataStore.getInventories(storeId);
    ctx.body = { success: true, data: items };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { success: false, message: '获取库存数据失败' };
  }
});

router.post('/', async (ctx) => {
  try {
    const body = ctx.request.body as Omit<Inventory, 'id' | 'updatedAt'>;
    const newItem = dataStore.addInventory({
      storeId: body.storeId,
      productName: body.productName,
      sku: body.sku,
      quantity: body.quantity,
      price: body.price,
      unit: body.unit
    });
    ctx.body = { success: true, data: newItem, message: '库存添加成功' };
  } catch (error) {
    ctx.status = 400;
    ctx.body = { success: false, message: '添加库存失败' };
  }
});

router.put('/:id', async (ctx) => {
  try {
    const body = ctx.request.body as Partial<Inventory>;
    const updatedItem = dataStore.updateInventory(ctx.params.id, body);
    if (!updatedItem) {
      ctx.status = 404;
      ctx.body = { success: false, message: '库存记录不存在' };
      return;
    }
    ctx.body = { success: true, data: updatedItem, message: '库存更新成功' };
  } catch (error) {
    ctx.status = 400;
    ctx.body = { success: false, message: '更新库存失败' };
  }
});

export default router;
