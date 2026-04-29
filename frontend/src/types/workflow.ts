export interface WorkflowStatus {
  id: string
  workflowId: string
  name: string
  category: 'todo' | 'in_progress' | 'done'
  color?: string
  description?: string
  isInitial: boolean
  isTerminal: boolean
  sortOrder: number
  createdAt: Date
  updatedAt: Date
}

export interface WorkflowTransition {
  id: string
  workflowId: string
  fromStatusId: string
  toStatusId: string
  name: string
  description?: string
  isAutomatic: boolean
  conditions?: WorkflowCondition[]
  actions?: WorkflowAction[]
  validators?: WorkflowValidator[]
  sortOrder: number
  createdAt: Date
  updatedAt: Date
}

export interface WorkflowCondition {
  id: string
  type: 'field_value' | 'user_permission' | 'group_membership' | 'script' | 'issue_type'
  configuration: Record<string, unknown>
}

export interface WorkflowAction {
  id: string
  type: 'set_field' | 'assign_user' | 'create_issue' | 'send_notification' | 'script'
  configuration: Record<string, unknown>
}

export interface WorkflowValidator {
  id: string
  type: 'required_field' | 'field_value' | 'permission' | 'script'
  configuration: Record<string, unknown>
  errorMessage?: string
}

export interface Workflow {
  id: string
  projectId: string
  name: string
  description?: string
  isSystem: boolean
  isActive: boolean
  issueTypeIds: string[]
  initialStatusId: string
  createdAt: Date
  updatedAt: Date
}

export interface ApprovalNode {
  id: string
  workflowId: string
  transitionId: string
  name: string
  description?: string
  approverType: 'user' | 'group' | 'role' | 'assignee' | 'reporter'
  approverIds?: string[]
  approvalRule: 'all' | 'any' | 'percentage'
  approvalPercentage?: number
  timeout?: number
  escalationPolicy?: EscalationPolicy
  sortOrder: number
  createdAt: Date
  updatedAt: Date
}

export interface EscalationPolicy {
  afterHours: number
  escalateToType: 'user' | 'group' | 'role'
  escalateToIds: string[]
  notifyOriginalApprovers: boolean
}

export interface WorkflowInstance {
  id: string
  issueId: string
  workflowId: string
  currentStatusId: string
  currentTransitionId?: string
  pendingApprovalNodeId?: string
  approvalStatus?: 'pending' | 'approved' | 'rejected'
  approvalHistory?: ApprovalHistory[]
  createdAt: Date
  updatedAt: Date
}

export interface ApprovalHistory {
  id: string
  workflowInstanceId: string
  approvalNodeId: string
  approverId: string
  action: 'approved' | 'rejected' | 'commented'
  comment?: string
  createdAt: Date
}
