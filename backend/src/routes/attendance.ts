import Router from 'koa-router';
import { storage } from '../utils/jsonStorage';
import { AttendanceRecord, Employee } from '../types';

const router = new Router({ prefix: '/api/attendance' });

router.get('/', async (ctx) => {
  const { employeeId, startDate, endDate } = ctx.query;
  let records = storage.read<AttendanceRecord>('attendance');
  
  if (employeeId) {
    records = records.filter(r => r.employeeId === employeeId);
  }
  if (startDate) {
    records = records.filter(r => r.date >= startDate);
  }
  if (endDate) {
    records = records.filter(r => r.date <= endDate);
  }
  
  ctx.body = { success: true, data: records };
});

router.get('/stats/overtime', async (ctx) => {
  const { startDate, endDate } = ctx.query;
  let records = storage.read<AttendanceRecord>('attendance');
  const employees = storage.read<Employee>('employees');
  
  if (startDate) {
    records = records.filter(r => r.date >= startDate);
  }
  if (endDate) {
    records = records.filter(r => r.date <= endDate);
  }
  
  const employeeMap = new Map(employees.map(e => [e.id, e]));
  const overtimeRecords = records.filter(r => r.isOvertime);
  
  const stats = overtimeRecords.reduce((acc, record) => {
    if (!acc.has(record.employeeId)) {
      const emp = employeeMap.get(record.employeeId);
      acc.set(record.employeeId, {
        employeeId: record.employeeId,
        employeeName: emp?.name || '',
        totalOvertimeHours: 0,
        overtimeCount: 0,
        avgOvertimeHours: 0
      });
    }
    const stat = acc.get(record.employeeId)!;
    stat.totalOvertimeHours += record.workHours;
    stat.overtimeCount += 1;
    return acc;
  }, new Map<string, any>());
  
  const result = Array.from(stats.values()).map(s => ({
    ...s,
    avgOvertimeHours: s.overtimeCount > 0 ? Math.round(s.totalOvertimeHours / s.overtimeCount * 10) / 10 : 0
  }));
  
  ctx.body = { success: true, data: result };
});

router.get('/stats/daily', async (ctx) => {
  const { startDate, endDate } = ctx.query;
  let records = storage.read<AttendanceRecord>('attendance');
  
  if (startDate) {
    records = records.filter(r => r.date >= startDate);
  }
  if (endDate) {
    records = records.filter(r => r.date <= endDate);
  }
  
  const dateMap = new Map<string, { date: string; totalHours: number; avgHours: number; employeeCount: number }>();
  
  records.forEach(record => {
    if (!dateMap.has(record.date)) {
      dateMap.set(record.date, { date: record.date, totalHours: 0, avgHours: 0, employeeCount: 0 });
    }
    const entry = dateMap.get(record.date)!;
    entry.totalHours += record.workHours;
    entry.employeeCount += 1;
  });
  
  const result = Array.from(dateMap.values()).map(entry => ({
    ...entry,
    avgHours: entry.employeeCount > 0 ? Math.round(entry.totalHours / entry.employeeCount * 10) / 10 : 0
  }));
  
  result.sort((a, b) => a.date.localeCompare(b.date));
  ctx.body = { success: true, data: result };
});

export default router;
