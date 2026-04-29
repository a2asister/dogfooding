export type IssueType = 'requirement' | 'story' | 'task' | 'subtask' | 'bug' | 'testcase' | 'risk' | 'epic'

export type Priority = 'highest' | 'high' | 'medium' | 'low' | 'lowest'

export type IssueStatus = 'todo' | 'in_progress' | 'review' | 'done' | 'closed' | 'reopened' | 'blocked'

export interface IssueTypeConfig {
  id: string
  projectId: string
  name: string
  type: IssueType
  icon: string
  color: string
  description?: string
  isSystem: boolean
  isActive: boolean
  workflowId: string
  sortOrder: number
  createdAt: Date
  updatedAt: Date
}

export interface Issue {
  id: string
  projectId: string
  issueTypeId: string
  issueKey: string
  summary: string
  description?: string
  reporterId: string
  assigneeId?: string | null
  priority: Priority
  status: IssueStatus
  originalEstimate?: number | null
  remainingEstimate?: number | null
  timeSpent?: number | null
  dueDate?: Date | null
  startDate?: Date | null
  resolutionDate?: Date
  sprintId?: string | null
  versionIds?: string[]
  fixVersionIds?: string[]
  moduleIds?: string[]
  tagIds?: string[]
  parentId?: string | null
  epicId?: string | null
  environment?: string
  resolution?: string
  customFields?: Record<string, unknown>
  position: number
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date
}

export interface IssueCreateInput {
  projectId: string
  issueTypeId: string
  summary: string
  description?: string
  assigneeId?: string
  priority?: Priority
  originalEstimate?: number
  dueDate?: Date
  sprintId?: string
  versionIds?: string[]
  moduleIds?: string[]
  tagIds?: string[]
  parentId?: string
  epicId?: string
  customFields?: Record<string, unknown>
}

export interface IssueUpdateInput {
  summary?: string
  description?: string
  assigneeId?: string | null
  priority?: Priority
  status?: IssueStatus
  originalEstimate?: number | null
  remainingEstimate?: number | null
  timeSpent?: number | null
  dueDate?: Date | null
  startDate?: Date | null
  sprintId?: string | null
  versionIds?: string[]
  fixVersionIds?: string[]
  moduleIds?: string[]
  tagIds?: string[]
  parentId?: string | null
  epicId?: string | null
  environment?: string
  customFields?: Record<string, unknown>
  position?: number
  deletedAt?: Date
}

export interface IssueLink {
  id: string
  projectId: string
  sourceIssueId: string
  targetIssueId: string
  linkType: 'blocks' | 'blocked_by' | 'relates_to' | 'duplicates' | 'is_duplicated_by' | 'depends_on' | 'is_dependency_of'
  createdAt: Date
  updatedAt: Date
}

export interface SubTask extends Issue {
  parentId: string
}

export interface Epic extends Issue {
  color?: string
  epicName: string
}
