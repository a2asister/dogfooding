export interface Tag {
  id: string
  projectId: string
  name: string
  color: string
  description?: string
  usageCount?: number
  isSystem: boolean
  createdAt: Date
  updatedAt: Date
}

export interface TagCreateInput {
  name: string
  color?: string
  description?: string
}

export interface TagGroup {
  id: string
  projectId: string
  name: string
  description?: string
  color?: string
  tagIds: string[]
  isMutuallyExclusive: boolean
  isActive: boolean
  sortOrder: number
  createdAt: Date
  updatedAt: Date
}
