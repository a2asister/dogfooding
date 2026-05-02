import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:3125/api';

  constructor(private http: HttpClient) { }

  get<T>(endpoint: string): Observable<T> {
    console.log(`[API] GET ${this.baseUrl}${endpoint}`);
    return this.http.get<T>(`${this.baseUrl}${endpoint}`).pipe(
      tap(response => console.log(`[API] GET Success:`, response)),
      catchError(this.handleError)
    );
  }

  post<T>(endpoint: string, data: any): Observable<T> {
    console.log(`[API] POST ${this.baseUrl}${endpoint}`, data);
    return this.http.post<T>(`${this.baseUrl}${endpoint}`, data).pipe(
      tap(response => console.log(`[API] POST Success:`, response)),
      catchError(this.handleError)
    );
  }

  put<T>(endpoint: string, data: any): Observable<T> {
    console.log(`[API] PUT ${this.baseUrl}${endpoint}`, data);
    return this.http.put<T>(`${this.baseUrl}${endpoint}`, data).pipe(
      tap(response => console.log(`[API] PUT Success:`, response)),
      catchError(this.handleError)
    );
  }

  delete<T>(endpoint: string): Observable<T> {
    console.log(`[API] DELETE ${this.baseUrl}${endpoint}`);
    return this.http.delete<T>(`${this.baseUrl}${endpoint}`).pipe(
      tap(response => console.log(`[API] DELETE Success:`, response)),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error(`[API] Error:`, error);
    
    let errorMessage = '网络错误，请检查后端服务是否启动';
    
    if (error.error instanceof ErrorEvent) {
      // 客户端错误
      errorMessage = `客户端错误: ${error.error.message}`;
    } else {
      // 服务端错误
      errorMessage = `服务端错误: ${error.status} - ${error.message || error.statusText}`;
      if (error.error?.message) {
        errorMessage = error.error.message;
      }
    }
    
    console.error(`[API] ${errorMessage}`);
    return throwError(() => new Error(errorMessage));
  }
}
