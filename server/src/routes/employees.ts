import Router from 'koa-router';
import { dataStore, Employee } from '../utils/dataStore';

const router = new Router({ prefix: '/api/employees' });

router.get('/', async (ctx) => {
  try {
    const storeId = ctx.query.storeId as string;
    const employees = dataStore.getEmployees(storeId);
    ctx.body = { success: true, data: employees };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { success: false, message: '获取员工列表失败' };
  }
});

router.post('/', async (ctx) => {
  try {
    const body = ctx.request.body as Omit<Employee, 'id' | 'createdAt'>;
    const newEmployee = dataStore.addEmployee({
      storeId: body.storeId,
      name: body.name,
      position: body.position,
      phone: body.phone,
      email: body.email,
      status: body.status || 'active'
    });
    ctx.body = { success: true, data: newEmployee, message: '员工创建成功' };
  } catch (error) {
    ctx.status = 400;
    ctx.body = { success: false, message: '创建员工失败' };
  }
});

router.put('/:id', async (ctx) => {
  try {
    const body = ctx.request.body as Partial<Employee>;
    const updatedEmployee = dataStore.updateEmployee(ctx.params.id, body);
    if (!updatedEmployee) {
      ctx.status = 404;
      ctx.body = { success: false, message: '员工不存在' };
      return;
    }
    ctx.body = { success: true, data: updatedEmployee, message: '员工更新成功' };
  } catch (error) {
    ctx.status = 400;
    ctx.body = { success: false, message: '更新员工失败' };
  }
});

export default router;
