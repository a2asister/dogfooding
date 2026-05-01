import Router from 'koa-router';
import { dataStore, Member } from '../utils/dataStore';

const router = new Router({ prefix: '/api/members' });

router.get('/', async (ctx) => {
  try {
    const storeId = ctx.query.storeId as string;
    const members = dataStore.getMembers(storeId);
    ctx.body = { success: true, data: members };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { success: false, message: '获取会员列表失败' };
  }
});

router.post('/', async (ctx) => {
  try {
    const body = ctx.request.body as Omit<Member, 'id' | 'createdAt' | 'points' | 'totalSpent'>;
    const newMember = dataStore.addMember({
      storeId: body.storeId,
      name: body.name,
      phone: body.phone,
      level: body.level || 'bronze',
      status: body.status || 'active'
    });
    ctx.body = { success: true, data: newMember, message: '会员创建成功' };
  } catch (error) {
    ctx.status = 400;
    ctx.body = { success: false, message: '创建会员失败' };
  }
});

router.put('/:id', async (ctx) => {
  try {
    const body = ctx.request.body as Partial<Member>;
    const updatedMember = dataStore.updateMember(ctx.params.id, body);
    if (!updatedMember) {
      ctx.status = 404;
      ctx.body = { success: false, message: '会员不存在' };
      return;
    }
    ctx.body = { success: true, data: updatedMember, message: '会员更新成功' };
  } catch (error) {
    ctx.status = 400;
    ctx.body = { success: false, message: '更新会员失败' };
  }
});

export default router;
