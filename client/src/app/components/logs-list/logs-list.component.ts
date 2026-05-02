import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LogService, AuditLog } from '../../services/log.service';

@Component({
  selector: 'app-logs-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  template: `
    <div class="space-y-6 animate-fade-in">
      <!-- Header -->
      <div>
        <h3 class="text-2xl font-bold text-gray-900">审核日志</h3>
        <p class="text-gray-500 mt-1">查看所有内容审核操作的历史记录</p>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="card p-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-900">{{ totalLogs }}</p>
              <p class="text-sm text-gray-500">总记录数</p>
            </div>
          </div>
        </div>
        <div class="card p-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p class="text-2xl font-bold text-emerald-600">{{ approvedCount }}</p>
              <p class="text-sm text-gray-500">通过数</p>
            </div>
          </div>
        </div>
        <div class="card p-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p class="text-2xl font-bold text-red-600">{{ rejectedCount }}</p>
              <p class="text-sm text-gray-500">驳回数</p>
            </div>
          </div>
        </div>
        <div class="card p-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p class="text-2xl font-bold text-amber-600">{{ reviewCount }}</p>
              <p class="text-sm text-gray-500">复审数</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="card">
        <div class="card-body">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">搜索</label>
              <div class="relative">
                <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input 
                  type="text" 
                  [(ngModel)]="searchQuery"
                  (keyup.enter)="loadLogs()"
                  class="input-field pl-10"
                  placeholder="搜索内容标题..."
                />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">操作类型</label>
              <select [(ngModel)]="actionFilter" (change)="loadLogs()" class="select-field">
                <option value="">全部操作</option>
                <option value="approve">通过</option>
                <option value="reject">驳回</option>
                <option value="review">提交复审</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">开始日期</label>
              <input 
                type="date" 
                [(ngModel)]="startDate"
                (change)="loadLogs()"
                class="input-field"
              />
            </div>
            <div class="flex items-end gap-3">
              <div class="flex-1">
                <label class="block text-sm font-medium text-gray-700 mb-1">结束日期</label>
                <input 
                  type="date" 
                  [(ngModel)]="endDate"
                  (change)="loadLogs()"
                  class="input-field"
                />
              </div>
              <button 
                (click)="loadLogs()"
                class="btn-primary inline-flex items-center gap-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                筛选
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Logs Table -->
      <div class="card">
        <div class="card-header flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">操作日志</h3>
          <span class="text-sm text-gray-500">共 {{ paginatedData?.total || 0 }} 条记录</span>
        </div>
        
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-gray-100">
                <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">时间</th>
                <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">操作人</th>
                <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">内容标题</th>
                <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">操作类型</th>
                <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">原因</th>
                <th class="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr 
                *ngFor="let log of logs"
                class="table-row"
              >
                <td class="px-6 py-4">
                  <div class="flex items-center gap-2 text-sm text-gray-600">
                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {{ formatDate(log.createdAt) }}
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center gap-2">
                    <div class="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <span class="text-sm font-medium text-gray-900">{{ log.auditor }}</span>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="max-w-xs">
                    <p class="text-sm text-gray-900 truncate">{{ log.contentTitle }}</p>
                    <p class="text-xs text-gray-400">ID: {{ log.contentId }}</p>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span 
                    [ngClass]="{
                      'badge badge-success': log.action === 'approve',
                      'badge badge-danger': log.action === 'reject',
                      'badge badge-warning': log.action === 'review'
                    }"
                  >
                    {{ getActionLabel(log.action) }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <span class="text-sm text-gray-600">{{ log.reason || '-' }}</span>
                </td>
                <td class="px-6 py-4 text-right">
                  <button 
                    (click)="viewContent(log.contentId)"
                    class="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    查看内容
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          
          <div *ngIf="logs.length === 0 && !loading" class="py-12 text-center">
            <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 class="text-lg font-medium text-gray-900 mb-2">暂无日志</h4>
            <p class="text-gray-500">当前没有审核操作记录</p>
          </div>
          
          <div *ngIf="loading" class="py-12 text-center">
            <p class="text-gray-500">加载中...</p>
          </div>
        </div>

        <!-- Pagination -->
        <div *ngIf="paginatedData && paginatedData.total > 0" class="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <p class="text-sm text-gray-500">
            显示 {{ (currentPage - 1) * pageSize + 1 }} - {{ Math.min(currentPage * pageSize, paginatedData.total) }} 条，
            共 {{ paginatedData.total }} 条
          </p>
          <div class="flex items-center gap-2">
            <button 
              (click)="goToPage(currentPage - 1)"
              [disabled]="currentPage === 1"
              class="pagination-btn"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button 
              *ngFor="let page of getPageNumbers()"
              (click)="goToPage(page)"
              [ngClass]="{
                'pagination-btn': true,
                'pagination-btn-active': page === currentPage
              }"
            >
              {{ page }}
            </button>
            <button 
              (click)="goToPage(currentPage + 1)"
              [disabled]="currentPage === totalPages"
              class="pagination-btn"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class LogsListComponent implements OnInit {
  logs: AuditLog[] = [];
  paginatedData?: { items: AuditLog[]; total: number; page: number; pageSize: number };
  loading = false;
  
  searchQuery = '';
  actionFilter = '';
  startDate = '';
  endDate = '';
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;

  totalLogs = 0;
  approvedCount = 0;
  rejectedCount = 0;
  reviewCount = 0;

  constructor(
    private logService: LogService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadLogs();
    this.loadStats();
  }

  getActionLabel(action: string): string {
    const labels: Record<string, string> = {
      approve: '通过',
      reject: '驳回',
      review: '提交复审'
    };
    return labels[action] || action;
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadLogs();
  }

  viewContent(contentId: string): void {
    this.router.navigate(['/contents', contentId]);
  }

  loadLogs(): void {
    this.loading = true;
    const params: Record<string, any> = {
      page: this.currentPage,
      pageSize: this.pageSize
    };

    if (this.searchQuery) params['search'] = this.searchQuery;
    if (this.actionFilter) params['action'] = this.actionFilter;
    if (this.startDate) params['startDate'] = this.startDate;
    if (this.endDate) params['endDate'] = this.endDate;

    this.logService.getLogs(params).subscribe({
      next: (response) => {
        if (response.success) {
          this.paginatedData = response.data;
          this.logs = response.data.items;
          this.totalPages = Math.ceil(response.data.total / response.data.pageSize);
          this.totalLogs = response.data.total;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load logs:', err);
        this.loading = false;
      }
    });
  }

  loadStats(): void {
    this.logService.getDailyStats(7).subscribe({
      next: (response) => {
        if (response.success) {
          const stats = response.data;
          this.approvedCount = stats.reduce((sum, s) => sum + s.approved, 0);
          this.rejectedCount = stats.reduce((sum, s) => sum + s.rejected, 0);
          this.reviewCount = stats.reduce((sum, s) => sum + s.reviewed, 0);
        }
      },
      error: (err) => {
        console.error('Failed to load stats:', err);
      }
    });
  }

  protected readonly Math = Math;
}
