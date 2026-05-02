import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { ContentService, ContentItem, PaginatedResponse } from '../../services/content.service';

@Component({
  selector: 'app-content-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  template: `
    <div class="space-y-6 animate-fade-in">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 class="text-2xl font-bold text-gray-900">内容审核</h3>
          <p class="text-gray-500 mt-1">管理和审核各类内容</p>
        </div>
        <button 
          (click)="showAddModal = true"
          class="btn-primary inline-flex items-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          新增内容
        </button>
      </div>

      <!-- Filters -->
      <div class="card">
        <div class="card-body">
          <form [formGroup]="filterForm" class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">搜索</label>
              <div class="relative">
                <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input 
                  type="text" 
                  formControlName="search"
                  class="input-field pl-10"
                  placeholder="搜索标题或内容..."
                />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">内容类型</label>
              <select formControlName="type" class="select-field">
                <option value="">全部类型</option>
                <option value="article">图文文章</option>
                <option value="attachment">附件文件</option>
                <option value="comment">用户评论</option>
                <option value="announcement">公告通知</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">审核状态</label>
              <select formControlName="status" class="select-field">
                <option value="">全部状态</option>
                <option value="pending">待审核</option>
                <option value="reviewing">复审中</option>
                <option value="approved">已通过</option>
                <option value="rejected">已驳回</option>
              </select>
            </div>
            <div class="flex items-end">
              <button 
                type="button" 
                (click)="loadContents()"
                class="btn-primary w-full inline-flex items-center justify-center gap-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                筛选
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="card p-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-900">{{ stats?.pending || 0 }}</p>
              <p class="text-sm text-gray-500">待审核</p>
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
              <p class="text-2xl font-bold text-amber-600">{{ stats?.reviewing || 0 }}</p>
              <p class="text-sm text-gray-500">复审中</p>
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
              <p class="text-2xl font-bold text-emerald-600">{{ stats?.approved || 0 }}</p>
              <p class="text-sm text-gray-500">已通过</p>
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
              <p class="text-2xl font-bold text-red-600">{{ stats?.rejected || 0 }}</p>
              <p class="text-sm text-gray-500">已驳回</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="card">
        <div class="card-header flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">内容列表</h3>
          <span class="text-sm text-gray-500">共 {{ paginatedData?.total || 0 }} 条记录</span>
        </div>
        
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-gray-100">
                <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">内容类型</th>
                <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">标题</th>
                <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">作者</th>
                <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">风险等级</th>
                <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">状态</th>
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
                <td class="px-6 py-4">
                  <span 
                    [ngClass]="{
                      'badge badge-gray': item.status === 'pending',
                      'badge badge-warning': item.status === 'reviewing',
                      'badge badge-success': item.status === 'approved',
                      'badge badge-danger': item.status === 'rejected'
                    }"
                  >
                    {{ getStatusLabel(item.status) }}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-500">{{ formatDate(item.createdAt) }}</td>
                <td class="px-6 py-4 text-right">
                  <button 
                    (click)="viewDetail(item)"
                    class="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    审核
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          
          <div *ngIf="contents.length === 0 && !loading" class="py-12 text-center">
            <p class="text-gray-500">暂无数据</p>
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

    <!-- Add Content Modal -->
    <div *ngIf="showAddModal" class="modal-overlay" (click)="closeAddModal()">
      <div class="modal-content animate-fade-in" (click)="$event.stopPropagation()">
        <div class="card-header flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">新增内容</h3>
          <button 
            (click)="closeAddModal()"
            class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form [formGroup]="addForm" class="card-body space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">内容类型 *</label>
            <select formControlName="type" class="select-field">
              <option value="article">图文文章</option>
              <option value="attachment">附件文件</option>
              <option value="comment">用户评论</option>
              <option value="announcement">公告通知</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">标题 *</label>
            <input type="text" formControlName="title" class="input-field" placeholder="请输入标题" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">内容 *</label>
            <textarea 
              formControlName="content" 
              class="input-field min-h-[120px] resize-none" 
              placeholder="请输入内容"
            ></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">作者 *</label>
            <input type="text" formControlName="author" class="input-field" placeholder="请输入作者" />
          </div>
        </form>
        <div class="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
          <button (click)="closeAddModal()" class="btn-secondary">取消</button>
          <button (click)="addContent()" [disabled]="addForm.invalid || adding" class="btn-primary">
            {{ adding ? '提交中...' : '提交' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ContentListComponent implements OnInit {
  contents: ContentItem[] = [];
  paginatedData?: PaginatedResponse<ContentItem>;
  stats?: { total: number; pending: number; reviewing: number; approved: number; rejected: number };
  loading = false;
  adding = false;
  showAddModal = false;
  
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;

  filterForm: FormGroup;
  addForm: FormGroup;

  constructor(
    private contentService: ContentService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      search: [''],
      type: [''],
      status: ['']
    });

    this.addForm = this.fb.group({
      type: ['article'],
      title: [''],
      content: [''],
      author: ['']
    });
  }

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

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      pending: '待审核',
      reviewing: '复审中',
      approved: '已通过',
      rejected: '已驳回'
    };
    return labels[status] || status;
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

  closeAddModal(): void {
    this.showAddModal = false;
    this.addForm.reset({
      type: 'article',
      title: '',
      content: '',
      author: ''
    });
  }

  addContent(): void {
    if (this.addForm.invalid) return;
    
    this.adding = true;
    const data = this.addForm.value;
    
    this.contentService.createContent(data).subscribe({
      next: (response) => {
        if (response.success) {
          this.closeAddModal();
          this.loadContents();
          this.loadStats();
        }
        this.adding = false;
      },
      error: (err) => {
        console.error('Failed to add content:', err);
        this.adding = false;
      }
    });
  }

  loadContents(): void {
    this.loading = true;
    const params: Record<string, any> = {
      ...this.filterForm.value,
      page: this.currentPage,
      pageSize: this.pageSize
    };

    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === null || params[key] === undefined) {
        delete params[key];
      }
    });

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
          this.stats = {
            total: response.data.total,
            pending: response.data.pending,
            reviewing: response.data.reviewing,
            approved: response.data.approved,
            rejected: response.data.rejected
          };
        }
      },
      error: (err) => {
        console.error('Failed to load stats:', err);
      }
    });
  }

  protected readonly Math = Math;
}
