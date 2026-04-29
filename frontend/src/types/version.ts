export type VersionStatus = 'unreleased' | 'released' | 'archived'

export interface Version {
  id: string
  projectId: string
  name: string
  description?: string
  status: VersionStatus
  startDate?: Date
  releaseDate?: Date
  isReleased: boolean
  archived: boolean
  sortOrder: number
  createdAt: Date
  updatedAt: Date
  releasedAt?: Date
}

export interface VersionCreateInput {
  name: string
  description?: string
  startDate?: Date
  releaseDate?: Date
}

export interface VersionStats {
  totalIssues: number
  resolvedIssues: number
  unresolvedIssues: number
  openBugs: number
  fixedBugs: number
  storyPointsTotal?: number
  storyPointsCompleted?: number
  progressPercentage: number
}

export interface ReleaseNote {
  id: string
  versionId: string
  issueId: string
  issueKey: string
  summary: string
  issueType: string
  category: 'feature' | 'improvement' | 'bugfix' | 'security'
  description?: string
  contributors: string[]
  releasedAt?: Date
}
