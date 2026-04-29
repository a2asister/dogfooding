export type FilterScope = 'project' | 'global' | 'personal'

export type ViewType = 'kanban' | 'list' | 'gantt' | 'calendar'

export interface FilterCondition {
  id: string
  field: string
  operator: 'eq' | 'ne' | 'in' | 'not_in' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'not_contains' | 'starts_with' | 'ends_with' | 'is_empty' | 'is_not_empty'
  value: unknown
  values?: unknown[]
}

export interface FilterGroup {
  id: string
  operator: 'AND' | 'OR'
  conditions: FilterCondition[]
  groups?: FilterGroup[]
}

export interface Filter {
  id: string
  projectId?: string
  ownerId: string
  name: string
  description?: string
  scope: FilterScope
  jql?: string
  filterGroups: FilterGroup[]
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  columns?: string[]
  defaultViewType?: ViewType
  kanbanConfig?: KanbanFilterConfig
  ganttConfig?: GanttFilterConfig
  isFavorite: boolean
  isShared: boolean
  sharedWithUserIds?: string[]
  sharedWithRoleIds?: string[]
  useCount?: number
  lastUsedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface KanbanFilterConfig {
  swimlaneBy?: 'assignee' | 'priority' | 'module' | 'epic' | 'none'
  columnBy: 'status' | 'assignee' | 'priority'
  quickFilters?: QuickFilter[]
  showSubTasks: boolean
  cardLayout: 'compact' | 'detailed'
  cardFields: string[]
}

export interface GanttFilterConfig {
  barStartField: 'startDate' | 'createdAt' | 'dueDate'
  barEndField: 'dueDate' | 'resolutionDate'
  showDependencies: boolean
  showProgress: boolean
  groupBy?: 'epic' | 'assignee' | 'module' | 'sprint'
  timelineUnit: 'day' | 'week' | 'month' | 'quarter'
}

export interface QuickFilter {
  id: string
  name: string
  jql?: string
  conditions: FilterGroup[]
  color?: string
  isActive: boolean
}

export interface SavedSearch {
  id: string
  name: string
  searchText: string
  filters?: FilterGroup
  ownerId: string
  searchCount: number
  lastSearchedAt: Date
  createdAt: Date
}

export interface RecentSearch {
  id: string
  searchText: string
  projectId?: string
  searchedAt: Date
}
