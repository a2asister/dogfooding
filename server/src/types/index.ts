export type ProjectType = 'software' | 'general';

export type ProjectStatus = 'active' | 'archived';

export interface Project {
  id: string;
  name: string;
  type: ProjectType;
  manager: string;
  startDate: string;
  endDate: string;
  description: string;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
}

export type TaskType = 'requirement' | 'task' | 'bug' | 'optimization' | 'subtask';

export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'closed';

export type TaskPriority = 'highest' | 'high' | 'medium' | 'low' | 'lowest';

export interface Task {
  id: string;
  projectId: string;
  title: string;
  type: TaskType;
  status: TaskStatus;
  priority: TaskPriority;
  description: string;
  assignee: string;
  reporter: string;
  dueDate: string;
  iteration: string;
  parentId: string | null;
  isPinned: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export type TaskLogAction =
  | 'create'
  | 'update'
  | 'status_change'
  | 'assign'
  | 'pin'
  | 'unpin'
  | 'archive'
  | 'unarchive'
  | 'delete';

export interface TaskLog {
  id: string;
  taskId: string;
  action: TaskLogAction;
  oldValue: string | null;
  newValue: string | null;
  operator: string;
  createdAt: string;
}

export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
}
