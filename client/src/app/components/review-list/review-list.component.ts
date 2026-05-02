import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ContentService, ContentItem, PaginatedResponse } from '../../services/content.service';

@Component({
  selector: 'app-review-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  template: `
    <div class="space-y-6 animate-fade-in">
      <!-- Header -->
      <div>
        <h3 class="text-2xl font-bold text-gray-900">人工复审</h3>
        <p class="text-gray-500 mt-1">对高风险内容进行二次人工审核</p>
      </div>

      <!-- Alert Banner -->
      <div *ngIf="reviewingCount > 0" class="p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <div class="flex items-start gap-3">
          <svg class="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p class="font-medium text-amber-800">有 {{ reviewingCount }} 条内容需要人工复审</p>
            <p class="text-sm text-amber-700 mt-1">这些内容已被自动检测标记为高风险，请及时处理</p>
          </div>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="card p-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p class="text-2xl font-bold text-amber-600">{{ reviewingCount }}</p>
              <p class="text-sm text-gray-500">待复审</p>
            </div>
          </div>
        </div>
        <div class="card p-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <p class="text-2xl font-bold text-red-600">{{ highRiskCount }}</p>
              <p class="text-sm text-gray-500">高风险</p>
            </div>
          </div>
        </div>
        <div class="card p-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <p class="text-2xl font-bold text-amber-600">{{ mediumRiskCount }}</p>
              <p class="text-sm text-gray-500">中风险</p>
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
              <p class="text-2xl font-bold text-emerald-600">{{ todayProcessed }}</p>
              <p class="text-sm text-gray-500">今日已处理</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="card">
        <div class="card-body">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">搜索</label>
              <div class="relative">
                <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input 
                  type="text" 
                  [(ngModel)]="searchQuery"
                  (keyup.enter)="loadContents()"
                  class="input-field pl-10"
                  placeholder="搜索标题或内容..."
                />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">风险等级</label>
              <select [(ngModel)]="riskFilter" (change)="loadContents()" class="select-field">
                <option value="">全部等级</option>
                <option value="high">高风险</option>
                <option value="medium">中风险</option>
                <option value="low">低风险</option>
              </select>
            </div>
            <div class="flex items-end">
              <button 
                (click)="loadContents()"
                class="btn-primary inline-flex items-center gap-2 w-full justify-center"
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

      <!-- Reviewing Content List -->
      <div class="card">
        <div class="card-header flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">待复审内容列表</h3>
          <span class="text-sm text-gray-500">共 {{ paginatedData?.total || 0 }} 条记录</span>
        </div>
        
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-gray-100">
                <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">内容类型</th>
                <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">标题</th>
                <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">作者</th>
                <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">违规检测</th>
                <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">风险等级</th>
                <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">创建时间</th>
                <th class="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr 
                *ngFor="let item of contents"
                class="table-row"
              >
                <td class="px-6 py-4">
                  <div class="flex items-center gap-2">
                    <ng-container [ngSwitch]="item.type">
                      <svg *ngSwitchCase="'article'" class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <svg *ngSwitchCase="'attachment'" class="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                      <svg *ngSwitchCase="'comment'" class="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <svg *ngSwitchCase="'announcement'" class="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                    </ng-container>
                    <span class="text-sm text-gray-700">{{ getTypeLabel(item.type) }}</span>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="max-w-xs">
                    <p class="text-sm font-medium text-gray-900 truncate">{{ item.title }}</p>
                    <p class="text-xs text-gray-500 truncate mt-0.5">{{ item.content }}</p>
                  </div>
                </td>
                <td class="px-6 py-4 text-sm text-gray-700">{{ item.author }}</td>
                <td class="px-6 py-4">
                  <div *ngIf="item.autoAuditResult" class="space-y-1">
                    <div class="flex flex-wrap gap-1">
                      <span 
                        *ngFor="let v of item.autoAuditResult.violations"
                        class="badge badge-danger"
                      >
                        {{ v }}
                      </span>
                    </div>
                    <p class="text-xs text-gray-500">
                      置信度: {{ (item.autoAuditResult.confidence * 100).toFixed(0) }}%
                    </p>
                  </div>
                  <span *ngIf="!item.autoAuditResult" class="text-sm text-gray-400">无</span>
                </td>
                <td class="px-6 py-4">
                  <span 
                    [ngClass]="{
                      'badge badge-danger': item.riskLevel === 'high',
                      'badge badge-warning': item.riskLevel === 'medium',
                      'badge badge-success': item.riskLevel === 'low'
                    }"
                  >
                    {{ getRiskLabel(item.riskLevel) }}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-500">{{ formatDate(item.createdAt) }}</td>
                <td class="px-6 py-4">
                  <div class="flex items-center justify-end gap-2">
                    <button 
                      (click)="quickAction(item, 'approve')"
                      [disabled]="processingId === item.id"
                      class="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      通过
                    </button>
                    <button 
                      (click)="quickAction(item, 'reject')"
                      [disabled]="processingId === item.id"
                      class="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      驳回
                    </button>
                    <button 
                      (click)="viewDetail(item)"
                      class="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      详情
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          
          <div *ngIf="contents.length === 0 && !loading" class="py-12 text-center">
            <div class="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 class="text-lg font-medium text-gray-900 mb-2">全部已处理</h4>
            <p class="text-gray-500">当前没有需要复审的内容</p>
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
export class ReviewListComponent implements OnInit {
  contents: ContentItem[] = [];
  paginatedData?: PaginatedResponse<ContentItem>;
  loading = false;
  processingId?: string;
  
  searchQuery = '';
  riskFilter = '';
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;

  reviewingCount = 0;
  highRiskCount = 0;
  mediumRiskCount = 0;
  todayProcessed = 0;

  constructor(
    private contentService: ContentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadContents();
    this.loadStats();
  }

  getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      article: '图文文章',
      attachment: '附件文件',
      comment: '用户评论',
      announcement: '公告通知'
    };
    return labels[type] || type;
  }

  getRiskLabel(level: string): string {
    const labels: Record<string, string> = {
      high: '高风险',
      medium: '中风险',
      low: '低风险'
    };
    return labels[level] || level;
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
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
    this.loadContents();
  }

  viewDetail(item: ContentItem): void {
    this.router.navigate(['/contents', item.id]);
  }

  quickAction(item: ContentItem, action: 'approve' | 'reject'): void {
    this.processingId = item.id;
    
    this.contentService.auditContent(item.id, {
      action,
      auditor: '管理员',
      reason: action === 'approve' ? '人工复审通过' : '人工复审驳回'
    }).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadContents();
          this.loadStats();
        }
        this.processingId = undefined;
      },
      error: (err) => {
        console.error('Failed to process:', err);
        this.processingId = undefined;
      }
    });
  }

  loadContents(): void {
    this.loading = true;
    const params: Record<string, any> = {
      status: 'reviewing',
      page: this.currentPage,
      pageSize: this.pageSize
    };

    if (this.searchQuery) params['search'] = this.searchQuery;
    if (this.riskFilter) params['riskLevel'] = this.riskFilter;

    this.contentService.getContents(params).subscribe({
      next: (response) => {
        if (response.success) {
          this.paginatedData = response.data;
          this.contents = response.data.items;
          this.totalPages = Math.ceil(response.data.total / response.data.pageSize);
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load contents:', err);
        this.loading = false;
      }
    });
  }

  loadStats(): void {
    this.contentService.getStats().subscribe({
      next: (response) => {
        if (response.success) {
          this.reviewingCount = response.data.reviewing;
          this.highRiskCount = response.data.byRisk.high;
          this.mediumRiskCount = response.data.byRisk.medium;
        }
      },
      error: (err) => {
        console.error('Failed to load stats:', err);
      }
    });
  }

  protected readonly Math = Math;
}
