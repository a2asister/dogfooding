import Router from 'koa-router';
import { dataStore, Attendance } from '../utils/dataStore';

const router = new Router({ prefix: '/api/attendances' });

router.get('/', async (ctx) => {
  try {
    const storeId = ctx.query.storeId as string;
    const attendances = dataStore.getAttendances(storeId);
    ctx.body = { success: true, data: attendances };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { success: false, message: '获取考勤数据失败' };
  }
});

router.post('/', async (ctx) => {
  try {
    const body = ctx.request.body as Omit<Attendance, 'id'>;
    const newAttendance = dataStore.addAttendance({
      storeId: body.storeId,
      employeeId: body.employeeId,
      employeeName: body.employeeName,
      date: body.date,
      checkIn: body.checkIn,
      checkOut: body.checkOut,
      status: body.status || 'pending'
    });
    ctx.body = { success: true, data: newAttendance, message: '考勤记录添加成功' };
  } catch (error) {
    ctx.status = 400;
    ctx.body = { success: false, message: '添加考勤记录失败' };
  }
});

router.put('/:id', async (ctx) => {
  try {
    const body = ctx.request.body as Partial<Attendance>;
    const updatedAttendance = dataStore.updateAttendance(ctx.params.id, body);
    if (!updatedAttendance) {
      ctx.status = 404;
      ctx.body = { success: false, message: '考勤记录不存在' };
      return;
    }
    ctx.body = { success: true, data: updatedAttendance, message: '考勤更新成功' };
  } catch (error) {
    ctx.status = 400;
    ctx.body = { success: false, message: '更新考勤失败' };
  }
});

export default router;
