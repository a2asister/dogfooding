export interface Worklog {
  id: string
  projectId: string
  issueId: string
  authorId: string
  timeSpent: number
  remainingEstimate?: number
  startDate: Date
  endDate?: Date
  description?: string
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date
}

export interface WorklogCreateInput {
  issueId: string
  timeSpent: number
  remainingEstimate?: number
  startDate: Date
  description?: string
}

export interface WorklogUpdateInput {
  timeSpent?: number
  remainingEstimate?: number
  startDate?: Date
  endDate?: Date
  description?: string
}

export interface TimesheetEntry {
  id: string
  userId: string
  date: Date
  worklogIds: string[]
  totalHours: number
  projectBreakdown: {
    projectId: string
    projectName: string
    hours: number
    issueCount: number
  }[]
}

export interface TimeTrackingStats {
  totalEstimated: number
  totalSpent: number
  totalRemaining: number
  byAssignee: {
    userId: string
    userName: string
    estimated: number
    spent: number
    remaining: number
  }[]
  byIssueType: {
    issueTypeId: string
    issueTypeName: string
    estimated: number
    spent: number
    remaining: number
  }[]
}
