import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  Department, 
  Budget, 
  ExpenseApplication, 
  User, 
  ApiResponse, 
  PaginatedResponse,
  BudgetAnalysis,
  StatsData,
  ReceiptRecognitionResult,
  CategoryOption,
  ClassificationResult
} from '../types';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiBase = '/api';

  constructor(private http: HttpClient) {}

  getDepartments(): Observable<ApiResponse<Department[]>> {
    return this.http.get<ApiResponse<Department[]>>(`${this.apiBase}/departments`);
  }

  getUsers(params?: { departmentId?: string; role?: string }): Observable<ApiResponse<User[]>> {
    let httpParams = new HttpParams();
    if (params?.departmentId) httpParams = httpParams.set('departmentId', params.departmentId);
    if (params?.role) httpParams = httpParams.set('role', params.role);
    
    return this.http.get<ApiResponse<User[]>>(`${this.apiBase}/users`, { params: httpParams });
  }

  getUserById(id: string): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${this.apiBase}/users/${id}`);
  }

  getBudgets(params?: { 
    departmentId?: string; 
    year?: number; 
    month?: number 
  }): Observable<ApiResponse<Budget[]>> {
    let httpParams = new HttpParams();
    if (params?.departmentId) httpParams = httpParams.set('departmentId', params.departmentId);
    if (params?.year) httpParams = httpParams.set('year', params.year.toString());
    if (params?.month) httpParams = httpParams.set('month', params.month.toString());
    
    return this.http.get<ApiResponse<Budget[]>>(`${this.apiBase}/budgets`, { params: httpParams });
  }

  getBudgetById(id: string): Observable<ApiResponse<Budget>> {
    return this.http.get<ApiResponse<Budget>>(`${this.apiBase}/budgets/${id}`);
  }

  createBudget(budget: {
    departmentId: string;
    departmentName: string;
    year: number;
    month: number;
    totalAmount: number;
  }): Observable<ApiResponse<Budget>> {
    return this.http.post<ApiResponse<Budget>>(`${this.apiBase}/budgets`, budget);
  }

  updateBudget(id: string, updates: {
    totalAmount?: number;
    locked?: boolean;
  }): Observable<ApiResponse<Budget>> {
    return this.http.put<ApiResponse<Budget>>(`${this.apiBase}/budgets/${id}`, updates);
  }

  getBudgetAnalysis(year: number, month: number): Observable<ApiResponse<BudgetAnalysis>> {
    return this.http.get<ApiResponse<BudgetAnalysis>>(`${this.apiBase}/budgets/analysis/${year}/${month}`);
  }

  getApplications(params?: {
    departmentId?: string;
    applicantId?: string;
    status?: string;
    page?: number;
    pageSize?: number;
  }): Observable<ApiResponse<PaginatedResponse<ExpenseApplication>>> {
    let httpParams = new HttpParams();
    if (params?.departmentId) httpParams = httpParams.set('departmentId', params.departmentId);
    if (params?.applicantId) httpParams = httpParams.set('applicantId', params.applicantId);
    if (params?.status) httpParams = httpParams.set('status', params.status);
    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.pageSize) httpParams = httpParams.set('pageSize', params.pageSize.toString());
    
    return this.http.get<ApiResponse<PaginatedResponse<ExpenseApplication>>>(
      `${this.apiBase}/applications`, 
      { params: httpParams }
    );
  }

  getApplicationById(id: string): Observable<ApiResponse<ExpenseApplication>> {
    return this.http.get<ApiResponse<ExpenseApplication>>(`${this.apiBase}/applications/${id}`);
  }

  createApplication(application: {
    title: string;
    applicantId: string;
    applicantName: string;
    departmentId: string;
    departmentName: string;
    description?: string;
    items: Array<{
      category: string;
      description: string;
      amount: number;
      receiptImage?: string;
    }>;
  }): Observable<ApiResponse<ExpenseApplication>> {
    return this.http.post<ApiResponse<ExpenseApplication>>(`${this.apiBase}/applications`, application);
  }

  updateApplication(id: string, updates: {
    title?: string;
    description?: string;
    items?: Array<{
      id?: string;
      category: string;
      description: string;
      amount: number;
      receiptImage?: string;
    }>;
  }): Observable<ApiResponse<ExpenseApplication>> {
    return this.http.put<ApiResponse<ExpenseApplication>>(`${this.apiBase}/applications/${id}`, updates);
  }

  submitApplication(id: string): Observable<ApiResponse<ExpenseApplication>> {
    return this.http.post<ApiResponse<ExpenseApplication>>(`${this.apiBase}/applications/${id}/submit`, {});
  }

  approveApplication(id: string, data: {
    approverId: string;
    approverName: string;
    approvalComment?: string;
  }): Observable<ApiResponse<ExpenseApplication>> {
    return this.http.post<ApiResponse<ExpenseApplication>>(`${this.apiBase}/applications/${id}/approve`, data);
  }

  rejectApplication(id: string, data: {
    approverId: string;
    approverName: string;
    approvalComment?: string;
  }): Observable<ApiResponse<ExpenseApplication>> {
    return this.http.post<ApiResponse<ExpenseApplication>>(`${this.apiBase}/applications/${id}/reject`, data);
  }

  deleteApplication(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiBase}/applications/${id}`);
  }

  recognizeReceipt(data: {
    imageData?: string;
    text?: string;
  }): Observable<ApiResponse<ReceiptRecognitionResult>> {
    return this.http.post<ApiResponse<ReceiptRecognitionResult>>(`${this.apiBase}/receipts/recognize`, data);
  }

  getCategories(): Observable<ApiResponse<CategoryOption[]>> {
    return this.http.get<ApiResponse<CategoryOption[]>>(`${this.apiBase}/receipts/categories`);
  }

  classifyExpense(data: {
    description?: string;
    merchantName?: string;
  }): Observable<ApiResponse<ClassificationResult>> {
    return this.http.post<ApiResponse<ClassificationResult>>(`${this.apiBase}/receipts/classify`, data);
  }

  getStats(params?: { year?: number; month?: number }): Observable<ApiResponse<StatsData>> {
    let httpParams = new HttpParams();
    if (params?.year) httpParams = httpParams.set('year', params.year.toString());
    if (params?.month) httpParams = httpParams.set('month', params.month.toString());
    
    return this.http.get<ApiResponse<StatsData>>(`${this.apiBase}/stats`, { params: httpParams });
  }
}
