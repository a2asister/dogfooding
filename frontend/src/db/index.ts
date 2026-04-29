import Dexie from 'dexie'
import type { 
  User, Project, Issue, IssueTypeConfig, IssueLink,
  Workflow, WorkflowStatus, WorkflowTransition, WorkflowInstance, ApprovalNode,
  CustomField, Sprint, Version, Module, Tag,
  Comment, Worklog, Activity,
  Permission, Role, ProjectMember,
  Filter, SavedSearch, RecentSearch,
  Notification, NotificationPreference, PushDevice,
  Dashboard, DashboardWidget
} from '@/types'

export class PMDatabase extends Dexie {
  users!: Dexie.Table<User, string>
  projects!: Dexie.Table<Project, string>
  issueTypes!: Dexie.Table<IssueTypeConfig, string>
  issues!: Dexie.Table<Issue, string>
  issueLinks!: Dexie.Table<IssueLink, string>
  workflows!: Dexie.Table<Workflow, string>
  workflowStatuses!: Dexie.Table<WorkflowStatus, string>
  workflowTransitions!: Dexie.Table<WorkflowTransition, string>
  workflowInstances!: Dexie.Table<WorkflowInstance, string>
  approvalNodes!: Dexie.Table<ApprovalNode, string>
  customFields!: Dexie.Table<CustomField, string>
  sprints!: Dexie.Table<Sprint, string>
  versions!: Dexie.Table<Version, string>
  modules!: Dexie.Table<Module, string>
  tags!: Dexie.Table<Tag, string>
  comments!: Dexie.Table<Comment, string>
  worklogs!: Dexie.Table<Worklog, string>
  activities!: Dexie.Table<Activity, string>
  permissions!: Dexie.Table<Permission, string>
  roles!: Dexie.Table<Role, string>
  projectMembers!: Dexie.Table<ProjectMember, string>
  filters!: Dexie.Table<Filter, string>
  savedSearches!: Dexie.Table<SavedSearch, string>
  recentSearches!: Dexie.Table<RecentSearch, string>
  notifications!: Dexie.Table<Notification, string>
  notificationPreferences!: Dexie.Table<NotificationPreference, string>
  pushDevices!: Dexie.Table<PushDevice, string>
  dashboards!: Dexie.Table<Dashboard, string>
  dashboardWidgets!: Dexie.Table<DashboardWidget, string>

  constructor() {
    super('ProjectManagementDB')
    
    this.version(1).stores({
      users: 'id, username, email, roleId, isActive',
      projects: 'id, key, ownerId, leadId, category, createdAt, archivedAt',
      issueTypes: 'id, projectId, type, isSystem, isActive, sortOrder',
      issues: 'id, projectId, issueKey, issueTypeId, reporterId, assigneeId, status, priority, sprintId, parentId, epicId, createdAt, updatedAt, position',
      issueLinks: 'id, projectId, sourceIssueId, targetIssueId, linkType',
      workflows: 'id, projectId, isSystem, isActive, initialStatusId',
      workflowStatuses: 'id, workflowId, category, isInitial, isTerminal, sortOrder',
      workflowTransitions: 'id, workflowId, fromStatusId, toStatusId, sortOrder',
      workflowInstances: 'id, issueId, workflowId, currentStatusId, pendingApprovalNodeId',
      approvalNodes: 'id, workflowId, transitionId, approverType, sortOrder',
      customFields: 'id, projectId, key, fieldType, isRequired, isActive, sortOrder',
      sprints: 'id, projectId, status, startDate, endDate, completedDate, sortOrder',
      versions: 'id, projectId, status, startDate, releaseDate, isReleased, archived, sortOrder',
      modules: 'id, projectId, key, parentId, leadId, isActive, sortOrder',
      tags: 'id, projectId, name, isSystem, usageCount',
      comments: 'id, projectId, issueId, authorId, parentId, createdAt',
      worklogs: 'id, projectId, issueId, authorId, startDate, createdAt',
      activities: 'id, projectId, issueId, userId, activityType, createdAt',
      permissions: 'id, key, category, isSystem',
      roles: 'id, projectId, isSystem, isActive, sortOrder',
      projectMembers: 'id, projectId, userId, roleId, isActive, joinedAt',
      filters: 'id, projectId, ownerId, scope, isFavorite, isShared, createdAt',
      savedSearches: 'id, name, ownerId, searchCount, lastSearchedAt',
      recentSearches: 'id, searchText, projectId, searchedAt',
      notifications: 'id, userId, notificationType, projectId, issueId, status, createdAt',
      notificationPreferences: 'id, userId, notificationType, isEnabled, projectId',
      pushDevices: 'id, userId, deviceToken, deviceType, isActive, lastRegisteredAt',
      dashboards: 'id, projectId, ownerId, scope, isFavorite, isShared, createdAt',
      dashboardWidgets: 'id, dashboardId, chartType, createdAt'
    })
  }
}

export const db = new PMDatabase()

export default db
