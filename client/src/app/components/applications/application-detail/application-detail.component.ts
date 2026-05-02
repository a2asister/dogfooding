import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { ExpenseApplication, ExpenseItem, User } from '../../../types';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-application-detail',
  template: `
    <div class="space-y-6 animate-fade-in" *ngIf="!loading && application">
      <div class="flex items-center justify-between">
        <button class="btn btn-secondary" routerLink="/applications">
          <svg class="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          返回列表
        </button>
        <div class="flex items-center gap-3">
          <button 
            *ngIf="application.status === 'draft'"
            class="btn btn-outline"
            routerLink="/applications/{{ application.id }}/edit"
          >
            编辑
          </button>
          <button 
            *ngIf="application.status === 'draft'"
            class="btn btn-primary"
            (click)="submitApplication()"
          >
            提交审批
          </button>
        </div>
      </div>
      
      <div class="card">
        <div class="card-header flex items-center justify-between">
          <div>
            <h2 class="text-xl font-bold text-gray-800">{{ application.title }}</h2>
            <p class="text-sm text-gray-500 mt-1">
              申请单号: {{ application.id }}
            </p>
          </div>
          <span class="status-badge text-base px-4 py-1.5" [ngClass]="(application.status | statusBadge).class">
            {{ (application.status | statusBadge).text }}
          </span>
        </div>
        
        <div class="card-body">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div>
              <p class="text-sm text-gray-500 mb-1">申请人</p>
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <span class="text-primary-700 font-medium text-sm">{{ application.applicantName.charAt(0) }}</span>
                </div>
                <span class="font-medium text-gray-800">{{ application.applicantName }}</span>
              </div>
            </div>
            <div>
              <p class="text-sm text-gray-500 mb-1">所属部门</p>
              <p class="font-medium text-gray-800">{{ application.departmentName }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500 mb-1">申请金额</p>
              <p class="font-bold text-xl text-gray-800">{{ application.totalAmount | currency:'CNY':'symbol':'1.0-0' }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500 mb-1">申请时间</p>
              <p class="font-medium text-gray-800">{{ application.createdAt | date:'yyyy-MM-dd HH:mm' }}</p>
            </div>
          </div>
          
          <div class="border-t border-gray-100 pt-6">
            <h3 class="font-semibold text-gray-800 mb-4">费用明细</h3>
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="table-header">序号</th>
                    <th class="table-header">费用类别</th>
                    <th class="table-header">费用描述</th>
                    <th class="table-header">金额</th>
                    <th class="table-header">票据状态</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  <tr *ngFor="let item of application.items; let i = index" class="hover:bg-gray-50">
                    <td class="table-cell">{{ i + 1 }}</td>
                    <td class="table-cell">
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-700">
                        {{ item.category }}
                      </span>
                    </td>
                    <td class="table-cell">{{ item.description }}</td>
                    <td class="table-cell font-medium">{{ item.amount | currency:'CNY':'symbol':'1.0-0' }}</td>
                    <td class="table-cell">
                      <span *ngIf="item.receiptData || item.receiptImage" class="status-badge badge-approved">
                        已上传
                      </span>
                      <span *ngIf="!item.receiptData && !item.receiptImage" class="status-badge badge-draft">
                        未上传
                      </span>
                    </td>
                  </tr>
                </tbody>
                <tfoot class="bg-gray-50">
                  <tr>
                    <td colspan="3" class="table-cell text-right font-semibold">合计:</td>
                    <td class="table-cell font-bold text-lg text-primary-600">
                      {{ application.totalAmount | currency:'CNY':'symbol':'1.0-0' }}
                    </td>
                    <td class="table-cell"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
          
          <div class="border-t border-gray-100 pt-6 mt-6" *ngIf="application.description">
            <h3 class="font-semibold text-gray-800 mb-2">申请说明</h3>
            <p class="text-gray-600">{{ application.description }}</p>
          </div>
        </div>
      </div>
      
      <div class="card" *ngIf="application.status !== 'draft'">
        <div class="card-header">
          <h3 class="text-lg font-semibold text-gray-800">审批记录</h3>
        </div>
        <div class="card-body">
          <div class="space-y-6">
            <div class="flex gap-4">
              <div class="flex flex-col items-center">
                <div class="w-10 h-10 rounded-full flex items-center justify-center" 
                     [ngClass]="application.status === 'approved' ? 'bg-success-100' : 'bg-danger-100'">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                       [ngClass]="application.status === 'approved' ? 'text-success-600' : 'text-danger-600'">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                          [attr.d]="application.status === 'approved' 
                            ? 'M5 13l4 4L19 7' 
                            : 'M6 18L18 6M6 6l12 12'"></path>
                  </svg>
                </div>
              </div>
              <div class="flex-1 pb-6">
                <div class="flex items-center gap-2">
                  <span class="font-medium text-gray-800">{{ application.approverName }}</span>
                  <span class="status-badge" [ngClass]="(application.status | statusBadge).class">
                    {{ application.status === 'approved' ? '同意' : '拒绝' }}
                  </span>
                </div>
                <p class="text-sm text-gray-500 mt-1">
                  审批时间: {{ application.approvedAt | date:'yyyy-MM-dd HH:mm' }}
                </p>
                <p class="text-gray-600 mt-2" *ngIf="application.approvalComment">
                  审批意见: {{ application.approvalComment }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div *ngIf="loading" class="flex items-center justify-center h-64">
      <div class="flex flex-col items-center gap-4">
        <div class="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
        <p class="text-gray-500">加载中...</p>
      </div>
    </div>
    
    <div *ngIf="error" class="card">
      <div class="card-body text-center py-12">
        <svg class="w-16 h-16 text-danger-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
        </svg>
        <p class="text-gray-500 mb-4">{{ error }}</p>
        <button class="btn btn-primary" routerLink="/applications">
          返回列表
        </button>
      </div>
    </div>
    
    <div *ngIf="showSubmitConfirm" class="modal-overlay" (click)="showSubmitConfirm = false">
      <div class="modal-content max-w-md animate-fade-in" (click)="$event.stopPropagation()">
        <div class="card-header">
          <h3 class="text-lg font-semibold text-gray-800">确认提交</h3>
        </div>
        <div class="card-body">
          <p class="text-gray-600">确定要提交此费用申请吗？提交后将进入审批流程，不可再修改。</p>
        </div>
        <div class="p-6 border-t border-gray-100 flex justify-end gap-3">
          <button class="btn btn-secondary" (click)="showSubmitConfirm = false">取消</button>
          <button class="btn btn-primary" (click)="confirmSubmit()" [disabled]="submitting">
            {{ submitting ? '提交中...' : '确认提交' }}
          </button>
        </div>
      </div>
    </div>
  `
})
export class ApplicationDetailComponent implements OnInit {
  loading = true;
  application?: ExpenseApplication;
  error = '';
  showSubmitConfirm = false;
  submitting = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private currencyPipe: CurrencyPipe,
    private datePipe: DatePipe
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadApplication(id);
    }
  }

  loadApplication(id: string) {
    this.loading = true;
    this.apiService.getApplicationById(id).subscribe({
      next: (res) => {
        if (res.success) {
          this.application = res.data;
        } else {
          this.error = res.message || '加载失败';
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('加载申请详情失败:', err);
        this.error = '加载失败，请稍后重试';
        this.loading = false;
      }
    });
  }

  submitApplication() {
    this.showSubmitConfirm = true;
  }

  confirmSubmit() {
    if (!this.application || this.submitting) return;
    
    this.submitting = true;
    this.apiService.submitApplication(this.application.id).subscribe({
      next: (res) => {
        if (res.success) {
          this.application = res.data;
          this.showSubmitConfirm = false;
        }
        this.submitting = false;
      },
      error: (err) => {
        console.error('提交申请失败:', err);
        this.submitting = false;
        alert('提交失败: ' + (err.error?.message || '请稍后重试'));
      }
    });
  }
}
