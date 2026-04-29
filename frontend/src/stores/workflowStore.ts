import { create } from 'zustand'
import type {
  Workflow, WorkflowStatus, WorkflowTransition, WorkflowInstance,
  ApprovalNode, ApprovalHistory, WorkflowCondition, WorkflowAction
} from '@/types'
import { db } from '@/db'
import { generateId, now } from '@/utils'
import { useAuthStore } from './authStore'

interface WorkflowState {
  workflows: Workflow[]
  currentWorkflow: Workflow | null
  workflowStatuses: WorkflowStatus[]
  workflowTransitions: WorkflowTransition[]
  workflowInstances: WorkflowInstance[]
  approvalNodes: ApprovalNode[]
  isLoading: boolean
  isSubmitting: boolean
  error: string | null

  fetchWorkflows: (projectId: string) => Promise<void>
  fetchWorkflowStatuses: (workflowId: string) => Promise<void>
  fetchWorkflowTransitions: (workflowId: string) => Promise<void>
  fetchWorkflowInstance: (issueId: string) => Promise<void>
  createWorkflow: (workflow: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Workflow | null>
  updateWorkflow: (id: string, updates: Partial<Workflow>) => Promise<boolean>
  deleteWorkflow: (id: string) => Promise<boolean>

  getAvailableTransitions: (issueId: string) => Promise<WorkflowTransition[]>
  executeTransition: (issueId: string, transitionId: string) => Promise<boolean>

  getApprovalNodes: (transitionId: string) => Promise<ApprovalNode[]>
  submitForApproval: (issueId: string, transitionId: string) => Promise<boolean>
  approve: (approvalNodeId: string, comment?: string) => Promise<boolean>
  reject: (approvalNodeId: string, comment?: string) => Promise<boolean>

  evaluateCondition: (condition: WorkflowCondition, issueId: string) => Promise<boolean>
  executeAction: (action: WorkflowAction, issueId: string) => Promise<void>

  setCurrentWorkflow: (workflow: Workflow | null) => void
  clearError: () => void
}

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  workflows: [],
  currentWorkflow: null,
  workflowStatuses: [],
  workflowTransitions: [],
  workflowInstances: [],
  approvalNodes: [],
  isLoading: false,
  isSubmitting: false,
  error: null,

  fetchWorkflows: async (projectId: string): Promise<void> => {
    set({ isLoading: true, error: null })
    try {
      const workflows = await db.workflows
        .where('projectId')
        .equals(projectId)
        .sortBy('createdAt')
      set({ workflows, isLoading: false })
    } catch (error) {
      console.error('Fetch workflows error:', error)
      set({ isLoading: false, error: '加载工作流失败', workflows: [] })
    }
  },

  fetchWorkflowStatuses: async (workflowId: string): Promise<void> => {
    set({ isLoading: true, error: null })
    try {
      const statuses = await db.workflowStatuses
        .where('workflowId')
        .equals(workflowId)
        .sortBy('sortOrder')
      set({ workflowStatuses: statuses, isLoading: false })
    } catch (error) {
      console.error('Fetch workflow statuses error:', error)
      set({ isLoading: false, error: '加载工作流状态失败', workflowStatuses: [] })
    }
  },

  fetchWorkflowTransitions: async (workflowId: string): Promise<void> => {
    set({ isLoading: true, error: null })
    try {
      const transitions = await db.workflowTransitions
        .where('workflowId')
        .equals(workflowId)
        .sortBy('sortOrder')
      set({ workflowTransitions: transitions, isLoading: false })
    } catch (error) {
      console.error('Fetch workflow transitions error:', error)
      set({ isLoading: false, error: '加载工作流流转失败', workflowTransitions: [] })
    }
  },

  fetchWorkflowInstance: async (issueId: string): Promise<void> => {
    set({ isLoading: true, error: null })
    try {
      const instance = await db.workflowInstances
        .where('issueId')
        .equals(issueId)
        .first()
      set({ 
        workflowInstances: instance ? [instance] : [], 
        isLoading: false 
      })
    } catch (error) {
      console.error('Fetch workflow instance error:', error)
      set({ isLoading: false, error: '加载工作流实例失败' })
    }
  },

  createWorkflow: async (workflow: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt'>): Promise<Workflow | null> => {
    set({ isSubmitting: true, error: null })
    try {
      const newWorkflow: Workflow = {
        ...workflow,
        id: generateId(),
        createdAt: now(),
        updatedAt: now(),
      }
      await db.workflows.add(newWorkflow)
      set((state) => ({
        workflows: [...state.workflows, newWorkflow],
        isSubmitting: false,
      }))
      return newWorkflow
    } catch (error) {
      console.error('Create workflow error:', error)
      set({ isSubmitting: false, error: '创建工作流失败' })
      return null
    }
  },

  updateWorkflow: async (id: string, updates: Partial<Workflow>): Promise<boolean> => {
    set({ isSubmitting: true, error: null })
    try {
      const existing = await db.workflows.get(id)
      if (!existing) {
        set({ isSubmitting: false, error: '工作流不存在' })
        return false
      }
      const updated: Workflow = { ...existing, ...updates, updatedAt: now() }
      await db.workflows.put(updated)
      set((state) => ({
        workflows: state.workflows.map(w => w.id === id ? updated : w),
        currentWorkflow: state.currentWorkflow?.id === id ? updated : state.currentWorkflow,
        isSubmitting: false,
      }))
      return true
    } catch (error) {
      console.error('Update workflow error:', error)
      set({ isSubmitting: false, error: '更新工作流失败' })
      return false
    }
  },

  deleteWorkflow: async (id: string): Promise<boolean> => {
    set({ isLoading: true, error: null })
    try {
      await db.workflowStatuses.where('workflowId').equals(id).delete()
      await db.workflowTransitions.where('workflowId').equals(id).delete()
      await db.approvalNodes.where('workflowId').equals(id).delete()
      await db.workflows.delete(id)
      set((state) => ({
        workflows: state.workflows.filter(w => w.id !== id),
        currentWorkflow: state.currentWorkflow?.id === id ? null : state.currentWorkflow,
        isLoading: false,
      }))
      return true
    } catch (error) {
      console.error('Delete workflow error:', error)
      set({ isLoading: false, error: '删除工作流失败' })
      return false
    }
  },

  getAvailableTransitions: async (issueId: string): Promise<WorkflowTransition[]> => {
    try {
      const instance = await db.workflowInstances
        .where('issueId')
        .equals(issueId)
        .first()

      if (!instance) return []

      if (instance.pendingApprovalNodeId) return []

      const transitions = await db.workflowTransitions
        .where('workflowId')
        .equals(instance.workflowId)
        .and(t => t.fromStatusId === instance.currentStatusId)
        .sortBy('sortOrder')

      const availableTransitions: WorkflowTransition[] = []
      for (const transition of transitions) {
        let canExecute = true
        if (transition.conditions && transition.conditions.length > 0) {
          for (const condition of transition.conditions) {
            const satisfied = await get().evaluateCondition(condition, issueId)
            if (!satisfied) {
              canExecute = false
              break
            }
          }
        }
        if (canExecute) {
          availableTransitions.push(transition)
        }
      }

      return availableTransitions
    } catch (error) {
      console.error('Get available transitions error:', error)
      return []
    }
  },

  executeTransition: async (issueId: string, transitionId: string): Promise<boolean> => {
    set({ isSubmitting: true, error: null })
    try {
      const instance = await db.workflowInstances
        .where('issueId')
        .equals(issueId)
        .first()

      if (!instance) {
        set({ isSubmitting: false, error: '工作流实例不存在' })
        return false
      }

      if (instance.pendingApprovalNodeId) {
        set({ isSubmitting: false, error: '该事项正在审批中' })
        return false
      }

      const transition = await db.workflowTransitions.get(transitionId)
      if (!transition) {
        set({ isSubmitting: false, error: '流转不存在' })
        return false
      }

      if (transition.conditions && transition.conditions.length > 0) {
        for (const condition of transition.conditions) {
          const satisfied = await get().evaluateCondition(condition, issueId)
          if (!satisfied) {
            set({ isSubmitting: false, error: '条件不满足，无法执行此流转' })
            return false
          }
        }
      }

      const approvalNodes = await db.approvalNodes
        .where('transitionId')
        .equals(transitionId)
        .sortBy('sortOrder')

      if (approvalNodes.length > 0) {
        const updatedInstance: WorkflowInstance = {
          ...instance,
          currentTransitionId: transitionId,
          pendingApprovalNodeId: approvalNodes[0].id,
          approvalStatus: 'pending',
          updatedAt: now(),
        }
        await db.workflowInstances.put(updatedInstance)
        set((state) => ({
          workflowInstances: state.workflowInstances.map(wi => 
            wi.id === updatedInstance.id ? updatedInstance : wi
          ),
          isSubmitting: false,
        }))
        return true
      }

      const toStatus = await db.workflowStatuses.get(transition.toStatusId)
      
      const updatedInstance: WorkflowInstance = {
        ...instance,
        currentStatusId: transition.toStatusId,
        currentTransitionId: undefined,
        pendingApprovalNodeId: undefined,
        approvalStatus: undefined,
        updatedAt: now(),
      }
      await db.workflowInstances.put(updatedInstance)

      if (transition.actions && transition.actions.length > 0) {
        for (const action of transition.actions) {
          await get().executeAction(action, issueId)
        }
      }

      const issue = await db.issues.get(issueId)
      if (issue && toStatus) {
        const statusMap: Record<string, 'todo' | 'in_progress' | 'review' | 'done' | 'closed' | 'reopened' | 'blocked'> = {
          'todo': 'todo',
          'in_progress': 'in_progress',
          'review': 'review',
          'done': 'done',
          'closed': 'closed',
          'reopened': 'reopened',
          'blocked': 'blocked',
        }
        const newStatus = statusMap[toStatus.category] || toStatus.category as any
        await db.issues.update(issueId, { 
          status: newStatus, 
          updatedAt: now() 
        })
      }

      set((state) => ({
        workflowInstances: state.workflowInstances.map(wi => 
          wi.id === updatedInstance.id ? updatedInstance : wi
        ),
        isSubmitting: false,
      }))

      return true
    } catch (error) {
      console.error('Execute transition error:', error)
      set({ isSubmitting: false, error: '执行流转失败' })
      return false
    }
  },

  getApprovalNodes: async (transitionId: string): Promise<ApprovalNode[]> => {
    try {
      return await db.approvalNodes
        .where('transitionId')
        .equals(transitionId)
        .sortBy('sortOrder')
    } catch (error) {
      console.error('Get approval nodes error:', error)
      return []
    }
  },

  submitForApproval: async (issueId: string, transitionId: string): Promise<boolean> => {
    return get().executeTransition(issueId, transitionId)
  },

  approve: async (approvalNodeId: string, comment?: string): Promise<boolean> => {
    set({ isSubmitting: true, error: null })
    try {
      const currentUser = useAuthStore.getState().currentUser
      if (!currentUser) {
        set({ isSubmitting: false, error: '请先登录' })
        return false
      }

      const approvalNode = await db.approvalNodes.get(approvalNodeId)
      if (!approvalNode) {
        set({ isSubmitting: false, error: '审批节点不存在' })
        return false
      }

      const instance = await db.workflowInstances
        .where('pendingApprovalNodeId')
        .equals(approvalNodeId)
        .first()

      if (!instance) {
        set({ isSubmitting: false, error: '找不到待审批的工作流实例' })
        return false
      }

      const approvalHistory: ApprovalHistory = {
        id: generateId(),
        workflowInstanceId: instance.id,
        approvalNodeId,
        approverId: currentUser.id,
        action: 'approved',
        comment,
        createdAt: now(),
      }

      const existingApprovalHistory = instance.approvalHistory || []
      const updatedHistory = [...existingApprovalHistory, approvalHistory]

      const allApprovals = updatedHistory.filter(h => 
        h.approvalNodeId === approvalNodeId && h.action === 'approved'
      )

      let approved = false
      if (approvalNode.approvalRule === 'all') {
        const approverCount = approvalNode.approverIds?.length || 1
        approved = allApprovals.length >= approverCount
      } else if (approvalNode.approvalRule === 'any') {
        approved = allApprovals.length >= 1
      } else if (approvalNode.approvalRule === 'percentage') {
        const percentage = approvalNode.approvalPercentage || 50
        const approverCount = approvalNode.approverIds?.length || 1
        approved = (allApprovals.length / approverCount) * 100 >= percentage
      }

      if (approved) {
        const allApprovalNodes = await db.approvalNodes
          .where('transitionId')
          .equals(approvalNode.transitionId)
          .sortBy('sortOrder')

        const currentIndex = allApprovalNodes.findIndex((n: ApprovalNode) => n.id === approvalNodeId)
        const nextNode = allApprovalNodes[currentIndex + 1]

        if (nextNode) {
          const updatedInstance: WorkflowInstance = {
            ...instance,
            pendingApprovalNodeId: nextNode.id,
            approvalHistory: updatedHistory,
            updatedAt: now(),
          }
          await db.workflowInstances.put(updatedInstance)
          set((state) => ({
            workflowInstances: state.workflowInstances.map(wi => 
              wi.id === updatedInstance.id ? updatedInstance : wi
            ),
            isSubmitting: false,
          }))
        } else {
          const transition = await db.workflowTransitions.get(approvalNode.transitionId)
          if (transition) {
            const toStatus = await db.workflowStatuses.get(transition.toStatusId)
            const statusMap: Record<string, 'todo' | 'in_progress' | 'review' | 'done' | 'closed' | 'reopened' | 'blocked'> = {
              'todo': 'todo',
              'in_progress': 'in_progress',
              'review': 'review',
              'done': 'done',
              'closed': 'closed',
              'reopened': 'reopened',
              'blocked': 'blocked',
            }
            const newStatus = toStatus ? (statusMap[toStatus.category] || toStatus.category as any) : 'done'
            
            const updatedInstance: WorkflowInstance = {
              ...instance,
              currentStatusId: transition.toStatusId,
              currentTransitionId: undefined,
              pendingApprovalNodeId: undefined,
              approvalStatus: 'approved',
              approvalHistory: updatedHistory,
              updatedAt: now(),
            }
            await db.workflowInstances.put(updatedInstance)

            if (transition.actions && transition.actions.length > 0) {
              for (const action of transition.actions) {
                await get().executeAction(action, instance.issueId)
              }
            }

            const issue = await db.issues.get(instance.issueId)
            if (issue) {
              await db.issues.update(instance.issueId, { 
                status: newStatus, 
                updatedAt: now() 
              })
            }

            set((state) => ({
              workflowInstances: state.workflowInstances.map(wi => 
                wi.id === updatedInstance.id ? updatedInstance : wi
              ),
              isSubmitting: false,
            }))
          }
        }
      } else {
        const updatedInstance: WorkflowInstance = {
          ...instance,
          approvalHistory: updatedHistory,
          updatedAt: now(),
        }
        await db.workflowInstances.put(updatedInstance)
        set((state) => ({
          workflowInstances: state.workflowInstances.map(wi => 
            wi.id === updatedInstance.id ? updatedInstance : wi
          ),
          isSubmitting: false,
        }))
      }

      return true
    } catch (error) {
      console.error('Approve error:', error)
      set({ isSubmitting: false, error: '审批失败' })
      return false
    }
  },

  reject: async (approvalNodeId: string, comment?: string): Promise<boolean> => {
    set({ isSubmitting: true, error: null })
    try {
      const currentUser = useAuthStore.getState().currentUser
      if (!currentUser) {
        set({ isSubmitting: false, error: '请先登录' })
        return false
      }

      const instance = await db.workflowInstances
        .where('pendingApprovalNodeId')
        .equals(approvalNodeId)
        .first()

      if (!instance) {
        set({ isSubmitting: false, error: '找不到待审批的工作流实例' })
        return false
      }

      const approvalHistory: ApprovalHistory = {
        id: generateId(),
        workflowInstanceId: instance.id,
        approvalNodeId,
        approverId: currentUser.id,
        action: 'rejected',
        comment,
        createdAt: now(),
      }

      const updatedInstance: WorkflowInstance = {
        ...instance,
        currentTransitionId: undefined,
        pendingApprovalNodeId: undefined,
        approvalStatus: 'rejected',
        approvalHistory: [...(instance.approvalHistory || []), approvalHistory],
        updatedAt: now(),
      }

      await db.workflowInstances.put(updatedInstance)
      set((state) => ({
        workflowInstances: state.workflowInstances.map(wi => 
          wi.id === updatedInstance.id ? updatedInstance : wi
        ),
        isSubmitting: false,
      }))

      return true
    } catch (error) {
      console.error('Reject error:', error)
      set({ isSubmitting: false, error: '拒绝审批失败' })
      return false
    }
  },

  evaluateCondition: async (condition: WorkflowCondition, issueId: string): Promise<boolean> => {
    try {
      const issue = await db.issues.get(issueId)
      if (!issue) return false

      switch (condition.type) {
        case 'field_value': {
          const { field, operator, value } = condition.configuration as {
            field: string
            operator: string
            value: unknown
          }
          const issueValue = (issue as unknown as Record<string, unknown>)[field]
          switch (operator) {
            case 'equals': return issueValue === value
            case 'not_equals': return issueValue !== value
            case 'greater_than': return Number(issueValue) > Number(value)
            case 'less_than': return Number(issueValue) < Number(value)
            case 'contains': return String(issueValue).includes(String(value))
            case 'is_null': return issueValue === null || issueValue === undefined
            case 'is_not_null': return issueValue !== null && issueValue !== undefined
            default: return true
          }
        }
        case 'user_permission': {
          const { permission } = condition.configuration as { permission: string }
          const currentUser = useAuthStore.getState().currentUser
          if (!currentUser) return false
          return true
        }
        case 'group_membership': {
          const { groupId } = condition.configuration as { groupId: string }
          return true
        }
        case 'issue_type': {
          const { issueTypeIds } = condition.configuration as { issueTypeIds: string[] }
          return issueTypeIds.includes(issue.issueTypeId)
        }
        case 'script': {
          return true
        }
        default:
          return true
      }
    } catch (error) {
      console.error('Evaluate condition error:', error)
      return true
    }
  },

  executeAction: async (action: WorkflowAction, issueId: string): Promise<void> => {
    try {
      const currentUser = useAuthStore.getState().currentUser

      switch (action.type) {
        case 'set_field': {
          const { field, value } = action.configuration as { field: string; value: unknown }
          await db.issues.update(issueId, { 
            [field]: value, 
            updatedAt: now() 
          } as any)
          break
        }
        case 'assign_user': {
          const { userId } = action.configuration as { userId: string }
          await db.issues.update(issueId, { 
            assigneeId: userId, 
            updatedAt: now() 
          })
          break
        }
        case 'create_issue': {
          const { issueType, summary } = action.configuration as { issueType: string; summary: string }
          const issue = await db.issues.get(issueId)
          if (issue && currentUser) {
            const newIssue = {
              id: generateId(),
              projectId: issue.projectId,
              issueTypeId: issueType,
              issueKey: `${issue.issueKey.split('-')[0]}-NEW`,
              summary,
              reporterId: currentUser.id,
              priority: 'medium' as const,
              status: 'todo' as const,
              position: 0,
              createdAt: now(),
              updatedAt: now(),
            }
            await db.issues.add(newIssue as any)
          }
          break
        }
        case 'send_notification': {
          const { recipientType, recipientIds, message } = action.configuration as {
            recipientType: string
            recipientIds: string[]
            message: string
          }
          if (currentUser) {
            const notification = {
              id: generateId(),
              userId: currentUser.id,
              notificationType: 'system' as const,
              title: '工作流通知',
              content: message,
              status: 'unread' as const,
              createdAt: now(),
              updatedAt: now(),
            }
            await db.notifications.add(notification as any)
          }
          break
        }
        case 'script': {
          break
        }
      }
    } catch (error) {
      console.error('Execute action error:', error)
    }
  },

  setCurrentWorkflow: (workflow: Workflow | null): void => {
    set({ currentWorkflow: workflow })
  },

  clearError: (): void => {
    set({ error: null })
  },
}))

export default useWorkflowStore
