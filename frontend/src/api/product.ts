import api from './index'
import type { Product, Category, ApiResponse } from '@/types'

export const productApi = {
  getProducts: (params?: { categoryId?: number; mealType?: string; keyword?: string }) => {
    return api.get<ApiResponse<Product[]>>('/products', { params })
  },
  
  getProduct: (id: number) => {
    return api.get<ApiResponse<Product>>(`/products/${id}`)
  },
  
  createProduct: (data: Partial<Product>) => {
    return api.post<ApiResponse<Product>>('/products', data)
  },
  
  updateProduct: (id: number, data: Partial<Product>) => {
    return api.put<ApiResponse<Product>>(`/products/${id}`, data)
  },
  
  deleteProduct: (id: number) => {
    return api.delete<ApiResponse<void>>(`/products/${id}`)
  },
  
  toggleStatus: (id: number) => {
    return api.patch<ApiResponse<Product>>(`/products/${id}/status`)
  },
}

export const categoryApi = {
  getCategories: () => {
    return api.get<ApiResponse<Category[]>>('/categories')
  },
  
  createCategory: (data: Partial<Category>) => {
    return api.post<ApiResponse<Category>>('/categories', data)
  },
  
  updateCategory: (id: number, data: Partial<Category>) => {
    return api.put<ApiResponse<Category>>(`/categories/${id}`, data)
  },
  
  deleteCategory: (id: number) => {
    return api.delete<ApiResponse<void>>(`/categories/${id}`)
  },
}
