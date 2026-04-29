export type NotificationType = 
  | 'issue_assigned'
  | 'issue_mentioned'
  | 'issue_commented'
  | 'issue_status_changed'
  | 'issue_updated'
  | 'worklog_added'
  | 'sprint_started'
  | 'sprint_completed'
  | 'version_released'
  | 'project_invited'
  | 'permission_changed'
  | 'approval_requested'
  | 'approval_approved'
  | 'approval_rejected'
  | 'system_announcement'

export type NotificationChannel = 'in_app' | 'email' | 'push'

export type NotificationStatus = 'unread' | 'read' | 'dismissed'

export interface Notification {
  id: string
  userId: string
  notificationType: NotificationType
  projectId?: string
  issueId?: string
  commentId?: string
  worklogId?: string
  sprintId?: string
  versionId?: string
  approvalRequestId?: string
  title: string
  content: string
  renderedContent?: string
  senderId?: string
  metadata?: Record<string, unknown>
  channels: NotificationChannel[]
  status: NotificationStatus
  readAt?: Date
  dismissedAt?: Date
  createdAt: Date
}

export interface NotificationPreference {
  id: string
  userId: string
  notificationType: NotificationType
  channels: NotificationChannel[]
  isEnabled: boolean
  projectId?: string
  createdAt: Date
  updatedAt: Date
}

export interface NotificationSettings {
  userId: string
  doNotDisturb: boolean
  doNotDisturbStart?: string
  doNotDisturbEnd?: string
  quietDays?: number[]
  emailDigestFrequency: 'instant' | 'daily' | 'weekly' | 'never'
  emailDigestTime?: string
  preferences: NotificationPreference[]
}

export interface PushDevice {
  id: string
  userId: string
  deviceToken: string
  deviceType: 'ios' | 'android' | 'web'
  deviceName?: string
  isActive: boolean
  lastRegisteredAt: Date
  createdAt: Date
}

export interface RealTimeMessage {
  id: string
  type: 'notification' | 'issue_update' | 'comment' | 'presence'
  payload: unknown
  sentAt: Date
}

export interface UserPresence {
  userId: string
  status: 'online' | 'away' | 'busy' | 'offline'
  lastSeenAt: Date
  currentActivity?: string
  currentIssueId?: string
}
