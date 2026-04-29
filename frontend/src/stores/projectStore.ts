import { create } from 'zustand'
import type { Project, ProjectStats, ProjectCreateInput } from '@/types'
import { db } from '@/db'
import { generateId, now } from '@/utils'
import { useAuthStore } from './authStore'

interface ProjectState {
  projects: Project[]
  currentProject: Project | null
  projectStats: ProjectStats | null
  isLoading: boolean
  error: string | null
  
  fetchProjects: () => Promise<void>
  fetchProject: (id: string) => Promise<void>
  createProject: (input: ProjectCreateInput) => Promise<Project | null>
  updateProject: (id: string, updates: Partial<Project>) => Promise<boolean>
  deleteProject: (id: string) => Promise<boolean>
  setCurrentProject: (project: Project | null) => void
  fetchProjectStats: (projectId: string) => Promise<void>
  clearError: () => void
}

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [],
  currentProject: null,
  projectStats: null,
  isLoading: false,
  error: null,

  fetchProjects: async (): Promise<void> => {
    set({ isLoading: true, error: null })
    
    try {
      const currentUser = useAuthStore.getState().currentUser
      
      if (!currentUser) {
        set({ isLoading: false, projects: [] })
        return
      }

      const memberProjects = await db.projectMembers
        .where('userId')
        .equals(currentUser.id)
        .filter(m => m.isActive)
        .toArray()

      const projectIds = memberProjects.map(m => m.projectId)
      
      const projects = projectIds.length > 0 
        ? await db.projects
            .where('id')
            .anyOf(projectIds)
            .filter(p => !p.archivedAt)
            .toArray()
        : []

      const ownedProjects = await db.projects
        .where('ownerId')
        .equals(currentUser.id)
        .filter(p => !p.archivedAt)
        .toArray()

      const allProjects = [...projects, ...ownedProjects]
      const uniqueProjects = allProjects.filter((project, index, self) =>
        index === self.findIndex(p => p.id === project.id)
      )

      set({ 
        projects: uniqueProjects, 
        isLoading: false 
      })
    } catch (error) {
      console.error('Fetch projects error:', error)
      set({ 
        isLoading: false, 
        error: '加载项目列表失败',
        projects: [] 
      })
    }
  },

  fetchProject: async (id: string): Promise<void> => {
    set({ isLoading: true, error: null })
    
    try {
      const project = await db.projects.get(id)
      
      if (!project) {
        set({ 
          isLoading: false, 
          error: '项目不存在',
          currentProject: null 
        })
        return
      }

      set({ 
        currentProject: project, 
        isLoading: false 
      })
    } catch (error) {
      console.error('Fetch project error:', error)
      set({ 
        isLoading: false, 
        error: '加载项目详情失败',
        currentProject: null 
      })
    }
  },

  createProject: async (input: ProjectCreateInput): Promise<Project | null> => {
    set({ isLoading: true, error: null })
    
    try {
      const currentUser = useAuthStore.getState().currentUser
      
      if (!currentUser) {
        set({ isLoading: false, error: '请先登录' })
        return null
      }

      const existingKey = await db.projects
        .where('key')
        .equals(input.key.toUpperCase())
        .first()

      if (existingKey) {
        set({ isLoading: false, error: '项目标识已存在' })
        return null
      }

      const project: Project = {
        id: generateId(),
        name: input.name,
        key: input.key.toUpperCase(),
        description: input.description,
        icon: input.icon || 'ProjectOutlined',
        ownerId: currentUser.id,
        leadId: input.leadId || currentUser.id,
        isPublic: input.isPublic ?? false,
        category: input.category || 'software',
        defaultIssueTypeId: '',
        defaultWorkflowId: '',
        createdAt: now(),
        updatedAt: now(),
      }

      await db.projects.add(project)

      const adminRole = await db.roles
        .where('name')
        .equals('项目管理员')
        .and(r => r.projectId === undefined)
        .first()

      if (adminRole) {
        const projectMember = {
          id: generateId(),
          projectId: project.id,
          userId: currentUser.id,
          roleId: adminRole.id,
          isActive: true,
          joinedAt: now(),
        }
        await db.projectMembers.add(projectMember)
      }

      set((state) => ({
        projects: [...state.projects, project],
        isLoading: false,
      }))

      return project
    } catch (error) {
      console.error('Create project error:', error)
      set({ 
        isLoading: false, 
        error: '创建项目失败' 
      })
      return null
    }
  },

  updateProject: async (id: string, updates: Partial<Project>): Promise<boolean> => {
    set({ isLoading: true, error: null })
    
    try {
      const existingProject = await db.projects.get(id)
      
      if (!existingProject) {
        set({ isLoading: false, error: '项目不存在' })
        return false
      }

      const updatedProject: Project = {
        ...existingProject,
        ...updates,
        updatedAt: now(),
      }

      await db.projects.put(updatedProject)

      set((state) => ({
        projects: state.projects.map(p => 
          p.id === id ? updatedProject : p
        ),
        currentProject: state.currentProject?.id === id 
          ? updatedProject 
          : state.currentProject,
        isLoading: false,
      }))

      return true
    } catch (error) {
      console.error('Update project error:', error)
      set({ 
        isLoading: false, 
        error: '更新项目失败' 
      })
      return false
    }
  },

  deleteProject: async (id: string): Promise<boolean> => {
    set({ isLoading: true, error: null })
    
    try {
      await db.projectMembers.where('projectId').equals(id).delete()
      await db.issues.where('projectId').equals(id).delete()
      await db.issueTypes.where('projectId').equals(id).delete()
      await db.workflows.where('projectId').equals(id).delete()
      await db.customFields.where('projectId').equals(id).delete()
      await db.sprints.where('projectId').equals(id).delete()
      await db.versions.where('projectId').equals(id).delete()
      await db.modules.where('projectId').equals(id).delete()
      await db.tags.where('projectId').equals(id).delete()
      await db.comments.where('projectId').equals(id).delete()
      await db.worklogs.where('projectId').equals(id).delete()
      await db.activities.where('projectId').equals(id).delete()
      await db.roles.where('projectId').equals(id).delete()
      await db.filters.where('projectId').equals(id).delete()
      await db.notifications.where('projectId').equals(id).delete()
      await db.dashboards.where('projectId').equals(id).delete()
      
      await db.projects.delete(id)

      set((state) => ({
        projects: state.projects.filter(p => p.id !== id),
        currentProject: state.currentProject?.id === id 
          ? null 
          : state.currentProject,
        isLoading: false,
      }))

      return true
    } catch (error) {
      console.error('Delete project error:', error)
      set({ 
        isLoading: false, 
        error: '删除项目失败' 
      })
      return false
    }
  },

  setCurrentProject: (project: Project | null): void => {
    set({ currentProject: project })
  },

  fetchProjectStats: async (projectId: string): Promise<void> => {
    set({ isLoading: true, error: null })
    
    try {
      const issues = await db.issues
        .where('projectId')
        .equals(projectId)
        .toArray()

      const totalIssues = issues.length
      const openIssues = issues.filter(i => 
        ['todo', 'in_progress', 'review', 'blocked', 'reopened'].includes(i.status)
      ).length
      const inProgressIssues = issues.filter(i => 
        ['in_progress', 'review'].includes(i.status)
      ).length
      const doneIssues = issues.filter(i => 
        ['done', 'closed'].includes(i.status)
      ).length

      const sprints = await db.sprints
        .where('projectId')
        .equals(projectId)
        .toArray()

      const activeSprint = sprints.find(s => s.status === 'active')

      const stats: ProjectStats = {
        totalIssues,
        openIssues,
        inProgressIssues,
        doneIssues,
        sprintsTotal: sprints.length,
        activeSprintId: activeSprint?.id,
      }

      set({ 
        projectStats: stats, 
        isLoading: false 
      })
    } catch (error) {
      console.error('Fetch project stats error:', error)
      set({ 
        isLoading: false, 
        error: '加载项目统计失败' 
      })
    }
  },

  clearError: (): void => {
    set({ error: null })
  },
}))

export default useProjectStore
