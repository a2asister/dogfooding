import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { Budget, Department } from '../../../types';
import { CurrencyPipe, DatePipe } from '@angular/common';

@Component({
  selector: 'app-budget-list',
  template: `
    <div class="space-y-6 animate-fade-in" *ngIf="!loading">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="flex items-center gap-4">
          <select 
            class="input-field w-auto"
            [(ngModel)]="selectedYear"
            (change)="loadBudgets()"
          >
            <option [value]="currentYear - 1">{{ currentYear - 1 }}年</option>
            <option [value]="currentYear">{{ currentYear }}年</option>
            <option [value]="currentYear + 1">{{ currentYear + 1 }}年</option>
          </select>
          <select 
            class="input-field w-auto"
            [(ngModel)]="selectedMonth"
            (change)="loadBudgets()"
          >
            <option *ngFor="let m of months" [value]="m.value">{{ m.label }}</option>
          </select>
        </div>
        <button class="btn btn-primary" (click)="showCreateModal = true">
          <svg class="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          新建预算
        </button>
      </div>
      
      <div class="card">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="table-header">部门</th>
                <th class="table-header">月份</th>
                <th class="table-header">总预算</th>
                <th class="table-header">已使用</th>
                <th class="table-header">剩余</th>
                <th class="table-header">使用率</th>
                <th class="table-header">状态</th>
                <th class="table-header">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr *ngFor="let budget of budgets" class="hover:bg-gray-50">
                <td class="table-cell font-medium">{{ budget.departmentName }}</td>
                <td class="table-cell">{{ budget.year }}年{{ budget.month }}月</td>
                <td class="table-cell">{{ budget.totalAmount | currency:'CNY':'symbol':'1.0-0' }}</td>
                <td class="table-cell">{{ budget.usedAmount | currency:'CNY':'symbol':'1.0-0' }}</td>
                <td class="table-cell" [ngClass]="getRemainingClass(budget)">
                  {{ budget.totalAmount - budget.usedAmount | currency:'CNY':'symbol':'1.0-0' }}
                </td>
                <td class="table-cell">
                  <div class="flex items-center gap-2">
                    <div class="w-20 progress-bar">
                      <div 
                        class="progress-bar-fill"
                        [ngClass]="getUsageClass(budget.usedAmount, budget.totalAmount)"
                        [style.width.%]="getUsageRate(budget.usedAmount, budget.totalAmount)"
                      ></div>
                    </div>
                    <span class="text-sm">{{ getUsageRate(budget.usedAmount, budget.totalAmount) }}%</span>
                  </div>
                </td>
                <td class="table-cell">
                  <span class="status-badge" [ngClass]="(budget.locked ? 'locked' : 'unlocked' | statusBadge).class">
                    {{ (budget.locked ? 'locked' : 'unlocked' | statusBadge).text }}
                  </span>
                </td>
                <td class="table-cell">
                  <div class="flex items-center gap-2">
                    <button 
                      class="text-primary-600 hover:text-primary-700 text-sm font-medium"
                      (click)="openEditModal(budget)"
                    >
                      编辑
                    </button>
                    <button 
                      class="text-sm font-medium"
                      [ngClass]="budget.locked ? 'text-success-600 hover:text-success-700' : 'text-danger-600 hover:text-danger-700'"
                      (click)="toggleLock(budget)"
                    >
                      {{ budget.locked ? '解锁' : '锁定' }}
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="budgets.length === 0">
                <td colspan="8" class="table-cell text-center text-gray-500 py-12">
                  暂无预算数据
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    
    <div *ngIf="loading" class="flex items-center justify-center h-64">
      <div class="flex flex-col items-center gap-4">
        <div class="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
        <p class="text-gray-500">加载中...</p>
      </div>
    </div>
    
    <div *ngIf="showCreateModal" class="modal-overlay" (click)="closeModal()">
      <div class="modal-content animate-fade-in" (click)="$event.stopPropagation()">
        <div class="card-header flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-800">{{ editingBudget ? '编辑预算' : '新建预算' }}</h3>
          <button class="p-2 hover:bg-gray-100 rounded-lg" (click)="closeModal()">
            <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <div class="card-body space-y-4">
          <div *ngIf="!editingBudget">
            <label class="input-label">部门</label>
            <select class="input-field" [(ngModel)]="formData.departmentId">
              <option value="">请选择部门</option>
              <option *ngFor="let dept of departments" [value]="dept.id">{{ dept.name }}</option>
            </select>
          </div>
          <div>
            <label class="input-label">预算金额</label>
            <input 
              type="number" 
              class="input-field" 
              [(ngModel)]="formData.totalAmount"
              placeholder="请输入预算金额"
              min="0"
            >
          </div>
          <div *ngIf="editingBudget">
            <label class="input-label">已使用金额</label>
            <input 
              type="number" 
              class="input-field bg-gray-50" 
              [value]="editingBudget.usedAmount | currency:'CNY':'symbol':'1.0-0'"
              disabled
            >
            <p class="text-xs text-gray-500 mt-1">已使用金额不可修改</p>
          </div>
        </div>
        <div class="p-6 border-t border-gray-100 flex justify-end gap-3">
          <button class="btn btn-secondary" (click)="closeModal()">取消</button>
          <button class="btn btn-primary" (click)="saveBudget()" [disabled]="!isFormValid()">
            {{ editingBudget ? '保存' : '创建' }}
          </button>
        </div>
      </div>
    </div>
    
    <div *ngIf="showConfirmModal" class="modal-overlay" (click)="showConfirmModal = false">
      <div class="modal-content max-w-md animate-fade-in" (click)="$event.stopPropagation()">
        <div class="card-header">
          <h3 class="text-lg font-semibold text-gray-800">确认操作</h3>
        </div>
        <div class="card-body">
          <p class="text-gray-600">{{ confirmMessage }}</p>
        </div>
        <div class="p-6 border-t border-gray-100 flex justify-end gap-3">
          <button class="btn btn-secondary" (click)="showConfirmModal = false">取消</button>
          <button 
            class="btn"
            [ngClass]="confirmIsDanger ? 'btn-danger' : 'btn-primary'"
            (click)="confirmAction()"
          >
            确认
          </button>
        </div>
      </div>
    </div>
  `
})
export class BudgetListComponent implements OnInit {
  loading = true;
  budgets: Budget[] = [];
  departments: Department[] = [];
  
  currentYear = new Date().getFullYear();
  currentMonth = new Date().getMonth() + 1;
  selectedYear = new Date().getFullYear();
  selectedMonth = new Date().getMonth() + 1;
  
  months = [
    { value: 1, label: '1月' }, { value: 2, label: '2月' }, { value: 3, label: '3月' },
    { value: 4, label: '4月' }, { value: 5, label: '5月' }, { value: 6, label: '6月' },
    { value: 7, label: '7月' }, { value: 8, label: '8月' }, { value: 9, label: '9月' },
    { value: 10, label: '10月' }, { value: 11, label: '11月' }, { value: 12, label: '12月' }
  ];
  
  showCreateModal = false;
  editingBudget?: Budget;
  formData = {
    departmentId: '',
    totalAmount: 0
  };
  
  showConfirmModal = false;
  confirmMessage = '';
  confirmIsDanger = false;
  private confirmCallback?: () => void;

  constructor(
    private apiService: ApiService,
    private currencyPipe: CurrencyPipe,
    private datePipe: DatePipe
  ) {}

  ngOnInit() {
    this.loadDepartments();
    this.loadBudgets();
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

  loadBudgets() {
    this.loading = true;
    this.apiService.getBudgets({ year: this.selectedYear, month: this.selectedMonth }).subscribe({
      next: (res) => {
        if (res.success) {
          this.budgets = res.data;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('加载预算列表失败:', err);
        this.loading = false;
      }
    });
  }

  getUsageRate(used: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((used / total) * 100);
  }

  getUsageClass(used: number, total: number): string {
    const rate = this.getUsageRate(used, total);
    if (rate >= 90) return 'bg-danger-500';
    if (rate >= 70) return 'bg-warning-500';
    return 'bg-success-500';
  }

  getRemainingClass(budget: Budget): string {
    const remaining = budget.totalAmount - budget.usedAmount;
    if (remaining <= 0) return 'text-danger-600 font-medium';
    if (remaining < budget.totalAmount * 0.1) return 'text-warning-600';
    return 'text-success-600';
  }

  openEditModal(budget: Budget) {
    this.editingBudget = budget;
    this.formData = {
      departmentId: budget.departmentId,
      totalAmount: budget.totalAmount
    };
    this.showCreateModal = true;
  }

  closeModal() {
    this.showCreateModal = false;
    this.editingBudget = undefined;
    this.formData = {
      departmentId: '',
      totalAmount: 0
    };
  }

  isFormValid(): boolean {
    if (this.editingBudget) {
      return this.formData.totalAmount >= this.editingBudget.usedAmount;
    }
    return this.formData.departmentId !== '' && this.formData.totalAmount > 0;
  }

  saveBudget() {
    if (!this.isFormValid()) return;
    
    if (this.editingBudget) {
      this.apiService.updateBudget(this.editingBudget.id, {
        totalAmount: this.formData.totalAmount
      }).subscribe({
        next: () => {
          this.loadBudgets();
          this.closeModal();
        },
        error: (err) => console.error('更新预算失败:', err)
      });
    } else {
      const dept = this.departments.find(d => d.id === this.formData.departmentId);
      if (!dept) return;
      
      this.apiService.createBudget({
        departmentId: this.formData.departmentId,
        departmentName: dept.name,
        year: this.selectedYear,
        month: this.selectedMonth,
        totalAmount: this.formData.totalAmount
      }).subscribe({
        next: () => {
          this.loadBudgets();
          this.closeModal();
        },
        error: (err) => console.error('创建预算失败:', err)
      });
    }
  }

  toggleLock(budget: Budget) {
    this.confirmMessage = budget.locked 
      ? `确定要解锁 ${budget.departmentName} 的本月预算吗？`
      : `确定要锁定 ${budget.departmentName} 的本月预算吗？锁定后将无法提交新的费用申请。`;
    this.confirmIsDanger = !budget.locked;
    this.confirmCallback = () => {
      this.apiService.updateBudget(budget.id, { locked: !budget.locked }).subscribe({
        next: () => this.loadBudgets(),
        error: (err) => console.error('更新预算锁定状态失败:', err)
      });
    };
    this.showConfirmModal = true;
  }

  confirmAction() {
    if (this.confirmCallback) {
      this.confirmCallback();
    }
    this.showConfirmModal = false;
  }
}
