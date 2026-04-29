export interface Project {
  id: string
  name: string
  key: string
  description?: string
  icon?: string
  ownerId: string
  leadId: string
  isPublic: boolean
  defaultIssueTypeId: string
  defaultWorkflowId: string
  category: 'software' | 'business' | 'ops'
  createdAt: Date
  updatedAt: Date
  archivedAt?: Date
}

export interface ProjectCreateInput {
  name: string
  key: string
  description?: string
  icon?: string
  leadId: string
  category?: 'software' | 'business' | 'ops'
  isPublic?: boolean
}

export interface ProjectStats {
  totalIssues: number
  openIssues: number
  inProgressIssues: number
  doneIssues: number
  sprintsTotal: number
  activeSprintId?: string
}
