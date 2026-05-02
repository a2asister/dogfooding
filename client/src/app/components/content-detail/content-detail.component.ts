import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ContentService, ContentItem } from '../../services/content.service';

@Component({
  selector: 'app-content-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  template: `
    <div class="space-y-6 animate-fade-in">
      <!-- Header -->
      <div class="flex items-center gap-4">
        <button 
          (click)="goBack()"
          class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div>
          <h3 class="text-2xl font-bold text-gray-900">内容审核详情</h3>
          <p class="text-gray-500 mt-1">内容ID: {{ content?.id }}</p>
        </div>
      </div>

      <div *ngIf="loading" class="card card-body text-center py-12">
        <p class="text-gray-500">加载中...</p>
      </div>

      <ng-container *ngIf="!loading && content">
        <!-- Content Info Card -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2 space-y-6">
            <!-- Main Content -->
            <div class="card">
              <div class="card-header flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <ng-container [ngSwitch]="content.type">
                    <svg *ngSwitchCase="'article'" class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <svg *ngSwitchCase="'attachment'" class="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                    <svg *ngSwitchCase="'comment'" class="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <svg *ngSwitchCase="'announcement'" class="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </ng-container>
                  <h4 class="text-lg font-semibold text-gray-900">{{ content.title }}</h4>
                </div>
                <span 
                  [ngClass]="{
                    'badge badge-gray': content.status === 'pending',
                    'badge badge-warning': content.status === 'reviewing',
                    'badge badge-success': content.status === 'approved',
                    'badge badge-danger': content.status === 'rejected'
                  }"
                >
                  {{ getStatusLabel(content.status) }}
                </span>
              </div>
              <div class="card-body space-y-4">
                <div class="grid grid-cols-2 gap-4">
                  <div class="flex items-center gap-2 text-sm text-gray-600">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>作者: {{ content.author }}</span>
                  </div>
                  <div class="flex items-center gap-2 text-sm text-gray-600">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>创建时间: {{ formatDate(content.createdAt) }}</span>
                  </div>
                </div>
                
                <div class="pt-4 border-t border-gray-100">
                  <h5 class="text-sm font-medium text-gray-700 mb-2">内容详情</h5>
                  <p class="text-gray-600 whitespace-pre-wrap">{{ content.content }}</p>
                </div>

                <div *ngIf="content.type === 'attachment'" class="pt-4 border-t border-gray-100">
                  <h5 class="text-sm font-medium text-gray-700 mb-2">附件信息</h5>
                  <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <svg class="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                    <div>
                      <p class="text-sm font-medium text-gray-900">{{ content.fileName }}</p>
                      <p class="text-xs text-gray-500">{{ formatFileSize(content.fileSize || 0) }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Auto Audit Result -->
            <div *ngIf="content.autoAuditResult" class="card">
              <div class="card-header">
                <h4 class="text-lg font-semibold text-gray-900">自动检测结果</h4>
              </div>
              <div class="card-body">
                <div class="flex items-center gap-3 p-4 bg-amber-50 rounded-lg">
                  <svg class="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <p class="font-medium text-amber-800">检测到违规内容</p>
                    <p class="text-sm text-amber-700">置信度: {{ (content.autoAuditResult.confidence * 100).toFixed(0) }}%</p>
                  </div>
                </div>
                <div class="mt-4">
                  <p class="text-sm font-medium text-gray-700 mb-2">违规类型:</p>
                  <div class="flex flex-wrap gap-2">
                    <span 
                      *ngFor="let violation of content.autoAuditResult.violations"
                      class="badge badge-danger"
                    >
                      {{ violation }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Audit History -->
            <div *ngIf="content.auditResult" class="card">
              <div class="card-header">
                <h4 class="text-lg font-semibold text-gray-900">审核记录</h4>
              </div>
              <div class="card-body">
                <div class="flex items-start gap-3">
                  <div class="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div class="flex-1">
                    <div class="flex items-center gap-2">
                      <span class="font-medium text-gray-900">{{ content.auditResult.auditor }}</span>
                      <span 
                        [ngClass]="{
                          'badge badge-success': content.auditResult.action === 'approve',
                          'badge badge-danger': content.auditResult.action === 'reject',
                          'badge badge-warning': content.auditResult.action === 'review'
                        }"
                      >
                        {{ getActionLabel(content.auditResult.action) }}
                      </span>
                    </div>
                    <p *ngIf="content.auditResult.reason" class="text-sm text-gray-600 mt-1">
                      原因: {{ content.auditResult.reason }}
                    </p>
                    <p class="text-xs text-gray-400 mt-1">
                      审核时间: {{ formatDate(content.auditResult.auditedAt) }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Sidebar -->
          <div class="space-y-6">
            <!-- Risk Level -->
            <div class="card">
              <div class="card-header">
                <h4 class="text-lg font-semibold text-gray-900">风险等级</h4>
              </div>
              <div class="card-body">
                <div 
                  [ngClass]="{
                    'flex items-center gap-3 p-4 rounded-lg': true,
                    'bg-red-50': content.riskLevel === 'high',
                    'bg-amber-50': content.riskLevel === 'medium',
                    'bg-emerald-50': content.riskLevel === 'low'
                  }"
                >
                  <svg 
                    [ngClass]="{
                      'w-8 h-8': true,
                      'text-red-600': content.riskLevel === 'high',
                      'text-amber-600': content.riskLevel === 'medium',
                      'text-emerald-600': content.riskLevel === 'low'
                    }"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <p 
                      [ngClass]="{
                        'font-bold text-lg': true,
                        'text-red-600': content.riskLevel === 'high',
                        'text-amber-600': content.riskLevel === 'medium',
                        'text-emerald-600': content.riskLevel === 'low'
                      }"
                    >
                      {{ getRiskLabel(content.riskLevel) }}
                    </p>
                    <p class="text-sm text-gray-500">当前风险评估</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Audit Actions -->
            <div *ngIf="content.status === 'pending' || content.status === 'reviewing'" class="card">
              <div class="card-header">
                <h4 class="text-lg font-semibold text-gray-900">审核操作</h4>
              </div>
              <div class="card-body space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">审核备注</label>
                  <textarea 
                    [(ngModel)]="auditReason"
                    class="input-field min-h-[80px] resize-none"
                    placeholder="请输入审核原因（可选）"
                  ></textarea>
                </div>
                
                <div class="grid grid-cols-1 gap-3">
                  <button 
                    (click)="performAudit('approve')"
                    [disabled]="auditing"
                    class="btn-success w-full inline-flex items-center justify-center gap-2"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    通过审核
                  </button>
                  <button 
                    (click)="performAudit('reject')"
                    [disabled]="auditing"
                    class="btn-danger w-full inline-flex items-center justify-center gap-2"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    驳回内容
                  </button>
                  <button 
                    *ngIf="content.status === 'pending'"
                    (click)="performAudit('review')"
                    [disabled]="auditing"
                    class="btn-warning w-full inline-flex items-center justify-center gap-2"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    提交复审
                  </button>
                </div>
              </div>
            </div>

            <!-- Quick Stats -->
            <div class="card">
              <div class="card-header">
                <h4 class="text-lg font-semibold text-gray-900">内容类型说明</h4>
              </div>
              <div class="card-body space-y-3">
                <div class="flex items-center gap-3 text-sm">
                  <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span class="text-gray-600">图文文章 - 需审核的文章内容</span>
                </div>
                <div class="flex items-center gap-3 text-sm">
                  <svg class="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                  <span class="text-gray-600">附件文件 - 上传的文档和文件</span>
                </div>
                <div class="flex items-center gap-3 text-sm">
                  <svg class="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span class="text-gray-600">用户评论 - 用户发布的评论内容</span>
                </div>
                <div class="flex items-center gap-3 text-sm">
                  <svg class="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <span class="text-gray-600">公告通知 - 系统发布的公告</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ng-container>

      <div *ngIf="!loading && !content" class="card card-body text-center py-12">
        <p class="text-gray-500">内容不存在</p>
        <button (click)="goBack()" class="btn-primary mt-4">返回列表</button>
      </div>
    </div>
  `,
  styles: []
})
export class ContentDetailComponent implements OnInit {
  content?: ContentItem;
  loading = false;
  auditing = false;
  auditReason = '';

  constructor(
    private contentService: ContentService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadContent(id);
    }
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

  getRiskLabel(level: string): string {
    const labels: Record<string, string> = {
      high: '高风险',
      medium: '中风险',
      low: '低风险'
    };
    return labels[level] || level;
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
      minute: '2-digit'
    });
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  goBack(): void {
    this.router.navigate(['/contents']);
  }

  performAudit(action: 'approve' | 'reject' | 'review'): void {
    if (!this.content || this.auditing) return;
    
    this.auditing = true;
    const data = {
      action,
      reason: this.auditReason,
      auditor: '管理员'
    };

    this.contentService.auditContent(this.content.id, data).subscribe({
      next: (response) => {
        if (response.success) {
          this.content = response.data;
          this.auditReason = '';
        }
        this.auditing = false;
      },
      error: (err) => {
        console.error('Failed to audit:', err);
        this.auditing = false;
      }
    });
  }

  private loadContent(id: string): void {
    this.loading = true;
    this.contentService.getContent(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.content = response.data;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load content:', err);
        this.loading = false;
      }
    });
  }
}
