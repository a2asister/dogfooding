import type { Course, Category, ApiResponse } from '../types';

const API_BASE = 'http://localhost:7890/api';

export async function fetchCourses(category?: string): Promise<Course[]> {
  const url = category
    ? `${API_BASE}/courses?category=${category}`
    : `${API_BASE}/courses`;

  const res = await fetch(url);
  const data: ApiResponse<Course[]> = await res.json();

  if (data.code !== 0) {
    throw new Error(data.message || 'Failed to fetch courses');
  }

  return data.data;
}

export async function fetchCourse(id: number): Promise<Course> {
  const res = await fetch(`${API_BASE}/courses/${id}`);
  const data: ApiResponse<Course> = await res.json();

  if (data.code !== 0) {
    throw new Error(data.message || 'Failed to fetch course');
  }

  return data.data;
}

export async function fetchCategories(): Promise<Category[]> {
  const res = await fetch(`${API_BASE}/categories`);
  const data: ApiResponse<Category[]> = await res.json();

  if (data.code !== 0) {
    throw new Error(data.message || 'Failed to fetch categories');
  }

  return data.data;
}
