export interface Employee {
  id: string;
  name: string;
  department: string;
  position: string;
  avatar?: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  checkIn: string;
  checkOut: string;
  workHours: number;
  isOvertime: boolean;
}

export interface TaskOutput {
  id: string;
  employeeId: string;
  projectId: string;
  taskName: string;
  startDate: string;
  endDate: string;
  plannedHours: number;
  actualHours: number;
  status: 'pending' | 'in-progress' | 'completed';
  efficiency: number;
}

export interface ProjectHours {
  id: string;
  employeeId: string;
  projectId: string;
  projectName: string;
  date: string;
  hours: number;
  activity: string;
}

export interface CollaborationRecord {
  id: string;
  fromEmployeeId: string;
  toEmployeeId: string;
  date: string;
  type: 'meeting' | 'email' | 'chat' | 'code-review';
  frequency: number;
  duration: number;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'on-hold';
  budget: number;
}

export interface Department {
  id: string;
  name: string;
  manager: string;
  employeeCount: number;
}

export interface EfficiencyMetrics {
  employeeId: string;
  workEfficiency: number;
  overtimeRate: number;
  taskCompletionRate: number;
  collaborationScore: number;
  overallScore: number;
  period: string;
}

export interface OvertimeAlert {
  id: string;
  employeeId: string;
  date: string;
  hours: number;
  reason: string;
  severity: 'low' | 'medium' | 'high';
}

export interface AllocationIssue {
  id: string;
  employeeId: string;
  projectId: string;
  issueType: 'over-allocated' | 'under-allocated' | 'idle';
  hours: number;
  period: string;
}
