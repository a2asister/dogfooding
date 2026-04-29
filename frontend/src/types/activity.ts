export type ActivityType = 
  | 'issue_created'
  | 'issue_updated'
  | 'issue_deleted'
  | 'issue_assigned'
  | 'issue_status_changed'
  | 'issue_priority_changed'
  | 'issue_commented'
  | 'issue_mentioned'
  | 'issue_linked'
  | 'issue_unlinked'
  | 'worklog_added'
  | 'worklog_updated'
  | 'worklog_deleted'
  | 'attachment_added'
  | 'attachment_deleted'
  | 'sprint_created'
  | 'sprint_started'
  | 'sprint_completed'
  | 'version_created'
  | 'version_released'
  | 'project_created'
  | 'project_updated'
  | 'member_added'
  | 'member_removed'
  | 'member_role_changed'
  | 'custom_field_created'
  | 'custom_field_updated'
  | 'workflow_created'
  | 'workflow_updated'

export interface Activity {
  id: string
  projectId: string
  issueId?: string
  userId: string
  activityType: ActivityType
  details: ActivityDetails
  previousValue?: unknown
  newValue?: unknown
  createdAt: Date
}

export interface ActivityDetails {
  fieldName?: string
  commentId?: string
  worklogId?: string
  attachmentId?: string
  sprintId?: string
  versionId?: string
  linkedIssueId?: string
  linkType?: string
  assigneeId?: string
  oldAssigneeId?: string
  oldStatus?: string
  newStatus?: string
  oldPriority?: string
  newPriority?: string
  projectMemberId?: string
  oldRoleId?: string
  newRoleId?: string
}

export interface ActivityFeedQuery {
  projectId?: string
  issueId?: string
  userId?: string
  activityTypes?: ActivityType[]
  since?: Date
  until?: Date
  limit?: number
  cursor?: string
}

export interface ActivityFeed {
  activities: Activity[]
  hasMore: boolean
  nextCursor?: string
  totalCount?: number
}
