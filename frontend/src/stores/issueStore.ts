import { create } from 'zustand'
import type { 
  Issue, IssueCreateInput, IssueUpdateInput, 
  IssueTypeConfig, IssueLink 
} from '@/types'
import { db } from '@/db'
import { generateId, now } from '@/utils'
import { useAuthStore } from './authStore'
import { useProjectStore } from './projectStore'

interface IssueState {
  issues: Issue[]
  currentIssue: Issue | null
  issueTypes: IssueTypeConfig[]
  issueLinks: IssueLink[]
  isLoading: boolean
  isSubmitting: boolean
  error: string | null
  selectedIssueIds: string[]
  lastIssueNumber: number
  
  fetchIssues: (projectId: string, filters?: Record<string, unknown>) => Promise<void>
  fetchIssue: (id: string) => Promise<void>
  fetchIssueTypes: (projectId: string) => Promise<void>
  createIssue: (input: IssueCreateInput) => Promise<Issue | null>
  updateIssue: (id: string, updates: IssueUpdateInput) => Promise<boolean>
  deleteIssue: (id: string) => Promise<boolean>
  bulkUpdateIssues: (ids: string[], updates: IssueUpdateInput) => Promise<boolean>
  createIssueLink: (sourceId: string, targetId: string, linkType: IssueLink['linkType']) => Promise<boolean>
  removeIssueLink: (linkId: string) => Promise<boolean>
  setCurrentIssue: (issue: Issue | null) => void
  setSelectedIssueIds: (ids: string[]) => void
  clearSelectedIssues: () => void
  clearError: () => void
}

export const useIssueStore = create<IssueState>((set, get) => ({
  issues: [],
  currentIssue: null,
  issueTypes: [],
  issueLinks: [],
  isLoading: false,
  isSubmitting: false,
  error: null,
  selectedIssueIds: [],
  lastIssueNumber: 0,

  fetchIssues: async (projectId: string, filters?: Record<string, unknown>): Promise<void> => {
    set({ isLoading: true, error: null })
    
    try {
      let query = db.issues.where('projectId').equals(projectId)
      
      let issues = await query.toArray()
      
      if (filters) {
        if (filters.status) {
          issues = issues.filter(i => i.status === filters.status)
        }
        if (filters.assigneeId) {
          issues = issues.filter(i => i.assigneeId === filters.assigneeId)
        }
        if (filters.sprintId) {
          issues = issues.filter(i => i.sprintId === filters.sprintId)
        }
        if (filters.issueTypeId) {
          issues = issues.filter(i => i.issueTypeId === filters.issueTypeId)
        }
        if (filters.parentId !== undefined) {
          if (filters.parentId === null) {
            issues = issues.filter(i => !i.parentId)
          } else {
            issues = issues.filter(i => i.parentId === filters.parentId)
          }
        }
        if (filters.priority) {
          issues = issues.filter(i => i.priority === filters.priority)
        }
        if (filters.searchText) {
          const search = (filters.searchText as string).toLowerCase()
          issues = issues.filter(i => 
            i.summary.toLowerCase().includes(search) ||
            i.issueKey.toLowerCase().includes(search) ||
            (i.description && i.description.toLowerCase().includes(search))
          )
        }
      }
      
      issues.sort((a, b) => a.position - b.position)
      
      const maxKey = Math.max(
        0,
        ...issues.map(i => {
          const match = i.issueKey.match(/-(\d+)$/)
          return match ? parseInt(match[1]) : 0
        })
      )

      set({ 
        issues, 
        isLoading: false,
        lastIssueNumber: maxKey
      })
    } catch (error) {
      console.error('Fetch issues error:', error)
      set({ 
        isLoading: false, 
        error: '加载事项列表失败',
        issues: [] 
      })
    }
  },

  fetchIssue: async (id: string): Promise<void> => {
    set({ isLoading: true, error: null })
    
    try {
      const issue = await db.issues.get(id)
      
      if (!issue) {
        set({ 
          isLoading: false, 
          error: '事项不存在',
          currentIssue: null 
        })
        return
      }

      const links = await db.issueLinks
        .where('sourceIssueId')
        .equals(id)
        .or('targetIssueId')
        .equals(id)
        .toArray()

      set({ 
        currentIssue: issue, 
        issueLinks: links,
        isLoading: false 
      })
    } catch (error) {
      console.error('Fetch issue error:', error)
      set({ 
        isLoading: false, 
        error: '加载事项详情失败',
        currentIssue: null 
      })
    }
  },

  fetchIssueTypes: async (projectId: string): Promise<void> => {
    set({ isLoading: true, error: null })
    
    try {
      const issueTypes = await db.issueTypes
        .where('projectId')
        .equals(projectId)
        .filter(t => t.isActive)
        .sortBy('sortOrder')

      set({ 
        issueTypes, 
        isLoading: false 
      })
    } catch (error) {
      console.error('Fetch issue types error:', error)
      set({ 
        isLoading: false, 
        error: '加载事项类型失败' 
      })
    }
  },

  createIssue: async (input: IssueCreateInput): Promise<Issue | null> => {
    set({ isSubmitting: true, error: null })
    
    try {
      const currentUser = useAuthStore.getState().currentUser
      const currentProject = useProjectStore.getState().currentProject
      
      if (!currentUser || !currentProject) {
        set({ isSubmitting: false, error: '请先登录并选择项目' })
        return null
      }

      const newIssueNumber = get().lastIssueNumber + 1
      const issueKey = `${currentProject.key}-${newIssueNumber}`

      const maxPosition = Math.max(-1, ...get().issues.map(i => i.position))

      const issue: Issue = {
        id: generateId(),
        projectId: input.projectId,
        issueTypeId: input.issueTypeId,
        issueKey,
        summary: input.summary,
        description: input.description,
        reporterId: currentUser.id,
        assigneeId: input.assigneeId,
        priority: input.priority || 'medium',
        status: 'todo',
        originalEstimate: input.originalEstimate,
        remainingEstimate: input.originalEstimate,
        timeSpent: 0,
        dueDate: input.dueDate,
        sprintId: input.sprintId,
        versionIds: input.versionIds,
        moduleIds: input.moduleIds,
        tagIds: input.tagIds,
        parentId: input.parentId,
        epicId: input.epicId,
        customFields: input.customFields,
        position: maxPosition + 1,
        createdAt: now(),
        updatedAt: now(),
      }

      await db.issues.add(issue)

      set((state) => ({
        issues: [...state.issues, issue],
        lastIssueNumber: newIssueNumber,
        isSubmitting: false,
      }))

      return issue
    } catch (error) {
      console.error('Create issue error:', error)
      set({ 
        isSubmitting: false, 
        error: '创建事项失败' 
      })
      return null
    }
  },

  updateIssue: async (id: string, updates: IssueUpdateInput): Promise<boolean> => {
    set({ isSubmitting: true, error: null })
    
    try {
      const existingIssue = await db.issues.get(id)
      
      if (!existingIssue) {
        set({ isSubmitting: false, error: '事项不存在' })
        return false
      }

      const updatedIssue: Issue = {
        ...existingIssue,
        ...updates,
        updatedAt: now(),
      }

      await db.issues.put(updatedIssue)

      set((state) => ({
        issues: state.issues.map(i => 
          i.id === id ? updatedIssue : i
        ),
        currentIssue: state.currentIssue?.id === id 
          ? updatedIssue 
          : state.currentIssue,
        isSubmitting: false,
      }))

      return true
    } catch (error) {
      console.error('Update issue error:', error)
      set({ 
        isSubmitting: false, 
        error: '更新事项失败' 
      })
      return false
    }
  },

  deleteIssue: async (id: string): Promise<boolean> => {
    set({ isLoading: true, error: null })
    
    try {
      await db.issueLinks
        .where('sourceIssueId')
        .equals(id)
        .or('targetIssueId')
        .equals(id)
        .delete()
      
      await db.comments.where('issueId').equals(id).delete()
      await db.worklogs.where('issueId').equals(id).delete()
      await db.activities.where('issueId').equals(id).delete()
      
      const subTasks = await db.issues
        .where('parentId')
        .equals(id)
        .toArray()
      
      for (const subTask of subTasks) {
        await db.issues.update(subTask.id, { parentId: undefined })
      }
      
      await db.issues.delete(id)

      set((state) => ({
        issues: state.issues.filter(i => i.id !== id),
        currentIssue: state.currentIssue?.id === id 
          ? null 
          : state.currentIssue,
        issueLinks: state.issueLinks.filter(l => 
          l.sourceIssueId !== id && l.targetIssueId !== id
        ),
        isLoading: false,
      }))

      return true
    } catch (error) {
      console.error('Delete issue error:', error)
      set({ 
        isLoading: false, 
        error: '删除事项失败' 
      })
      return false
    }
  },

  bulkUpdateIssues: async (ids: string[], updates: IssueUpdateInput): Promise<boolean> => {
    set({ isSubmitting: true, error: null })
    
    try {
      const currentTime = now()
      
      for (const id of ids) {
        const existingIssue = await db.issues.get(id)
        if (existingIssue) {
          const updatedIssue: Issue = {
            ...existingIssue,
            ...updates,
            updatedAt: currentTime,
          }
          await db.issues.put(updatedIssue)
        }
      }

      const currentIssues = get().issues
      const updatedIssues = currentIssues.map(i => 
        ids.includes(i.id) 
          ? { ...i, ...updates, updatedAt: currentTime } 
          : i
      )

      set({
        issues: updatedIssues,
        isSubmitting: false,
        selectedIssueIds: [],
      })

      return true
    } catch (error) {
      console.error('Bulk update issues error:', error)
      set({ 
        isSubmitting: false, 
        error: '批量更新失败' 
      })
      return false
    }
  },

  createIssueLink: async (
    sourceId: string, 
    targetId: string, 
    linkType: IssueLink['linkType']
  ): Promise<boolean> => {
    set({ isSubmitting: true, error: null })
    
    try {
      if (sourceId === targetId) {
        set({ isSubmitting: false, error: '不能关联自身' })
        return false
      }

      const existingLink = await db.issueLinks
        .where('sourceIssueId')
        .equals(sourceId)
        .and(l => l.targetIssueId === targetId && l.linkType === linkType)
        .first()

      if (existingLink) {
        set({ isSubmitting: false, error: '关联已存在' })
        return false
      }

      const link: IssueLink = {
        id: generateId(),
        projectId: get().currentIssue?.projectId || '',
        sourceIssueId: sourceId,
        targetIssueId: targetId,
        linkType,
        createdAt: now(),
        updatedAt: now(),
      }

      await db.issueLinks.add(link)

      set((state) => ({
        issueLinks: [...state.issueLinks, link],
        isSubmitting: false,
      }))

      return true
    } catch (error) {
      console.error('Create issue link error:', error)
      set({ 
        isSubmitting: false, 
        error: '创建关联失败' 
      })
      return false
    }
  },

  removeIssueLink: async (linkId: string): Promise<boolean> => {
    set({ isLoading: true, error: null })
    
    try {
      await db.issueLinks.delete(linkId)

      set((state) => ({
        issueLinks: state.issueLinks.filter(l => l.id !== linkId),
        isLoading: false,
      }))

      return true
    } catch (error) {
      console.error('Remove issue link error:', error)
      set({ 
        isLoading: false, 
        error: '移除关联失败' 
      })
      return false
    }
  },

  setCurrentIssue: (issue: Issue | null): void => {
    set({ currentIssue: issue })
  },

  setSelectedIssueIds: (ids: string[]): void => {
    set({ selectedIssueIds: ids })
  },

  clearSelectedIssues: (): void => {
    set({ selectedIssueIds: [] })
  },

  clearError: (): void => {
    set({ error: null })
  },
}))

export default useIssueStore
