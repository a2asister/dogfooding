import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { ExpenseApplication, ApplicationStatus, Department } from '../../../types';
import { CurrencyPipe, DatePipe } from '@angular/common';

@Component({
  selector: 'app-application-list',
  template: `
    <div class="space-y-6 animate-fade-in" *ngIf="!loading">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="flex flex-wrap items-center gap-4">
          <select 
            class="input-field w-auto"
            [(ngModel)]="filters.status"
            (change)="loadApplications()"
          >
            <option value="">全部状态</option>
            <option value="draft">草稿</option>
            <option value="pending">待审核</option>
            <option value="approved">已通过</option>
            <option value="rejected">已拒绝</option>
          </select>
          <select 
            class="input-field w-auto"
            [(ngModel)]="filters.departmentId"
            (change)="loadApplications()"
          >
            <option value="">全部部门</option>
            <option *ngFor="let dept of departments" [value]="dept.id">{{ dept.name }}</option>
          </select>
        </div>
        <button class="btn btn-primary" routerLink="/applications/create">
          <svg class="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          新建申请
        </button>
      </div>
      
      <div class="card" *ngIf="applications.length > 0">
        <div class="divide-y divide-gray-200">
          <div 
            *ngFor="let app of applications" 
            class="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
            routerLink="/applications/{{ app.id }}"
          >
            <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div class="flex items-start gap-4">
                <div class="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span class="text-primary-700 font-medium">{{ app.applicantName.charAt(0) }}</span>
                </div>
                <div class="min-w-0">
                  <h4 class="font-semibold text-gray-800 truncate">{{ app.title }}</h4>
                  <p class="text-sm text-gray-500 mt-1">
                    {{ app.applicantName }} · {{ app.departmentName }}
                  </p>
                  <div class="flex flex-wrap items-center gap-3 mt-2 text-sm">
                    <span class="text-gray-500">
                      <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                      {{ app.createdAt | date:'yyyy-MM-dd HH:mm' }}
                    </span>
                    <span class="text-gray-500">
                      <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                      </svg>
                      {{ app.items.length }} 项
                    </span>
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-4 flex-shrink-0">
                <div class="text-right">
                  <p class="text-xl font-bold text-gray-800">{{ app.totalAmount | currency:'CNY':'symbol':'1.0-0' }}</p>
                  <span class="status-badge" [ngClass]="(app.status | statusBadge).class">
                    {{ (app.status | statusBadge).text }}
                  </span>
                </div>
                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        <div class="p-4 border-t border-gray-100 flex items-center justify-between" *ngIf="pagination.totalPages > 1">
          <p class="text-sm text-gray-500">
            共 {{ pagination.total }} 条记录，第 {{ pagination.page }} / {{ pagination.totalPages }} 页
          </p>
          <div class="flex items-center gap-2">
            <button 
              class="btn btn-secondary px-3 py-1"
              [disabled]="pagination.page <= 1"
              (click)="changePage(pagination.page - 1)"
            >
              上一页
            </button>
            <button 
              class="btn btn-secondary px-3 py-1"
              [disabled]="pagination.page >= pagination.totalPages"
              (click)="changePage(pagination.page + 1)"
            >
              下一页
            </button>
          </div>
        </div>
      </div>
      
      <div class="card" *ngIf="applications.length === 0">
        <div class="card-body text-center py-12">
          <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <p class="text-gray-500 mb-4">暂无申请记录</p>
          <button class="btn btn-primary" routerLink="/applications/create">
            创建第一个申请
          </button>
        </div>
      </div>
    </div>
    
    <div *ngIf="loading" class="flex items-center justify-center h-64">
      <div class="flex flex-col items-center gap-4">
        <div class="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
        <p class="text-gray-500">加载中...</p>
      </div>
    </div>
  `
})
export class ApplicationListComponent implements OnInit {
  loading = true;
  applications: ExpenseApplication[] = [];
  departments: Department[] = [];
  
  filters = {
    status: '',
    departmentId: ''
  };
  
  pagination = {
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0
  };

  constructor(
    private apiService: ApiService,
    private currencyPipe: CurrencyPipe,
    private datePipe: DatePipe
  ) {}

  ngOnInit() {
    this.loadDepartments();
    this.loadApplications();
  }

  loadDepartments() {
    this.apiService.getDepartments().subscribe({
      next: (res) => {
        if (res.success) {
          this.departments = res.data;
        }
      },
      error: (err) => console.error('加载部门列表失败:', err)
    });
  }

  loadApplications() {
    this.loading = true;
    
    const params: any = {
      page: this.pagination.page,
      pageSize: this.pagination.pageSize
    };
    
    if (this.filters.status) {
      params.status = this.filters.status;
    }
    if (this.filters.departmentId) {
      params.departmentId = this.filters.departmentId;
    }
    
    this.apiService.getApplications(params).subscribe({
      next: (res) => {
        if (res.success) {
          this.applications = res.data.items;
          this.pagination = {
            page: res.data.page,
            pageSize: res.data.pageSize,
            total: res.data.total,
            totalPages: res.data.totalPages
          };
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('加载申请列表失败:', err);
        this.loading = false;
      }
    });
  }

  changePage(page: number) {
    this.pagination.page = page;
    this.loadApplications();
  }
}
