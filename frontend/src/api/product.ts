import request from './request';
import type { Product, ProductLink } from '@/types';

export const getProductList = (params: {
  page?: number;
  pageSize?: number;
  category?: string;
  creatorId?: string;
  keyword?: string;
}) => {
  return request.get<{ list: Product[]; total: number; page: number; pageSize: number }>('/products', { params });
};

export const getProductDetail = (id: string) => {
  return request.get<{ product: Product }>(`/products/${id}`);
};

export const createProduct = (data: {
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  commissionRate: number;
  imageUrl: string;
  productUrl: string;
  platform: string;
  category?: string;
}) => {
  return request.post<{ product: Product }>('/products', data);
};

export const updateProduct = (id: string, data: Partial<Product>) => {
  return request.put<{ product: Product }>(`/products/${id}`, data);
};

export const deleteProduct = (id: string) => {
  return request.delete(`/products/${id}`);
};

export const getNoteProducts = (noteId: string) => {
  return request.get<{ links: ProductLink[] }>(`/products/note/${noteId}`);
};

export const addProductToNote = (noteId: string, productId: string) => {
  return request.post<{ link: ProductLink }>(`/products/note/${noteId}/add`, { productId });
};

export const removeProductFromNote = (noteId: string, productId: string) => {
  return request.delete(`/products/note/${noteId}/remove`, { data: { productId } });
};

export const clickProductLink = (linkId: string) => {
  return request.post<{ redirectUrl: string }>(`/products/link/${linkId}/click`);
};
