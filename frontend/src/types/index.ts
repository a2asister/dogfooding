export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

export interface PaginatedResponse<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

export interface News {
  id: number
  title: string
  title_en?: string
  content: string
  content_en?: string
  category: string
  cover_image: string | null
  is_top: number
  is_hot: number
  is_recommend: number
  view_count: number
  share_count: number
  tags?: string
  publish_time?: string
  scheduled_publish_time?: string
  scheduled_offline_time?: string
  status: string
  created_at: string
  updated_at: string
}

export interface NewsDetail extends News {
  prev: { id: number; title: string } | null
  next: { id: number; title: string } | null
  hot_recommend: News[]
}

export interface Event {
  id: number
  title: string
  title_en?: string
  description: string | null
  description_en?: string
  cover_image: string | null
  start_time: string | null
  end_time: string | null
  status: string
  is_published: number
  is_hot: number
  click_count: number
  link_url: string | null
  scheduled_publish_time?: string
  scheduled_offline_time?: string
  sort_order: number
  created_at: string
  updated_at: string
}

export interface Banner {
  id: number
  image: string
  title: string
  link: string
}

export interface Highlight {
  id: number
  icon: string
  title: string
  description: string
}

export interface Reservation {
  id: number
  phone: string
  platform: string | null
  created_at: string
}

export interface Ticket {
  id: number
  user_name: string | null
  contact: string
  title: string
  content: string
  status: string
  reply: string | null
  replied_at: string | null
  created_at: string
}

export interface ComplianceDoc {
  id: number
  doc_type: string
  title: string
  content: string
  updated_at: string
}

export interface Setting {
  id: number
  key: string
  value: string
  description: string | null
}

export interface FAQ {
  id: number
  question: string
  question_en?: string
  answer: string
  answer_en?: string
  category: string
  sort_order: number
  is_enabled: number
  view_count: number
  created_at: string
  updated_at: string
}

export interface AdminUser {
  id: number
  username: string
  role: string
  permissions?: string
  is_active: number
  last_login_at?: string
  created_at: string
}

export interface OperationLog {
  id: number
  user_id?: number
  username?: string
  action: string
  module?: string
  details?: string
  ip_address?: string
  user_agent?: string
  created_at: string
}

export interface AccessLog {
  id: number
  path: string
  method?: string
  ip_address?: string
  user_agent?: string
  referer?: string
  response_time?: number
  status_code?: number
  created_at: string
}
