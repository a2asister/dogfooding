export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResponse<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface News {
  id: number;
  title: string;
  content: string;
  category: string;
  cover_image: string | null;
  is_top: number;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: number;
  title: string;
  description: string | null;
  cover_image: string | null;
  start_time: string | null;
  end_time: string | null;
  status: string;
  is_published: number;
  link_url: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface HomeConfig {
  id: number;
  module_name: string;
  config_data: string;
  is_enabled: number;
  sort_order: number;
}

export interface Reservation {
  id: number;
  phone: string;
  platform: string | null;
  created_at: string;
}

export interface Ticket {
  id: number;
  user_name: string | null;
  contact: string;
  title: string;
  content: string;
  status: string;
  reply: string | null;
  replied_at: string | null;
  created_at: string;
}

export interface ComplianceDoc {
  id: number;
  doc_type: string;
  title: string;
  content: string;
  updated_at: string;
}

export interface Setting {
  id: number;
  key: string;
  value: string;
  description: string | null;
}

export interface AdminUser {
  id: number;
  username: string;
  password_hash: string;
  role: string;
  created_at: string;
}
