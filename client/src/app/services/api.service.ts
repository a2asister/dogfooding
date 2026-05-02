import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_BASE_URL = 'http://localhost:8765/api';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(private http: HttpClient) {}

  get<T>(endpoint: string, params?: Record<string, any>): Observable<T> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, value);
        }
      });
    }
    return this.http.get<T>(`${API_BASE_URL}${endpoint}`, { params: httpParams });
  }

  post<T>(endpoint: string, data?: any): Observable<T> {
    return this.http.post<T>(`${API_BASE_URL}${endpoint}`, data);
  }

  put<T>(endpoint: string, data?: any): Observable<T> {
    return this.http.put<T>(`${API_BASE_URL}${endpoint}`, data);
  }

  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${API_BASE_URL}${endpoint}`);
  }
}
