import type { BurndownDataPoint } from './sprint'

export type ChartType = 
  | 'bar'
  | 'line'
  | 'pie'
  | 'donut'
  | 'area'
  | 'scatter'
  | 'gauge'
  | 'table'
  | 'metric'
  | 'burndown'
  | 'control_chart'
  | 'cumulative_flow'
  | 'velocity'

export type DashboardScope = 'project' | 'personal' | 'team'

export interface Dashboard {
  id: string
  projectId?: string
  ownerId: string
  name: string
  description?: string
  scope: DashboardScope
  layout: DashboardWidgetLayout[]
  isFavorite: boolean
  isShared: boolean
  sharedWithUserIds?: string[]
  sharedWithRoleIds?: string[]
  refreshInterval?: number
  createdAt: Date
  updatedAt: Date
}

export interface DashboardWidgetLayout {
  id: string
  widgetId: string
  x: number
  y: number
  width: number
  height: number
}

export interface DashboardWidget {
  id: string
  dashboardId: string
  name: string
  description?: string
  chartType: ChartType
  dataSource: WidgetDataSource
  configuration: WidgetConfiguration
  refreshInterval?: number
  createdAt: Date
  updatedAt: Date
}

export interface WidgetDataSource {
  type: 'jql' | 'filter' | 'report' | 'custom'
  projectId?: string
  filterId?: string
  jql?: string
  reportType?: string
  parameters?: Record<string, unknown>
}

export interface WidgetConfiguration {
  title?: string
  showTitle?: boolean
  showLegend?: boolean
  colors?: string[]
  height?: number
  xAxis?: AxisConfig
  yAxis?: AxisConfig
  groupBy?: string
  aggregateBy?: string
  aggregateFunction?: 'count' | 'sum' | 'avg' | 'min' | 'max'
  filters?: Record<string, unknown>
}

export interface AxisConfig {
  field?: string
  label?: string
  format?: string
  min?: number
  max?: number
}

export interface ReportData {
  id: string
  reportType: string
  title: string
  description?: string
  data: unknown
  metadata: ReportMetadata
  generatedAt: Date
}

export interface ReportMetadata {
  projectId?: string
  sprintId?: string
  versionId?: string
  startDate?: Date
  endDate?: Date
  filters?: Record<string, unknown>
}

export interface BurndownChartData {
  sprintId: string
  sprintName: string
  startDate: Date
  endDate: Date
  totalStoryPoints: number
  dataPoints: BurndownDataPoint[]
}

export interface VelocityChartData {
  projectId: string
  sprints: {
    id: string
    name: string
    completedDate: Date
    committedStoryPoints: number
    completedStoryPoints: number
  }[]
  averageVelocity: number
}

export interface IssueDistributionData {
  projectId: string
  byStatus: { status: string; count: number; color: string }[]
  byType: { type: string; count: number; color: string }[]
  byPriority: { priority: string; count: number; color: string }[]
  byAssignee: { assigneeId: string; assigneeName: string; count: number }[]
}

export interface DefectDensityData {
  projectId: string
  totalIssues: number
  totalBugs: number
  density: number
  byModule: { moduleId: string; moduleName: string; totalIssues: number; bugs: number; density: number }[]
  byVersion: { versionId: string; versionName: string; totalIssues: number; bugs: number; density: number }[]
  trend: { date: Date; density: number }[]
}

export interface SprintAchievementData {
  sprintId: string
  sprintName: string
  startDate: Date
  endDate: Date
  plannedIssues: number
  completedIssues: number
  plannedStoryPoints?: number
  completedStoryPoints?: number
  achievementRate: number
  byType: { type: string; planned: number; completed: number }[]
  byAssignee: { assigneeId: string; assigneeName: string; completed: number; storyPoints?: number }[]
}

export interface ThroughputData {
  projectId: string
  period: 'week' | 'month' | 'quarter'
  dataPoints: {
    period: string
    startDate: Date
    endDate: Date
    created: number
    resolved: number
    closed: number
  }[]
  averageThroughput: number
}

export const DEFAULT_DASHBOARD_TEMPLATES: Omit<Dashboard, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: '项目概览',
    description: '显示项目的整体进度和关键指标',
    scope: 'project',
    isFavorite: true,
    isShared: true,
    layout: [
      { id: '1', widgetId: 'w1', x: 0, y: 0, width: 6, height: 4 },
      { id: '2', widgetId: 'w2', x: 6, y: 0, width: 6, height: 4 },
      { id: '3', widgetId: 'w3', x: 0, y: 4, width: 8, height: 6 },
      { id: '4', widgetId: 'w4', x: 8, y: 4, width: 4, height: 6 },
    ],
  },
  {
    name: '燃尽图',
    description: '显示迭代的燃尽进度',
    scope: 'project',
    isFavorite: false,
    isShared: true,
    layout: [
      { id: '1', widgetId: 'w1', x: 0, y: 0, width: 12, height: 8 },
    ],
  },
]
