export interface Comment {
  id: string
  projectId: string
  issueId: string
  authorId: string
  content: string
  renderedContent?: string
  mentions?: string[]
  attachments?: string[]
  parentId?: string
  isInternal: boolean
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date
}

export interface CommentCreateInput {
  issueId: string
  content: string
  parentId?: string
  isInternal?: boolean
  attachments?: string[]
}

export interface CommentUpdateInput {
  content: string
  attachments?: string[]
}

export interface CommentThread extends Comment {
  replies?: Comment[]
}
