export interface Task {
  id: number;
  title: string;
  description?: string;
  progress: number;
  weight: number;
  deadline?: string;
  isCompleted: boolean;
  isOverdue: boolean;
  parentId?: number;
  level: number;
  order: number;
  isExpanded: boolean;
  children: Task[];
  createdAt: string;
  updatedAt: string;
}

export interface Statistics {
  total: number;
  completed: number;
  overdue: number;
  inProgress: number;
  notStarted: number;
  overallProgress: number;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  progress?: number;
  weight?: number;
  deadline?: string;
  parentId?: number;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  progress?: number;
  weight?: number;
  deadline?: string;
  isCompleted?: boolean;
  parentId?: number;
  isExpanded?: boolean;
}
