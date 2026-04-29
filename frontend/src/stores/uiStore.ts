import { create } from 'zustand'

export type ThemeMode = 'light' | 'dark' | 'system'
export type ViewType = 'kanban' | 'list' | 'gantt' | 'calendar'
export type SidebarType = 'project' | 'sprint' | 'filter' | 'none'

interface UIState {
  theme: ThemeMode
  sidebarCollapsed: boolean
  activeSidebar: SidebarType
  currentView: ViewType
  isModalOpen: boolean
  activeModal: string | null
  modalProps: Record<string, unknown>
  isLoading: boolean
  loadingText: string
  notification: {
    show: boolean
    type: 'success' | 'error' | 'warning' | 'info'
    message: string
    description?: string
  } | null
  kanbanConfig: {
    showSubTasks: boolean
    swimlaneBy: 'assignee' | 'priority' | 'module' | 'epic' | 'none'
    cardFields: string[]
    cardLayout: 'compact' | 'detailed'
  }
  listConfig: {
    columns: string[]
    pageSize: number
    defaultSortBy: string
    defaultSortOrder: 'asc' | 'desc'
  }
  ganttConfig: {
    showDependencies: boolean
    showProgress: boolean
    groupBy: 'epic' | 'assignee' | 'module' | 'sprint' | 'none'
    timelineUnit: 'day' | 'week' | 'month' | 'quarter'
  }
  
  setTheme: (theme: ThemeMode) => void
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setActiveSidebar: (sidebar: SidebarType) => void
  setCurrentView: (view: ViewType) => void
  openModal: (modalType: string, props?: Record<string, unknown>) => void
  closeModal: () => void
  setLoading: (loading: boolean, text?: string) => void
  showNotification: (
    type: 'success' | 'error' | 'warning' | 'info',
    message: string,
    description?: string
  ) => void
  hideNotification: () => void
  updateKanbanConfig: (config: Partial<UIState['kanbanConfig']>) => void
  updateListConfig: (config: Partial<UIState['listConfig']>) => void
  updateGanttConfig: (config: Partial<UIState['ganttConfig']>) => void
}

export const useUIStore = create<UIState>((set, get) => ({
  theme: 'light',
  sidebarCollapsed: false,
  activeSidebar: 'project',
  currentView: 'kanban',
  isModalOpen: false,
  activeModal: null,
  modalProps: {},
  isLoading: false,
  loadingText: '加载中...',
  notification: null,
  
  kanbanConfig: {
    showSubTasks: false,
    swimlaneBy: 'none',
    cardFields: ['assignee', 'priority', 'dueDate', 'timeSpent'],
    cardLayout: 'compact',
  },
  
  listConfig: {
    columns: ['key', 'summary', 'type', 'status', 'priority', 'assignee', 'dueDate', 'sprint'],
    pageSize: 20,
    defaultSortBy: 'position',
    defaultSortOrder: 'asc',
  },
  
  ganttConfig: {
    showDependencies: true,
    showProgress: true,
    groupBy: 'none',
    timelineUnit: 'week',
  },

  setTheme: (theme: ThemeMode): void => {
    set({ theme })
    localStorage.setItem('theme', theme)
  },

  toggleSidebar: (): void => {
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }))
  },

  setSidebarCollapsed: (collapsed: boolean): void => {
    set({ sidebarCollapsed: collapsed })
  },

  setActiveSidebar: (sidebar: SidebarType): void => {
    set({ activeSidebar: sidebar, sidebarCollapsed: false })
  },

  setCurrentView: (view: ViewType): void => {
    set({ currentView: view })
  },

  openModal: (modalType: string, props?: Record<string, unknown>): void => {
    set({ 
      isModalOpen: true, 
      activeModal: modalType,
      modalProps: props || {}
    })
  },

  closeModal: (): void => {
    set({ 
      isModalOpen: false, 
      activeModal: null,
      modalProps: {}
    })
  },

  setLoading: (loading: boolean, text?: string): void => {
    set({ 
      isLoading: loading, 
      loadingText: text || '加载中...'
    })
  },

  showNotification: (
    type: 'success' | 'error' | 'warning' | 'info',
    message: string,
    description?: string
  ): void => {
    set({
      notification: {
        show: true,
        type,
        message,
        description,
      },
    })
    
    setTimeout(() => {
      if (get().notification?.show) {
        set({ notification: null })
      }
    }, 5000)
  },

  hideNotification: (): void => {
    set({ notification: null })
  },

  updateKanbanConfig: (config: Partial<UIState['kanbanConfig']>): void => {
    set((state) => ({
      kanbanConfig: {
        ...state.kanbanConfig,
        ...config,
      },
    }))
  },

  updateListConfig: (config: Partial<UIState['listConfig']>): void => {
    set((state) => ({
      listConfig: {
        ...state.listConfig,
        ...config,
      },
    }))
  },

  updateGanttConfig: (config: Partial<UIState['ganttConfig']>): void => {
    set((state) => ({
      ganttConfig: {
        ...state.ganttConfig,
        ...config,
      },
    }))
  },
}))

export default useUIStore
