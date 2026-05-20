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

export const TASK_TYPE_OPTIONS: { value: TaskType; label: string; color: string }[] = [
  { value: 'requirement', label: '需求', color: 'purple' },
  { value: 'task', label: '开发任务', color: 'blue' },
  { value: 'bug', label: 'Bug', color: 'red' },
  { value: 'optimization', label: '优化', color: 'cyan' },
  { value: 'subtask', label: '子任务', color: 'green' },
];

export const TASK_STATUS_OPTIONS: { value: TaskStatus; label: string; color: string }[] = [
  { value: 'todo', label: '待处理', color: 'default' },
  { value: 'in_progress', label: '进行中', color: 'processing' },
  { value: 'done', label: '已完成', color: 'success' },
  { value: 'closed', label: '已关闭', color: 'warning' },
];

export const TASK_PRIORITY_OPTIONS: { value: TaskPriority; label: string; color: string }[] = [
  { value: 'highest', label: '最高', color: 'red' },
  { value: 'high', label: '高', color: 'orange' },
  { value: 'medium', label: '中', color: 'blue' },
  { value: 'low', label: '低', color: 'cyan' },
  { value: 'lowest', label: '最低', color: 'gray' },
];

export const PROJECT_TYPE_OPTIONS: { value: ProjectType; label: string }[] = [
  { value: 'software', label: '软件研发' },
  { value: 'general', label: '通用项目' },
];
