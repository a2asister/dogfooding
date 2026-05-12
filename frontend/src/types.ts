export interface Log {
  id: number
  title: string
  content: string
  category: string
  createdAt: string
}

export interface CreateLogInput {
  title: string
  content: string
  category: string
}
