import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { ExpenseApplication, User, Department } from '../../../types';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-approval-list',
  template: `
    <div class="space-y-6 animate-fade-in" *ngIf="!loading">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="card">
          <div class="card-body">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-500 mb-1">待审批</p>
                <p class="text-2xl font-bold text-warning-600">{{ stats.pending }}</p>
              </div>
              <div class="w-12 h-12 bg-warning-100 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        <div class="card">
          <div class="card-body">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-500 mb-1">已通过</p>
                <p class="text-2xl font-bold text-success-600">{{ stats.approved }}</p>
              </div>
              <div class="w-12 h-12 bg-success-100 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        <div class="card">
          <div class="card-body">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-500 mb-1">已拒绝</p>
                <p class="text-2xl font-bold text-danger-600">{{ stats.rejected }}</p>
              </div>
              <div class="w-12 h-12 bg-danger-100 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-danger-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        <div class="card">
          <div class="card-body">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-500 mb-1">待处理总额</p>
                <p class="text-2xl font-bold text-primary-600">{{ pendingTotal | currency:'CNY':'symbol':'1.0-0' }}</p>
              </div>
              <div class="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="flex items-center gap-2">
          <button 
            class="px-4 py-2 rounded-lg font-medium transition-all"
            [ngClass]="{
              'bg-primary-600 text-white': filterStatus === 'pending',
              'bg-gray-100 text-gray-600 hover:bg-gray-200': filterStatus !== 'pending'
            }"
            (click)="filterStatus = 'pending'"
          >
            待审批 ({{ counts.pending }})
          </button>
          <button 
            class="px-4 py-2 rounded-lg font-medium transition-all"
            [ngClass]="{
              'bg-primary-600 text-white': filterStatus === 'all',
              'bg-gray-100 text-gray-600 hover:bg-gray-200': filterStatus !== 'all'
            }"
            (click)="filterStatus = 'all'"
          >
            全部
          </button>
        </div>
      </div>
      
      <div class="card" *ngIf="filteredApplications.length > 0">
        <div class="divide-y divide-gray-200">
          <div 
            *ngFor="let app of filteredApplications" 
            class="p-6 hover:bg-gray-50 transition-colors"
          >
            <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div class="flex-1">
                <div class="flex items-start justify-between mb-2">
                  <div>
                    <h4 class="font-semibold text-gray-800 text-lg">{{ app.title }}</h4>
                    <p class="text-sm text-gray-500 mt-1">
                      申请单号: {{ app.id }}
                    </p>
                  </div>
                  <span class="status-badge" [ngClass]="(app.status | statusBadge).class">
                    {{ (app.status | statusBadge).text }}
                  </span>
                </div>
                
                <div class="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                  <div class="flex items-center gap-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                    {{ app.applicantName }} ({{ app.departmentName }})
                  </div>
                  <div class="flex items-center gap-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    {{ app.createdAt | date:'yyyy-MM-dd HH:mm' }}
                  </div>
                  <div class="flex items-center gap-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                    </svg>
                    {{ app.items.length }} 项明细
                  </div>
                </div>
                
                <div class="flex flex-wrap gap-2">
                  <span 
                    *ngFor="let item of app.items.slice(0, 3)"
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                  >
                    {{ item.category }}: {{ item.description | slice:0:15 }}
                  </span>
                  <span 
                    *ngIf="app.items.length > 3"
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                  >
                    +{{ app.items.length - 3 }} 项
                  </span>
                </div>
              </div>
              
              <div class="flex flex-col sm:flex-row items-center gap-4 lg:flex-shrink-0">
                <div class="text-right">
                  <p class="text-sm text-gray-500">申请金额</p>
                  <p class="text-2xl font-bold text-gray-800">{{ app.totalAmount | currency:'CNY':'symbol':'1.0-0' }}</p>
                </div>
                
                <div class="flex gap-2" *ngIf="app.status === 'pending'">
                  <button 
                    class="btn btn-success"
                    (click)="openApprovalModal(app, 'approve')"
                  >
                    通过
                  </button>
                  <button 
                    class="btn btn-danger"
                    (click)="openApprovalModal(app, 'reject')"
                  >
                    拒绝
                  </button>
                  <button 
                    class="btn btn-outline"
                    (click)="viewDetail(app)"
                  >
                    详情
                  </button>
                </div>
                
                <button 
                  *ngIf="app.status !== 'pending'"
                  class="btn btn-secondary"
                  (click)="viewDetail(app)"
                >
                  查看详情
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="card" *ngIf="filteredApplications.length === 0">
        <div class="card-body text-center py-12">
          <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
          </svg>
          <p class="text-gray-500">暂无{{ filterStatus === 'pending' ? '待审批' : '' }}申请</p>
        </div>
      </div>
    </div>
    
    <div *ngIf="loading" class="flex items-center justify-center h-64">
      <div class="flex flex-col items-center gap-4">
        <div class="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
        <p class="text-gray-500">加载中...</p>
      </div>
    </div>
    
    <div *ngIf="showApprovalModal && selectedApplication" class="modal-overlay" (click)="closeApprovalModal()">
      <div class="modal-content max-w-lg animate-fade-in" (click)="$event.stopPropagation()">
        <div class="card-header">
          <h3 class="text-lg font-semibold text-gray-800">
            {{ approvalAction === 'approve' ? '审批通过' : '拒绝申请' }}
          </h3>
        </div>
        <div class="card-body">
          <div class="mb-4 p-4 bg-gray-50 rounded-lg">
            <p class="font-medium text-gray-800">{{ selectedApplication.title }}</p>
            <p class="text-sm text-gray-500 mt-1">
              申请人: {{ selectedApplication.applicantName }} · 金额: {{ selectedApplication.totalAmount | currency:'CNY' }}
            </p>
          </div>
          
          <div>
            <label class="input-label">审批意见 {{ approvalAction === 'reject' ? '(必填)' : '(可选)' }}</label>
            <textarea 
              [formControl]="approvalComment"
              class="input-field h-24 resize-none"
              placeholder="请输入审批意见..."
            ></textarea>
          </div>
        </div>
        <div class="p-6 border-t border-gray-100 flex justify-end gap-3">
          <button class="btn btn-secondary" (click)="closeApprovalModal()">取消</button>
          <button 
            class="btn"
            [ngClass]="approvalAction === 'approve' ? 'btn-success' : 'btn-danger'"
            (click)="submitApproval()"
            [disabled]="processing || (approvalAction === 'reject' && !approvalComment.value)"
          >
            {{ processing ? '处理中...' : (approvalAction === 'approve' ? '确认通过' : '确认拒绝') }}
          </button>
        </div>
      </div>
    </div>
  `
})
export class ApprovalListComponent implements OnInit {
  loading = true;
  applications: ExpenseApplication[] = [];
  filterStatus: 'all' | 'pending' = 'pending';
  
  approvalComment = this.fb.control('');
  showApprovalModal = false;
  selectedApplication?: ExpenseApplication;
  approvalAction: 'approve' | 'reject' = 'approve';
  processing = false;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private fb: FormBuilder,
    private currencyPipe: CurrencyPipe,
    private datePipe: DatePipe
  ) {}

  get filteredApplications(): ExpenseApplication[] {
    if (this.filterStatus === 'pending') {
      return this.applications.filter(a => a.status === 'pending');
    }
    return this.applications;
  }

  get counts() {
    return {
      pending: this.applications.filter(a => a.status === 'pending').length,
      approved: this.applications.filter(a => a.status === 'approved').length,
      rejected: this.applications.filter(a => a.status === 'rejected').length
    };
  }

  get stats() {
    const pending = this.applications.filter(a => a.status === 'pending').length;
    const approved = this.applications.filter(a => a.status === 'approved').length;
    const rejected = this.applications.filter(a => a.status === 'rejected').length;
    
    return { pending, approved, rejected };
  }

  get pendingTotal(): number {
    return this.applications
      .filter(a => a.status === 'pending')
      .reduce((sum, a) => sum + a.totalAmount, 0);
  }

  ngOnInit() {
    this.loadApplications();
  }

  loadApplications() {
    this.loading = true;
    this.apiService.getApplications({ pageSize: 100 }).subscribe({
      next: (res) => {
        if (res.success) {
          this.applications = res.data.items.sort((a, b) => {
            if (a.status === 'pending' && b.status !== 'pending') return -1;
            if (a.status !== 'pending' && b.status === 'pending') return 1;
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          });
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('加载申请列表失败:', err);
        this.loading = false;
      }
    });
  }

  openApprovalModal(application: ExpenseApplication, action: 'approve' | 'reject') {
    this.selectedApplication = application;
    this.approvalAction = action;
    this.approvalComment.reset();
    this.showApprovalModal = true;
  }

  closeApprovalModal() {
    this.showApprovalModal = false;
    this.selectedApplication = undefined;
    this.processing = false;
  }

  viewDetail(application: ExpenseApplication) {
    this.router.navigate(['/applications', application.id]);
  }

  async submitApproval() {
    if (!this.selectedApplication || this.processing) return;
    
    if (this.approvalAction === 'reject' && !this.approvalComment.value) {
      alert('请输入拒绝原因');
      return;
    }
    
    this.processing = true;
    
    const currentUser = { id: 'user-001', name: '张三' };
    
    try {
      if (this.approvalAction === 'approve') {
        await this.apiService.approveApplication(this.selectedApplication.id, {
          approverId: currentUser.id,
          approverName: currentUser.name,
          approvalComment: this.approvalComment.value || ''
        }).toPromise();
      } else {
        await this.apiService.rejectApplication(this.selectedApplication.id, {
          approverId: currentUser.id,
          approverName: currentUser.name,
          approvalComment: this.approvalComment.value || ''
        }).toPromise();
      }
      
      this.closeApprovalModal();
      this.loadApplications();
    } catch (err) {
      console.error('审批失败:', err);
      alert('审批失败: ' + ((err as any)?.error?.message || '请稍后重试'));
      this.processing = false;
    }
  }
}
