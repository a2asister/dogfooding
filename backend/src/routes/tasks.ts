import Router from 'koa-router';
import { storage } from '../utils/jsonStorage';
import { TaskOutput, Employee, Project } from '../types';

const router = new Router({ prefix: '/api/tasks' });

router.get('/', async (ctx) => {
  const { employeeId, projectId, status } = ctx.query;
  let tasks = storage.read<TaskOutput>('tasks');
  
  if (employeeId) {
    tasks = tasks.filter(t => t.employeeId === employeeId);
  }
  if (projectId) {
    tasks = tasks.filter(t => t.projectId === projectId);
  }
  if (status) {
    tasks = tasks.filter(t => t.status === status);
  }
  
  ctx.body = { success: true, data: tasks };
});

router.get('/stats/efficiency', async (ctx) => {
  const tasks = storage.read<TaskOutput>('tasks');
  const employees = storage.read<Employee>('employees');
  const projects = storage.read<Project>('projects');
  
  const empMap = new Map(employees.map(e => [e.id, e]));
  const projMap = new Map(projects.map(p => [p.id, p]));
  
  const empStats = new Map<string, {
    employeeId: string;
    employeeName: string;
    totalTasks: number;
    completedTasks: number;
    completionRate: number;
    avgEfficiency: number;
    totalPlannedHours: number;
    totalActualHours: number;
  }>();
  
  tasks.forEach(task => {
    if (!empStats.has(task.employeeId)) {
      const emp = empMap.get(task.employeeId);
      empStats.set(task.employeeId, {
        employeeId: task.employeeId,
        employeeName: emp?.name || '',
        totalTasks: 0,
        completedTasks: 0,
        completionRate: 0,
        avgEfficiency: 0,
        totalPlannedHours: 0,
        totalActualHours: 0
      });
    }
    const stat = empStats.get(task.employeeId)!;
    stat.totalTasks += 1;
    if (task.status === 'completed') {
      stat.completedTasks += 1;
    }
    stat.totalPlannedHours += task.plannedHours;
    stat.totalActualHours += task.actualHours;
  });
  
  const result = Array.from(empStats.values()).map(s => ({
    ...s,
    completionRate: s.totalTasks > 0 ? Math.round(s.completedTasks / s.totalTasks * 100) / 100 : 0,
    avgEfficiency: s.totalActualHours > 0 ? Math.round(s.totalPlannedHours / s.totalActualHours * 100) / 100 : 0
  }));
  
  ctx.body = { success: true, data: result };
});

router.get('/stats/projects', async (ctx) => {
  const tasks = storage.read<TaskOutput>('tasks');
  const projects = storage.read<Project>('projects');
  
  const projMap = new Map(projects.map(p => [p.id, p]));
  
  const projStats = new Map<string, {
    projectId: string;
    projectName: string;
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    pendingTasks: number;
    completionRate: number;
  }>();
  
  tasks.forEach(task => {
    if (!projStats.has(task.projectId)) {
      const proj = projMap.get(task.projectId);
      projStats.set(task.projectId, {
        projectId: task.projectId,
        projectName: proj?.name || '',
        totalTasks: 0,
        completedTasks: 0,
        inProgressTasks: 0,
        pendingTasks: 0,
        completionRate: 0
      });
    }
    const stat = projStats.get(task.projectId)!;
    stat.totalTasks += 1;
    if (task.status === 'completed') stat.completedTasks += 1;
    else if (task.status === 'in-progress') stat.inProgressTasks += 1;
    else stat.pendingTasks += 1;
  });
  
  const result = Array.from(projStats.values()).map(s => ({
    ...s,
    completionRate: s.totalTasks > 0 ? Math.round(s.completedTasks / s.totalTasks * 100) / 100 : 0
  }));
  
  ctx.body = { success: true, data: result };
});

export default router;
