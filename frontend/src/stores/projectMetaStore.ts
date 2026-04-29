import { create } from 'zustand'
import type { 
  Sprint, SprintStats, SprintCreateInput, 
  Version, VersionCreateInput,
  Module, ModuleCreateInput, ModuleTree,
  Tag, TagCreateInput
} from '@/types'
import { db } from '@/db'
import { generateId, now } from '@/utils'

interface ProjectMetaState {
  sprints: Sprint[]
  versions: Version[]
  modules: Module[]
  moduleTrees: ModuleTree[]
  tags: Tag[]
  currentSprint: Sprint | null
  sprintStats: SprintStats | null
  isLoading: boolean
  error: string | null
  
  fetchSprints: (projectId: string) => Promise<void>
  createSprint: (input: SprintCreateInput) => Promise<Sprint | null>
  updateSprint: (id: string, updates: Partial<Sprint>) => Promise<boolean>
  deleteSprint: (id: string) => Promise<boolean>
  startSprint: (id: string) => Promise<boolean>
  completeSprint: (id: string, moveUncompletedTo?: string) => Promise<boolean>
  fetchSprintStats: (sprintId: string) => Promise<void>
  setCurrentSprint: (sprint: Sprint | null) => void
  
  fetchVersions: (projectId: string) => Promise<void>
  createVersion: (input: VersionCreateInput) => Promise<Version | null>
  updateVersion: (id: string, updates: Partial<Version>) => Promise<boolean>
  releaseVersion: (id: string) => Promise<boolean>
  deleteVersion: (id: string) => Promise<boolean>
  
  fetchModules: (projectId: string) => Promise<void>
  createModule: (input: ModuleCreateInput) => Promise<Module | null>
  updateModule: (id: string, updates: Partial<Module>) => Promise<boolean>
  deleteModule: (id: string) => Promise<boolean>
  
  fetchTags: (projectId: string) => Promise<void>
  createTag: (input: TagCreateInput) => Promise<Tag | null>
  updateTag: (id: string, updates: Partial<Tag>) => Promise<boolean>
  deleteTag: (id: string) => Promise<boolean>
  
  clearError: () => void
}

const buildModuleTree = (modules: Module[]): ModuleTree[] => {
  const moduleMap = new Map<string, ModuleTree>()
  const roots: ModuleTree[] = []
  
  for (const module of modules) {
    moduleMap.set(module.id, { ...module, children: [] })
  }
  
  for (const module of modules) {
    const treeModule = moduleMap.get(module.id)!
    if (module.parentId) {
      const parent = moduleMap.get(module.parentId)
      if (parent) {
        parent.children = parent.children || []
        parent.children.push(treeModule)
      } else {
        roots.push(treeModule)
      }
    } else {
      roots.push(treeModule)
    }
  }
  
  return roots.sort((a, b) => a.sortOrder - b.sortOrder)
}

export const useProjectMetaStore = create<ProjectMetaState>((set, get) => ({
  sprints: [],
  versions: [],
  modules: [],
  moduleTrees: [],
  tags: [],
  currentSprint: null,
  sprintStats: null,
  isLoading: false,
  error: null,

  fetchSprints: async (projectId: string): Promise<void> => {
    set({ isLoading: true, error: null })
    
    try {
      const sprints = await db.sprints
        .where('projectId')
        .equals(projectId)
        .sortBy('sortOrder')

      const activeSprint = sprints.find(s => s.status === 'active')

      set({ 
        sprints, 
        currentSprint: activeSprint || null,
        isLoading: false 
      })
    } catch (error) {
      console.error('Fetch sprints error:', error)
      set({ 
        isLoading: false, 
        error: '加载迭代列表失败' 
      })
    }
  },

  createSprint: async (input: SprintCreateInput): Promise<Sprint | null> => {
    set({ isLoading: true, error: null })
    
    try {
      const projectId = input.startDate ? '' : get().sprints[0]?.projectId
      
      if (!projectId && get().sprints.length > 0) {
        const error = new Error('无法确定项目ID')
        console.error('Create sprint error:', error)
        set({ isLoading: false, error: '创建迭代失败' })
        return null
      }

      const maxSortOrder = Math.max(-1, ...get().sprints.map(s => s.sortOrder))

      const sprint: Sprint = {
        id: generateId(),
        projectId: projectId,
        name: input.name,
        goal: input.goal,
        status: 'future',
        startDate: input.startDate,
        endDate: input.endDate,
        sortOrder: maxSortOrder + 1,
        createdAt: now(),
        updatedAt: now(),
      }

      await db.sprints.add(sprint)

      set((state) => ({
        sprints: [...state.sprints, sprint].sort((a, b) => a.sortOrder - b.sortOrder),
        isLoading: false,
      }))

      return sprint
    } catch (error) {
      console.error('Create sprint error:', error)
      set({ 
        isLoading: false, 
        error: '创建迭代失败' 
      })
      return null
    }
  },

  updateSprint: async (id: string, updates: Partial<Sprint>): Promise<boolean> => {
    set({ isLoading: true, error: null })
    
    try {
      const existingSprint = await db.sprints.get(id)
      
      if (!existingSprint) {
        set({ isLoading: false, error: '迭代不存在' })
        return false
      }

      const updatedSprint: Sprint = {
        ...existingSprint,
        ...updates,
        updatedAt: now(),
      }

      await db.sprints.put(updatedSprint)

      set((state) => ({
        sprints: state.sprints.map(s => 
          s.id === id ? updatedSprint : s
        ),
        currentSprint: state.currentSprint?.id === id 
          ? updatedSprint 
          : state.currentSprint,
        isLoading: false,
      }))

      return true
    } catch (error) {
      console.error('Update sprint error:', error)
      set({ 
        isLoading: false, 
        error: '更新迭代失败' 
      })
      return false
    }
  },

  deleteSprint: async (id: string): Promise<boolean> => {
    set({ isLoading: true, error: null })
    
    try {
      const sprint = await db.sprints.get(id)
      
      if (!sprint) {
        set({ isLoading: false, error: '迭代不存在' })
        return false
      }

      if (sprint.status === 'active') {
        set({ isLoading: false, error: '不能删除正在进行的迭代' })
        return false
      }

      const issues = await db.issues
        .where('sprintId')
        .equals(id)
        .toArray()
      
      for (const issue of issues) {
        await db.issues.update(issue.id, { sprintId: undefined })
      }

      await db.sprints.delete(id)

      set((state) => ({
        sprints: state.sprints.filter(s => s.id !== id),
        currentSprint: state.currentSprint?.id === id 
          ? null 
          : state.currentSprint,
        isLoading: false,
      }))

      return true
    } catch (error) {
      console.error('Delete sprint error:', error)
      set({ 
        isLoading: false, 
        error: '删除迭代失败' 
      })
      return false
    }
  },

  startSprint: async (id: string): Promise<boolean> => {
    set({ isLoading: true, error: null })
    
    try {
      const sprint = await db.sprints.get(id)
      
      if (!sprint) {
        set({ isLoading: false, error: '迭代不存在' })
        return false
      }

      if (sprint.status !== 'future') {
        set({ isLoading: false, error: '只能启动待规划的迭代' })
        return false
      }

      const currentTime = now()
      const updatedSprint: Sprint = {
        ...sprint,
        status: 'active',
        startDate: currentTime,
        updatedAt: currentTime,
      }

      await db.sprints.put(updatedSprint)

      set((state) => ({
        sprints: state.sprints.map(s => 
          s.id === id ? updatedSprint : s
        ),
        currentSprint: updatedSprint,
        isLoading: false,
      }))

      return true
    } catch (error) {
      console.error('Start sprint error:', error)
      set({ 
        isLoading: false, 
        error: '启动迭代失败' 
      })
      return false
    }
  },

  completeSprint: async (id: string, moveUncompletedTo?: string): Promise<boolean> => {
    set({ isLoading: true, error: null })
    
    try {
      const sprint = await db.sprints.get(id)
      
      if (!sprint) {
        set({ isLoading: false, error: '迭代不存在' })
        return false
      }

      if (sprint.status !== 'active') {
        set({ isLoading: false, error: '只能完成正在进行的迭代' })
        return false
      }

      const currentTime = now()
      const updatedSprint: Sprint = {
        ...sprint,
        status: 'completed',
        completedDate: currentTime,
        updatedAt: currentTime,
      }

      const uncompletedIssues = await db.issues
        .where('sprintId')
        .equals(id)
        .filter(i => !['done', 'closed'].includes(i.status))
        .toArray()

      for (const issue of uncompletedIssues) {
        await db.issues.update(issue.id, { 
          sprintId: moveUncompletedTo || undefined 
        })
      }

      await db.sprints.put(updatedSprint)

      set((state) => ({
        sprints: state.sprints.map(s => 
          s.id === id ? updatedSprint : s
        ),
        currentSprint: state.currentSprint?.id === id 
          ? null 
          : state.currentSprint,
        isLoading: false,
      }))

      return true
    } catch (error) {
      console.error('Complete sprint error:', error)
      set({ 
        isLoading: false, 
        error: '完成迭代失败' 
      })
      return false
    }
  },

  fetchSprintStats: async (sprintId: string): Promise<void> => {
    set({ isLoading: true, error: null })
    
    try {
      const sprint = await db.sprints.get(sprintId)
      
      if (!sprint) {
        set({ isLoading: false, error: '迭代不存在' })
        return
      }

      const issues = await db.issues
        .where('sprintId')
        .equals(sprintId)
        .toArray()

      const totalIssues = issues.length
      const completedIssues = issues.filter(i => ['done', 'closed'].includes(i.status)).length
      const inProgressIssues = issues.filter(i => ['in_progress', 'review'].includes(i.status)).length
      const todoIssues = issues.filter(i => ['todo', 'reopened'].includes(i.status)).length
      const blockedIssues = issues.filter(i => i.status === 'blocked').length

      const stats: SprintStats = {
        totalIssues,
        completedIssues,
        inProgressIssues,
        todoIssues,
        blockedIssues,
        burndownData: [],
      }

      set({ 
        sprintStats: stats, 
        isLoading: false 
      })
    } catch (error) {
      console.error('Fetch sprint stats error:', error)
      set({ 
        isLoading: false, 
        error: '加载迭代统计失败' 
      })
    }
  },

  setCurrentSprint: (sprint: Sprint | null): void => {
    set({ currentSprint: sprint })
  },

  fetchVersions: async (projectId: string): Promise<void> => {
    set({ isLoading: true, error: null })
    
    try {
      const versions = await db.versions
        .where('projectId')
        .equals(projectId)
        .sortBy('sortOrder')

      set({ 
        versions, 
        isLoading: false 
      })
    } catch (error) {
      console.error('Fetch versions error:', error)
      set({ 
        isLoading: false, 
        error: '加载版本列表失败' 
      })
    }
  },

  createVersion: async (input: VersionCreateInput): Promise<Version | null> => {
    set({ isLoading: true, error: null })
    
    try {
      const projectId = get().versions.length > 0 ? get().versions[0].projectId : ''
      
      if (!projectId && get().versions.length === 0) {
        const error = new Error('无法确定项目ID')
        console.error('Create version error:', error)
        set({ isLoading: false, error: '创建版本失败' })
        return null
      }

      const maxSortOrder = Math.max(-1, ...get().versions.map(v => v.sortOrder))

      const version: Version = {
        id: generateId(),
        projectId: projectId,
        name: input.name,
        description: input.description,
        status: 'unreleased',
        startDate: input.startDate,
        releaseDate: input.releaseDate,
        isReleased: false,
        archived: false,
        sortOrder: maxSortOrder + 1,
        createdAt: now(),
        updatedAt: now(),
      }

      await db.versions.add(version)

      set((state) => ({
        versions: [...state.versions, version].sort((a, b) => a.sortOrder - b.sortOrder),
        isLoading: false,
      }))

      return version
    } catch (error) {
      console.error('Create version error:', error)
      set({ 
        isLoading: false, 
        error: '创建版本失败' 
      })
      return null
    }
  },

  updateVersion: async (id: string, updates: Partial<Version>): Promise<boolean> => {
    set({ isLoading: true, error: null })
    
    try {
      const existingVersion = await db.versions.get(id)
      
      if (!existingVersion) {
        set({ isLoading: false, error: '版本不存在' })
        return false
      }

      const updatedVersion: Version = {
        ...existingVersion,
        ...updates,
        updatedAt: now(),
      }

      await db.versions.put(updatedVersion)

      set((state) => ({
        versions: state.versions.map(v => 
          v.id === id ? updatedVersion : v
        ),
        isLoading: false,
      }))

      return true
    } catch (error) {
      console.error('Update version error:', error)
      set({ 
        isLoading: false, 
        error: '更新版本失败' 
      })
      return false
    }
  },

  releaseVersion: async (id: string): Promise<boolean> => {
    set({ isLoading: true, error: null })
    
    try {
      const version = await db.versions.get(id)
      
      if (!version) {
        set({ isLoading: false, error: '版本不存在' })
        return false
      }

      const currentTime = now()
      const updatedVersion: Version = {
        ...version,
        status: 'released',
        isReleased: true,
        releasedAt: currentTime,
        updatedAt: currentTime,
      }

      await db.versions.put(updatedVersion)

      set((state) => ({
        versions: state.versions.map(v => 
          v.id === id ? updatedVersion : v
        ),
        isLoading: false,
      }))

      return true
    } catch (error) {
      console.error('Release version error:', error)
      set({ 
        isLoading: false, 
        error: '发布版本失败' 
      })
      return false
    }
  },

  deleteVersion: async (id: string): Promise<boolean> => {
    set({ isLoading: true, error: null })
    
    try {
      const version = await db.versions.get(id)
      
      if (!version) {
        set({ isLoading: false, error: '版本不存在' })
        return false
      }

      const issues = await db.issues
        .filter(i => !!(i.versionIds?.includes(id) || i.fixVersionIds?.includes(id)))
        .toArray()
      
      for (const issue of issues) {
        const newVersionIds = issue.versionIds?.filter(vid => vid !== id)
        const newFixVersionIds = issue.fixVersionIds?.filter(vid => vid !== id)
        await db.issues.update(issue.id, { 
          versionIds: newVersionIds,
          fixVersionIds: newFixVersionIds 
        })
      }

      await db.versions.delete(id)

      set((state) => ({
        versions: state.versions.filter(v => v.id !== id),
        isLoading: false,
      }))

      return true
    } catch (error) {
      console.error('Delete version error:', error)
      set({ 
        isLoading: false, 
        error: '删除版本失败' 
      })
      return false
    }
  },

  fetchModules: async (projectId: string): Promise<void> => {
    set({ isLoading: true, error: null })
    
    try {
      const modules = await db.modules
        .where('projectId')
        .equals(projectId)
        .filter(m => m.isActive)
        .sortBy('sortOrder')

      const moduleTrees = buildModuleTree(modules)

      set({ 
        modules, 
        moduleTrees,
        isLoading: false 
      })
    } catch (error) {
      console.error('Fetch modules error:', error)
      set({ 
        isLoading: false, 
        error: '加载模块列表失败' 
      })
    }
  },

  createModule: async (input: ModuleCreateInput): Promise<Module | null> => {
    set({ isLoading: true, error: null })
    
    try {
      const projectId = get().modules.length > 0 ? get().modules[0].projectId : ''
      
      if (!projectId && get().modules.length === 0) {
        const error = new Error('无法确定项目ID')
        console.error('Create module error:', error)
        set({ isLoading: false, error: '创建模块失败' })
        return null
      }

      const maxSortOrder = Math.max(-1, ...get().modules.map(m => m.sortOrder))

      const module: Module = {
        id: generateId(),
        projectId: projectId,
        name: input.name,
        key: input.key || input.name.toUpperCase().replace(/\s+/g, '_'),
        description: input.description,
        icon: input.icon || 'FolderOutlined',
        color: input.color || '#1890ff',
        parentId: input.parentId,
        leadId: input.leadId,
        defaultAssigneeId: input.defaultAssigneeId,
        isActive: true,
        sortOrder: maxSortOrder + 1,
        createdAt: now(),
        updatedAt: now(),
      }

      await db.modules.add(module)

      const updatedModules = [...get().modules, module].sort((a, b) => a.sortOrder - b.sortOrder)
      
      set({
        modules: updatedModules,
        moduleTrees: buildModuleTree(updatedModules),
        isLoading: false,
      })

      return module
    } catch (error) {
      console.error('Create module error:', error)
      set({ 
        isLoading: false, 
        error: '创建模块失败' 
      })
      return null
    }
  },

  updateModule: async (id: string, updates: Partial<Module>): Promise<boolean> => {
    set({ isLoading: true, error: null })
    
    try {
      const existingModule = await db.modules.get(id)
      
      if (!existingModule) {
        set({ isLoading: false, error: '模块不存在' })
        return false
      }

      const updatedModule: Module = {
        ...existingModule,
        ...updates,
        updatedAt: now(),
      }

      await db.modules.put(updatedModule)

      const updatedModules = get().modules.map(m => 
        m.id === id ? updatedModule : m
      )
      
      set({
        modules: updatedModules,
        moduleTrees: buildModuleTree(updatedModules),
        isLoading: false,
      })

      return true
    } catch (error) {
      console.error('Update module error:', error)
      set({ 
        isLoading: false, 
        error: '更新模块失败' 
      })
      return false
    }
  },

  deleteModule: async (id: string): Promise<boolean> => {
    set({ isLoading: true, error: null })
    
    try {
      const childModules = await db.modules
        .where('parentId')
        .equals(id)
        .toArray()
      
      if (childModules.length > 0) {
        set({ isLoading: false, error: '请先删除子模块' })
        return false
      }

      const issues = await db.issues
        .filter(i => !!(i.moduleIds?.includes(id)))
        .toArray()
      
      if (issues.length > 0) {
        for (const issue of issues) {
          const newModuleIds = issue.moduleIds?.filter(mid => mid !== id)
          await db.issues.update(issue.id, { moduleIds: newModuleIds })
        }
      }

      await db.modules.delete(id)

      const updatedModules = get().modules.filter(m => m.id !== id)
      
      set({
        modules: updatedModules,
        moduleTrees: buildModuleTree(updatedModules),
        isLoading: false,
      })

      return true
    } catch (error) {
      console.error('Delete module error:', error)
      set({ 
        isLoading: false, 
        error: '删除模块失败' 
      })
      return false
    }
  },

  fetchTags: async (projectId: string): Promise<void> => {
    set({ isLoading: true, error: null })
    
    try {
      const tags = await db.tags
        .where('projectId')
        .equals(projectId)
        .sortBy('name')

      set({ 
        tags, 
        isLoading: false 
      })
    } catch (error) {
      console.error('Fetch tags error:', error)
      set({ 
        isLoading: false, 
        error: '加载标签列表失败' 
      })
    }
  },

  createTag: async (input: TagCreateInput): Promise<Tag | null> => {
    set({ isLoading: true, error: null })
    
    try {
      const projectId = get().tags.length > 0 ? get().tags[0].projectId : ''
      
      if (!projectId && get().tags.length === 0) {
        const error = new Error('无法确定项目ID')
        console.error('Create tag error:', error)
        set({ isLoading: false, error: '创建标签失败' })
        return null
      }

      const existingTag = await db.tags
        .where('projectId')
        .equals(projectId)
        .and(t => t.name.toLowerCase() === input.name.toLowerCase())
        .first()

      if (existingTag) {
        set({ isLoading: false, error: '标签名称已存在' })
        return null
      }

      const tag: Tag = {
        id: generateId(),
        projectId: projectId,
        name: input.name,
        color: input.color || '#1890ff',
        description: input.description,
        isSystem: false,
        usageCount: 0,
        createdAt: now(),
        updatedAt: now(),
      }

      await db.tags.add(tag)

      set((state) => ({
        tags: [...state.tags, tag].sort((a, b) => a.name.localeCompare(b.name)),
        isLoading: false,
      }))

      return tag
    } catch (error) {
      console.error('Create tag error:', error)
      set({ 
        isLoading: false, 
        error: '创建标签失败' 
      })
      return null
    }
  },

  updateTag: async (id: string, updates: Partial<Tag>): Promise<boolean> => {
    set({ isLoading: true, error: null })
    
    try {
      const existingTag = await db.tags.get(id)
      
      if (!existingTag) {
        set({ isLoading: false, error: '标签不存在' })
        return false
      }

      const updatedTag: Tag = {
        ...existingTag,
        ...updates,
        updatedAt: now(),
      }

      await db.tags.put(updatedTag)

      set((state) => ({
        tags: state.tags.map(t => 
          t.id === id ? updatedTag : t
        ).sort((a, b) => a.name.localeCompare(b.name)),
        isLoading: false,
      }))

      return true
    } catch (error) {
      console.error('Update tag error:', error)
      set({ 
        isLoading: false, 
        error: '更新标签失败' 
      })
      return false
    }
  },

  deleteTag: async (id: string): Promise<boolean> => {
    set({ isLoading: true, error: null })
    
    try {
      const tag = await db.tags.get(id)
      
      if (!tag) {
        set({ isLoading: false, error: '标签不存在' })
        return false
      }

      const issues = await db.issues
        .filter(i => !!(i.tagIds?.includes(id)))
        .toArray()
      
      for (const issue of issues) {
        const newTagIds = issue.tagIds?.filter(tid => tid !== id)
        await db.issues.update(issue.id, { tagIds: newTagIds })
      }

      await db.tags.delete(id)

      set((state) => ({
        tags: state.tags.filter(t => t.id !== id),
        isLoading: false,
      }))

      return true
    } catch (error) {
      console.error('Delete tag error:', error)
      set({ 
        isLoading: false, 
        error: '删除标签失败' 
      })
      return false
    }
  },

  clearError: (): void => {
    set({ error: null })
  },
}))

export default useProjectMetaStore
