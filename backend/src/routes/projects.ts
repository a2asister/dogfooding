import Router from 'koa-router';
import { storage } from '../utils/jsonStorage';
import { Project, ProjectHours, Employee } from '../types';

const router = new Router({ prefix: '/api/projects' });

router.get('/', async (ctx) => {
  const { status } = ctx.query;
  let projects = storage.read<Project>('projects');
  
  if (status) {
    projects = projects.filter(p => p.status === status);
  }
  
  ctx.body = { success: true, data: projects };
});

router.get('/hours', async (ctx) => {
  const { employeeId, projectId, startDate, endDate } = ctx.query;
  let hours = storage.read<ProjectHours>('projectHours');
  
  if (employeeId) {
    hours = hours.filter(h => h.employeeId === employeeId);
  }
  if (projectId) {
    hours = hours.filter(h => h.projectId === projectId);
  }
  if (startDate) {
    hours = hours.filter(h => h.date >= startDate);
  }
  if (endDate) {
    hours = hours.filter(h => h.date <= endDate);
  }
  
  ctx.body = { success: true, data: hours };
});

router.get('/stats/allocation', async (ctx) => {
  const hours = storage.read<ProjectHours>('projectHours');
  const employees = storage.read<Employee>('employees');
  const projects = storage.read<Project>('projects');
  
  const empMap = new Map(employees.map(e => [e.id, e]));
  const projMap = new Map(projects.map(p => [p.id, p]));
  
  const empAllocation = new Map<string, {
    employeeId: string;
    employeeName: string;
    totalHours: number;
    projects: { projectId: string; projectName: string; hours: number; percentage: number }[];
  }>();
  
  hours.forEach(hour => {
    if (!empAllocation.has(hour.employeeId)) {
      const emp = empMap.get(hour.employeeId);
      empAllocation.set(hour.employeeId, {
        employeeId: hour.employeeId,
        employeeName: emp?.name || '',
        totalHours: 0,
        projects: []
      });
    }
    const emp = empAllocation.get(hour.employeeId)!;
    emp.totalHours += hour.hours;
    
    const projectEntry = emp.projects.find(p => p.projectId === hour.projectId);
    if (projectEntry) {
      projectEntry.hours += hour.hours;
    } else {
      const proj = projMap.get(hour.projectId);
      emp.projects.push({
        projectId: hour.projectId,
        projectName: proj?.name || hour.projectName,
        hours: hour.hours,
        percentage: 0
      });
    }
  });
  
  const result = Array.from(empAllocation.values()).map(emp => ({
    ...emp,
    projects: emp.projects.map(p => ({
      ...p,
      percentage: emp.totalHours > 0 ? Math.round(p.hours / emp.totalHours * 100) / 100 : 0
    }))
  }));
  
  ctx.body = { success: true, data: result };
});

export default router;
