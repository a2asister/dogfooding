export interface Category {
  id: number;
  name: string;
  slug: string;
  courseCount?: number;
}

export interface Course {
  id: number;
  title: string;
  cover: string;
  description?: string;
  instructor?: string;
  duration?: string;
  level?: string;
  categories: Category[];
}

export interface ApiResponse<T> {
  code: number;
  data: T;
  message?: string;
}
