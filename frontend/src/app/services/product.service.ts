import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product, Category, Favorite } from '../models/product';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private apiUrl = 'http://localhost:5876';

  constructor(private http: HttpClient) {}

  getProducts(categoryId?: number): Observable<Product[]> {
    const url = categoryId
      ? `${this.apiUrl}/products?categoryId=${categoryId}`
      : `${this.apiUrl}/products`;
    return this.http.get<Product[]>(url);
  }

  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/products/${id}`);
  }

  getProductsBySeller(sellerId: number): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/products/seller/${sellerId}`);
  }

  createProduct(product: {
    title: string;
    description: string;
    price: number;
    categoryId: number;
    sellerId: number;
    images: string[];
  }): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}/products`, product);
  }

  deleteProduct(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/products/${id}`);
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/categories`);
  }

  createCategory(category: { name: string; description?: string }): Observable<Category> {
    return this.http.post<Category>(`${this.apiUrl}/categories`, category);
  }

  getFavorites(userId: number): Observable<Favorite[]> {
    return this.http.get<Favorite[]>(`${this.apiUrl}/favorites/user/${userId}`);
  }

  addFavorite(userId: number, productId: number): Observable<Favorite> {
    return this.http.post<Favorite>(`${this.apiUrl}/favorites`, { userId, productId });
  }

  removeFavorite(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/favorites/${id}`);
  }

  createUser(username: string, avatar?: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/users`, { username, avatar });
  }
}
