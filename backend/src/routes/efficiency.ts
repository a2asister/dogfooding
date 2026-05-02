import Router from 'koa-router';
import { storage } from '../utils/jsonStorage';
import { 
  EfficiencyMetrics, 
  OvertimeAlert, 
  AllocationIssue, 
  Employee, 
  Project,
  AttendanceRecord,
  TaskOutput,
  ProjectHours,
  CollaborationRecord
} from '../types';

const router = new Router({ prefix: '/api/efficiency' });

router.get('/metrics', async (ctx) => {
  const { period } = ctx.query;
  let metrics = storage.read<EfficiencyMetrics>('efficiencyMetrics');
  
  if (period) {
    metrics = metrics.filter(m => m.period === period);
  }
  
  const employees = storage.read<Employee>('employees');
  const empMap = new Map(employees.map(e => [e.id, e]));
  
  const result = metrics.map(m => ({
    ...m,
    employeeName: empMap.get(m.employeeId)?.name || ''
  }));
  
  ctx.body = { success: true, data: result };
});

router.get('/alerts/overtime', async (ctx) => {
  const { employeeId, severity } = ctx.query;
  let alerts = storage.read<OvertimeAlert>('overtimeAlerts');
  
  if (employeeId) {
    alerts = alerts.filter(a => a.employeeId === employeeId);
  }
  if (severity) {
    alerts = alerts.filter(a => a.severity === severity);
  }
  
  const employees = storage.read<Employee>('employees');
  const empMap = new Map(employees.map(e => [e.id, e]));
  
  const result = alerts.map(a => ({
    ...a,
    employeeName: empMap.get(a.employeeId)?.name || ''
  }));
  
  ctx.body = { success: true, data: result };
});

router.get('/alerts/allocation', async (ctx) => {
  const { employeeId, issueType } = ctx.query;
  let issues = storage.read<AllocationIssue>('allocationIssues');
  
  if (employeeId) {
    issues = issues.filter(i => i.employeeId === employeeId);
  }
  if (issueType) {
    issues = issues.filter(i => i.issueType === issueType);
  }
  
  const employees = storage.read<Employee>('employees');
  const projects = storage.read<Project>('projects');
  const empMap = new Map(employees.map(e => [e.id, e]));
  const projMap = new Map(projects.map(p => [p.id, p]));
  
  const result = issues.map(i => ({
    ...i,
    employeeName: empMap.get(i.employeeId)?.name || '',
    projectName: i.projectId ? projMap.get(i.projectId)?.name : ''
  }));
  
  ctx.body = { success: true, data: result };
});

router.get('/dashboard', async (ctx) => {
  const employees = storage.read<Employee>('employees');
  const attendance = storage.read<AttendanceRecord>('attendance');
  const tasks = storage.read<TaskOutput>('tasks');
  const projectHours = storage.read<ProjectHours>('projectHours');
  const collaboration = storage.read<CollaborationRecord>('collaborations');
  const metrics = storage.read<EfficiencyMetrics>('efficiencyMetrics');
  const overtimeAlerts = storage.read<OvertimeAlert>('overtimeAlerts');
  const allocationIssues = storage.read<AllocationIssue>('allocationIssues');
  
  const totalEmployees = employees.length;
  const activeProjects = storage.read<Project>('projects').filter(p => p.status === 'active').length;
  
  const recentAttendance = attendance.filter(a => {
    const date = new Date(a.date);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    return diff < 7 * 24 * 60 * 60 * 1000;
  });
  
  const avgWorkHours = recentAttendance.length > 0 
    ? Math.round(recentAttendance.reduce((sum, a) => sum + a.workHours, 0) / recentAttendance.length * 10) / 10
    : 0;
  
  const overtimeCount = overtimeAlerts.length;
  const allocationIssueCount = allocationIssues.length;
  
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const totalTasks = tasks.length;
  const taskCompletionRate = totalTasks > 0 
    ? Math.round(completedTasks / totalTasks * 100) / 100
    : 0;
  
  const avgOverallScore = metrics.length > 0
    ? Math.round(metrics.reduce((sum, m) => sum + m.overallScore, 0) / metrics.length * 100) / 100
    : 0;
  
  ctx.body = {
    success: true,
    data: {
      totalEmployees,
      activeProjects,
      avgWorkHours,
      overtimeCount,
      allocationIssueCount,
      taskCompletionRate,
      avgOverallScore
    }
  };
});

export default router;
