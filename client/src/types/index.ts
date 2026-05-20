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
  sprintId: string | null;
  versionId: string | null;
  parentId: string | null;
  storyPoints: number;
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

export type UserRole = 'admin' | 'pm' | 'product' | 'frontend' | 'backend' | 'test' | 'designer' | 'developer' | 'dept_leader' | 'hr' | 'finance';

export type UserStatus = 'active' | 'inactive';

export interface User {
  id: string;
  username: string;
  email: string;
  realName: string;
  role: UserRole;
  avatar: string | null;
  phone: string | null;
  departmentId: string | null;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export type OrganizationType = 'company' | 'department' | 'team';

export interface Organization {
  id: string;
  name: string;
  parentId: string | null;
  type: OrganizationType;
  leaderId: string | null;
  description: string;
  sort: number;
  createdAt: string;
  updatedAt: string;
  children?: Organization[];
}

export type SprintStatus = 'planning' | 'active' | 'paused' | 'completed';

export interface Sprint {
  id: string;
  projectId: string;
  name: string;
  goal: string;
  startDate: string;
  endDate: string;
  status: SprintStatus;
  velocity: number;
  createdAt: string;
  updatedAt: string;
  tasks?: Task[];
  stats?: {
    totalTasks: number;
    completedTasks: number;
    remainingTasks: number;
    totalStoryPoints: number;
  };
}

export type BacklogItemType = 'feature' | 'enhancement' | 'bug' | 'epic';

export type BacklogItemStatus = 'backlog' | 'refined' | 'ready' | 'in_sprint' | 'done';

export interface BacklogItem {
  id: string;
  projectId: string;
  title: string;
  description: string;
  type: BacklogItemType;
  priority: TaskPriority;
  storyPoints: number;
  status: BacklogItemStatus;
  assignee: string | null;
  reporter: string;
  sprintId: string | null;
  sort: number;
  createdAt: string;
  updatedAt: string;
}

export type VersionType = 'sprint' | 'release';

export type VersionStatus = 'planning' | 'developing' | 'testing' | 'released' | 'archived';

export interface Version {
  id: string;
  projectId: string;
  name: string;
  type: VersionType;
  status: VersionStatus;
  releaseDate: string | null;
  description: string;
  createdAt: string;
  updatedAt: string;
  tasks?: Task[];
  taskStats?: {
    total: number;
    done: number;
    inProgress: number;
    todo: number;
    bugs: number;
  };
}

export interface BoardColumn {
  id: string;
  projectId: string;
  name: string;
  status: string;
  width: number;
  sort: number;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  realName: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
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

export const USER_ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: 'admin', label: '管理员' },
  { value: 'pm', label: '项目经理' },
  { value: 'product', label: '产品经理' },
  { value: 'frontend', label: '前端开发' },
  { value: 'backend', label: '后端开发' },
  { value: 'test', label: '测试工程师' },
  { value: 'designer', label: '设计师' },
  { value: 'developer', label: '开发工程师' },
  { value: 'dept_leader', label: '部门领导' },
  { value: 'hr', label: '人事' },
  { value: 'finance', label: '财务' },
];

export const ORGANIZATION_TYPE_OPTIONS: { value: OrganizationType; label: string }[] = [
  { value: 'company', label: '公司' },
  { value: 'department', label: '部门' },
  { value: 'team', label: '团队' },
];

export const SPRINT_STATUS_OPTIONS: { value: SprintStatus; label: string; color: string }[] = [
  { value: 'planning', label: '规划中', color: 'default' },
  { value: 'active', label: '进行中', color: 'processing' },
  { value: 'paused', label: '已暂停', color: 'warning' },
  { value: 'completed', label: '已完成', color: 'success' },
];

export const VERSION_TYPE_OPTIONS: { value: VersionType; label: string }[] = [
  { value: 'sprint', label: '迭代版本' },
  { value: 'release', label: '正式版本' },
];

export const VERSION_STATUS_OPTIONS: { value: VersionStatus; label: string; color: string }[] = [
  { value: 'planning', label: '规划中', color: 'default' },
  { value: 'developing', label: '开发中', color: 'processing' },
  { value: 'testing', label: '测试中', color: 'warning' },
  { value: 'released', label: '已发布', color: 'success' },
  { value: 'archived', label: '已归档', color: 'default' },
];

export const BACKLOG_TYPE_OPTIONS: { value: BacklogItemType; label: string; color: string }[] = [
  { value: 'epic', label: '史诗', color: 'purple' },
  { value: 'feature', label: '功能', color: 'blue' },
  { value: 'enhancement', label: '增强', color: 'cyan' },
  { value: 'bug', label: '缺陷', color: 'red' },
];

export const BACKLOG_STATUS_OPTIONS: { value: BacklogItemStatus; label: string; color: string }[] = [
  { value: 'backlog', label: '待办池', color: 'default' },
  { value: 'refined', label: '已细化', color: 'processing' },
  { value: 'ready', label: '就绪', color: 'blue' },
  { value: 'in_sprint', label: '迭代中', color: 'warning' },
  { value: 'done', label: '已完成', color: 'success' },
];
