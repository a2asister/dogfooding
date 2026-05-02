import { storage } from './jsonStorage';
import {
  Employee,
  Department,
  Project,
  AttendanceRecord,
  TaskOutput,
  ProjectHours,
  CollaborationRecord,
  EfficiencyMetrics,
  OvertimeAlert,
  AllocationIssue
} from '../types';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function generateDate(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
}

function generateTime(hour: number, minute: number = 0): string {
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
}

export function initMockData(): void {
  const departments: Department[] = [
    { id: 'dept-1', name: '技术研发部', manager: '张经理', employeeCount: 8 },
    { id: 'dept-2', name: '产品设计部', manager: '李经理', employeeCount: 5 },
    { id: 'dept-3', name: '市场营销部', manager: '王经理', employeeCount: 4 },
    { id: 'dept-4', name: '人力资源部', manager: '赵经理', employeeCount: 3 }
  ];

  const employees: Employee[] = [
    { id: 'emp-1', name: '张三', department: '技术研发部', position: '高级工程师', avatar: '' },
    { id: 'emp-2', name: '李四', department: '技术研发部', position: '中级工程师', avatar: '' },
    { id: 'emp-3', name: '王五', department: '技术研发部', position: '初级工程师', avatar: '' },
    { id: 'emp-4', name: '赵六', department: '技术研发部', position: '架构师', avatar: '' },
    { id: 'emp-5', name: '钱七', department: '产品设计部', position: '产品经理', avatar: '' },
    { id: 'emp-6', name: '孙八', department: '产品设计部', position: 'UI设计师', avatar: '' },
    { id: 'emp-7', name: '周九', department: '市场营销部', position: '市场总监', avatar: '' },
    { id: 'emp-8', name: '吴十', department: '人力资源部', position: 'HR专员', avatar: '' }
  ];

  const projects: Project[] = [
    { id: 'proj-1', name: '智能办公系统', description: '企业级智能办公平台', startDate: '2026-01-01', endDate: '2026-06-30', status: 'active', budget: 500000 },
    { id: 'proj-2', name: '数据分析平台', description: '大数据分析与可视化平台', startDate: '2026-02-15', endDate: '2026-08-15', status: 'active', budget: 350000 },
    { id: 'proj-3', name: '用户管理系统', description: '统一用户身份认证系统', startDate: '2026-03-01', endDate: '2026-05-30', status: 'active', budget: 200000 }
  ];

  const attendanceRecords: AttendanceRecord[] = [];
  const employeesForAttendance = employees.slice(0, 8);
  for (let day = 1; day <= 30; day++) {
    const date = generateDate(day);
    employeesForAttendance.forEach(emp => {
      const checkInHour = 8 + Math.floor(Math.random() * 2);
      const checkInMinute = Math.floor(Math.random() * 60);
      let checkOutHour = 17 + Math.floor(Math.random() * 4);
      let checkOutMinute = Math.floor(Math.random() * 60);
      
      const isOvertime = Math.random() > 0.7;
      if (isOvertime) {
        checkOutHour = 20 + Math.floor(Math.random() * 3);
      }
      
      const workHours = (checkOutHour + checkOutMinute / 60) - (checkInHour + checkInMinute / 60);
      
      attendanceRecords.push({
        id: generateId(),
        employeeId: emp.id,
        date,
        checkIn: generateTime(checkInHour, checkInMinute),
        checkOut: generateTime(checkOutHour, checkOutMinute),
        workHours: Math.round(workHours * 10) / 10,
        isOvertime
      });
    });
  }

  const taskOutputs: TaskOutput[] = [];
  const taskNames = ['功能开发', 'Bug修复', '代码重构', '单元测试', '集成测试', '代码审查', '文档编写', '技术调研'];
  
  employees.slice(0, 5).forEach(emp => {
    for (let i = 0; i < 10; i++) {
      const startDay = Math.floor(Math.random() * 20);
      const endDay = startDay + Math.floor(Math.random() * 10) + 1;
      const plannedHours = Math.floor(Math.random() * 40) + 8;
      const actualHours = Math.floor(plannedHours * (0.8 + Math.random() * 0.5));
      const efficiency = Math.round((plannedHours / actualHours) * 100) / 100;
      const statuses: TaskOutput['status'][] = ['pending', 'in-progress', 'completed'];
      const status = statuses[Math.floor(Math.random() * 3)];
      
      taskOutputs.push({
        id: generateId(),
        employeeId: emp.id,
        projectId: projects[Math.floor(Math.random() * projects.length)].id,
        taskName: taskNames[Math.floor(Math.random() * taskNames.length)],
        startDate: generateDate(startDay),
        endDate: generateDate(endDay),
        plannedHours,
        actualHours,
        status,
        efficiency
      });
    }
  });

  const projectHours: ProjectHours[] = [];
  const activities = ['需求分析', '架构设计', '编码开发', '测试验证', '部署上线', '运维支持', '会议沟通', '培训学习'];
  
  employees.slice(0, 8).forEach(emp => {
    for (let day = 1; day <= 30; day++) {
      const date = generateDate(day);
      const project = projects[Math.floor(Math.random() * projects.length)];
      const hours = Math.floor(Math.random() * 8) + 1;
      
      projectHours.push({
        id: generateId(),
        employeeId: emp.id,
        projectId: project.id,
        projectName: project.name,
        date,
        hours,
        activity: activities[Math.floor(Math.random() * activities.length)]
      });
    }
  });

  const collaborationRecords: CollaborationRecord[] = [];
  const collabTypes: CollaborationRecord['type'][] = ['meeting', 'email', 'chat', 'code-review'];
  
  for (let day = 1; day <= 30; day++) {
    const date = generateDate(day);
    for (let i = 0; i < 10; i++) {
      const fromIdx = Math.floor(Math.random() * employees.length);
      let toIdx = Math.floor(Math.random() * employees.length);
      while (toIdx === fromIdx) {
        toIdx = Math.floor(Math.random() * employees.length);
      }
      
      collaborationRecords.push({
        id: generateId(),
        fromEmployeeId: employees[fromIdx].id,
        toEmployeeId: employees[toIdx].id,
        date,
        type: collabTypes[Math.floor(Math.random() * collabTypes.length)],
        frequency: Math.floor(Math.random() * 5) + 1,
        duration: Math.floor(Math.random() * 120) + 15
      });
    }
  }

  const efficiencyMetrics: EfficiencyMetrics[] = [];
  employees.slice(0, 8).forEach(emp => {
    efficiencyMetrics.push({
      employeeId: emp.id,
      workEfficiency: Math.round((0.6 + Math.random() * 0.4) * 100) / 100,
      overtimeRate: Math.round(Math.random() * 0.4 * 100) / 100,
      taskCompletionRate: Math.round((0.7 + Math.random() * 0.3) * 100) / 100,
      collaborationScore: Math.round((0.5 + Math.random() * 0.5) * 100) / 100,
      overallScore: Math.round((0.6 + Math.random() * 0.4) * 100) / 100,
      period: '2026-04'
    });
  });

  const overtimeAlerts: OvertimeAlert[] = [];
  const overEmp = employees.slice(0, 8);
  for (let i = 0; i < 15; i++) {
    const emp = overEmp[Math.floor(Math.random() * overEmp.length)];
    const hours = Math.floor(Math.random() * 4) + 2;
    let severity: OvertimeAlert['severity'] = 'low';
    if (hours >= 4) severity = 'high';
    else if (hours >= 3) severity = 'medium';
    
    overtimeAlerts.push({
      id: generateId(),
      employeeId: emp.id,
      date: generateDate(Math.floor(Math.random() * 30)),
      hours,
      reason: '项目赶工',
      severity
    });
  }

  const allocationIssues: AllocationIssue[] = [];
  allocationIssues.push({
    id: generateId(),
    employeeId: 'emp-1',
    projectId: 'proj-1',
    issueType: 'over-allocated',
    hours: 55,
    period: '2026-04'
  });
  allocationIssues.push({
    id: generateId(),
    employeeId: 'emp-3',
    projectId: 'proj-2',
    issueType: 'under-allocated',
    hours: 20,
    period: '2026-04'
  });
  allocationIssues.push({
    id: generateId(),
    employeeId: 'emp-8',
    projectId: '',
    issueType: 'idle',
    hours: 0,
    period: '2026-04'
  });

  storage.write('departments', departments);
  storage.write('employees', employees);
  storage.write('projects', projects);
  storage.write('attendance', attendanceRecords);
  storage.write('tasks', taskOutputs);
  storage.write('projectHours', projectHours);
  storage.write('collaborations', collaborationRecords);
  storage.write('efficiencyMetrics', efficiencyMetrics);
  storage.write('overtimeAlerts', overtimeAlerts);
  storage.write('allocationIssues', allocationIssues);

  console.log('Mock data initialized successfully.');
}
