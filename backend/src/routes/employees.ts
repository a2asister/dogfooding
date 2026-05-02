import Router from 'koa-router';
import { storage } from '../utils/jsonStorage';
import { Employee } from '../types';

const router = new Router({ prefix: '/api/employees' });

router.get('/', async (ctx) => {
  const employees = storage.read<Employee>('employees');
  ctx.body = { success: true, data: employees };
});

router.get('/:id', async (ctx) => {
  const employee = storage.getById<Employee>('employees', ctx.params.id);
  if (!employee) {
    ctx.status = 404;
    ctx.body = { success: false, message: '员工不存在' };
    return;
  }
  ctx.body = { success: true, data: employee };
});

router.post('/', async (ctx) => {
  const body = ctx.request.body as Partial<Employee>;
  const employee: Employee = {
    id: `emp-${Date.now()}`,
    name: body.name || '',
    department: body.department || '',
    position: body.position || '',
    avatar: body.avatar || ''
  };
  storage.create('employees', employee);
  ctx.body = { success: true, data: employee };
});

router.put('/:id', async (ctx) => {
  const body = ctx.request.body as Partial<Employee>;
  const employee = storage.update<Employee>('employees', ctx.params.id, body);
  if (!employee) {
    ctx.status = 404;
    ctx.body = { success: false, message: '员工不存在' };
    return;
  }
  ctx.body = { success: true, data: employee };
});

router.delete('/:id', async (ctx) => {
  const result = storage.delete('employees', ctx.params.id);
  if (!result) {
    ctx.status = 404;
    ctx.body = { success: false, message: '员工不存在' };
    return;
  }
  ctx.body = { success: true, message: '删除成功' };
});

export default router;
