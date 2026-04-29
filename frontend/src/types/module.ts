export interface Module {
  id: string
  projectId: string
  name: string
  key: string
  description?: string
  icon?: string
  color?: string
  parentId?: string
  leadId?: string
  defaultAssigneeId?: string
  isActive: boolean
  sortOrder: number
  createdAt: Date
  updatedAt: Date
}

export interface ModuleCreateInput {
  name: string
  key?: string
  description?: string
  icon?: string
  color?: string
  parentId?: string
  leadId?: string
  defaultAssigneeId?: string
}

export interface ModuleStats {
  totalIssues: number
  openIssues: number
  inProgressIssues: number
  doneIssues: number
  assignees: string[]
}

export interface ModuleTree extends Module {
  children?: ModuleTree[]
}
