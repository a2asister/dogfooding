import Router from 'koa-router';
import { dataStore, Store } from '../utils/dataStore';

const router = new Router({ prefix: '/api/stores' });

router.get('/', async (ctx) => {
  try {
    const stores = dataStore.getStores();
    ctx.body = { success: true, data: stores };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { success: false, message: '获取门店列表失败' };
  }
});

router.get('/:id', async (ctx) => {
  try {
    const store = dataStore.getStoreById(ctx.params.id);
    if (!store) {
      ctx.status = 404;
      ctx.body = { success: false, message: '门店不存在' };
      return;
    }
    ctx.body = { success: true, data: store };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { success: false, message: '获取门店信息失败' };
  }
});

router.post('/', async (ctx) => {
  try {
    const body = ctx.request.body as Omit<Store, 'id' | 'createdAt'>;
    const newStore = dataStore.addStore({
      name: body.name,
      address: body.address,
      manager: body.manager,
      phone: body.phone,
      status: body.status || 'active'
    });
    ctx.body = { success: true, data: newStore, message: '门店创建成功' };
  } catch (error) {
    ctx.status = 400;
    ctx.body = { success: false, message: '创建门店失败' };
  }
});

router.put('/:id', async (ctx) => {
  try {
    const body = ctx.request.body as Partial<Store>;
    const updatedStore = dataStore.updateStore(ctx.params.id, body);
    if (!updatedStore) {
      ctx.status = 404;
      ctx.body = { success: false, message: '门店不存在' };
      return;
    }
    ctx.body = { success: true, data: updatedStore, message: '门店更新成功' };
  } catch (error) {
    ctx.status = 400;
    ctx.body = { success: false, message: '更新门店失败' };
  }
});

router.delete('/:id', async (ctx) => {
  try {
    const deleted = dataStore.deleteStore(ctx.params.id);
    if (!deleted) {
      ctx.status = 404;
      ctx.body = { success: false, message: '门店不存在' };
      return;
    }
    ctx.body = { success: true, message: '门店删除成功' };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { success: false, message: '删除门店失败' };
  }
});

export default router;
