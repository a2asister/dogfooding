export type SprintStatus = 'future' | 'active' | 'completed' | 'closed'

export interface Sprint {
  id: string
  projectId: string
  name: string
  goal?: string
  status: SprintStatus
  startDate?: Date
  endDate?: Date
  completedDate?: Date
  originalEstimateSum?: number
  remainingEstimateSum?: number
  timeSpentSum?: number
  issueCount?: number
  completedIssueCount?: number
  sortOrder: number
  createdAt: Date
  updatedAt: Date
}

export interface SprintCreateInput {
  name: string
  goal?: string
  startDate?: Date
  endDate?: Date
}

export interface SprintStats {
  totalIssues: number
  totalStoryPoints?: number
  completedStoryPoints?: number
  remainingStoryPoints?: number
  completedIssues: number
  inProgressIssues: number
  todoIssues: number
  blockedIssues: number
  velocity?: number
  burndownData: BurndownDataPoint[]
}

export interface BurndownDataPoint {
  date: Date
  idealStoryPoints: number
  actualStoryPoints: number
}

export interface SprintPlanningIssue {
  issueId: string
  issueKey: string
  summary: string
  issueTypeId: string
  priority: string
  storyPoints?: number
  assigneeId?: string
  currentSprintId?: string
  backlogPosition: number
}
