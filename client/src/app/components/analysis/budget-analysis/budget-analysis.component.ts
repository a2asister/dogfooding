import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { BudgetAnalysis, DepartmentBudget } from '../../../types';
import { CurrencyPipe, DatePipe } from '@angular/common';

@Component({
  selector: 'app-budget-analysis',
  template: `
    <div class="space-y-6 animate-fade-in" *ngIf="!loading">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 class="text-2xl font-bold text-gray-800">月度预算结余分析</h2>
        <div class="flex items-center gap-4">
          <select 
            class="input-field w-auto"
            [(ngModel)]="selectedYear"
            (change)="loadAnalysis()"
          >
            <option [value]="currentYear - 1">{{ currentYear - 1 }}年</option>
            <option [value]="currentYear">{{ currentYear }}年</option>
            <option [value]="currentYear + 1">{{ currentYear + 1 }}年</option>
          </select>
          <select 
            class="input-field w-auto"
            [(ngModel)]="selectedMonth"
            (change)="loadAnalysis()"
          >
            <option *ngFor="let m of months" [value]="m.value">{{ m.label }}</option>
          </select>
        </div>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4" *ngIf="analysis">
        <div class="card">
          <div class="card-body">
            <p class="text-sm text-gray-500 mb-1">总预算</p>
            <p class="text-2xl font-bold text-gray-800">{{ analysis.totalBudget | currency:'CNY':'symbol':'1.0-0' }}</p>
          </div>
        </div>
        
        <div class="card">
          <div class="card-body">
            <p class="text-sm text-gray-500 mb-1">已使用</p>
            <p class="text-2xl font-bold text-warning-600">{{ analysis.totalUsed | currency:'CNY':'symbol':'1.0-0' }}</p>
          </div>
        </div>
        
        <div class="card">
          <div class="card-body">
            <p class="text-sm text-gray-500 mb-1">结余</p>
            <p class="text-2xl font-bold" [ngClass]="analysis.totalRemaining >= 0 ? 'text-success-600' : 'text-danger-600'">
              {{ analysis.totalRemaining | currency:'CNY':'symbol':'1.0-0' }}
            </p>
          </div>
        </div>
        
        <div class="card">
          <div class="card-body">
            <p class="text-sm text-gray-500 mb-1">整体使用率</p>
            <div class="flex items-center gap-3">
              <p class="text-2xl font-bold" [ngClass]="getUsageClass(analysis.overallUsageRate)">
                {{ analysis.overallUsageRate }}%
              </p>
              <div class="w-16 progress-bar">
                <div 
                  class="progress-bar-fill"
                  [ngClass]="getUsageBgClass(analysis.overallUsageRate)"
                  [style.width.%]="analysis.overallUsageRate"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="card" *ngIf="analysis">
        <div class="card-header flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-800">各部门预算详情</h3>
          <div class="flex items-center gap-4 text-sm text-gray-500">
            <span class="flex items-center gap-1">
              <span class="w-3 h-3 rounded-full bg-success-500"></span>
              正常 (使用率 < 70%)
            </span>
            <span class="flex items-center gap-1">
              <span class="w-3 h-3 rounded-full bg-warning-500"></span>
              预警 (70% ~ 90%)
            </span>
            <span class="flex items-center gap-1">
              <span class="w-3 h-3 rounded-full bg-danger-500"></span>
              超支 (≥ 90%)
            </span>
          </div>
        </div>
        
        <div class="card-body">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="table-header">部门</th>
                  <th class="table-header">总预算</th>
                  <th class="table-header">已使用</th>
                  <th class="table-header">结余</th>
                  <th class="table-header">使用率</th>
                  <th class="table-header">进度</th>
                  <th class="table-header">状态</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr *ngFor="let dept of analysis.departments" class="hover:bg-gray-50">
                  <td class="table-cell font-medium">{{ dept.departmentName }}</td>
                  <td class="table-cell">{{ dept.totalBudget | currency:'CNY':'symbol':'1.0-0' }}</td>
                  <td class="table-cell">{{ dept.usedAmount | currency:'CNY':'symbol':'1.0-0' }}</td>
                  <td class="table-cell" [ngClass]="getRemainingColor(dept)">
                    {{ dept.remainingAmount | currency:'CNY':'symbol':'1.0-0' }}
                  </td>
                  <td class="table-cell">
                    <span class="font-medium" [ngClass]="getUsageClass(dept.usageRate)">
                      {{ dept.usageRate }}%
                    </span>
                  </td>
                  <td class="table-cell">
                    <div class="w-32 progress-bar">
                      <div 
                        class="progress-bar-fill"
                        [ngClass]="getUsageBgClass(dept.usageRate)"
                        [style.width.%]="Math.min(dept.usageRate, 100)"
                      ></div>
                    </div>
                  </td>
                  <td class="table-cell">
                    <span class="status-badge" [ngClass]="dept.locked ? 'badge-locked' : 'badge-unlocked'">
                      {{ dept.locked ? '已锁定' : '正常' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6" *ngIf="analysis">
        <div class="card">
          <div class="card-header">
            <h3 class="text-lg font-semibold text-gray-800">预算使用率排行</h3>
          </div>
          <div class="card-body">
            <div class="space-y-4">
              <div 
                *ngFor="let dept of sortedByUsage; let i = index"
                class="flex items-center gap-4"
              >
                <span 
                  class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                  [ngClass]="{
                    'bg-warning-100 text-warning-700': i === 0,
                    'bg-gray-100 text-gray-600': i !== 0
                  }"
                >
                  {{ i + 1 }}
                </span>
                <div class="flex-1">
                  <div class="flex items-center justify-between mb-1">
                    <span class="font-medium text-gray-700">{{ dept.departmentName }}</span>
                    <span class="text-sm text-gray-500">{{ dept.usageRate }}%</span>
                  </div>
                  <div class="w-full progress-bar">
                    <div 
                      class="progress-bar-fill"
                      [ngClass]="getUsageBgClass(dept.usageRate)"
                      [style.width.%]="Math.min(dept.usageRate, 100)"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="card">
          <div class="card-header">
            <h3 class="text-lg font-semibold text-gray-800">预算结余排行</h3>
          </div>
          <div class="card-body">
            <div class="space-y-4">
              <div 
                *ngFor="let dept of sortedByRemaining; let i = index"
                class="flex items-center gap-4"
              >
                <span 
                  class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                  [ngClass]="{
                    'bg-success-100 text-success-700': i === 0,
                    'bg-gray-100 text-gray-600': i !== 0
                  }"
                >
                  {{ i + 1 }}
                </span>
                <div class="flex-1">
                  <div class="flex items-center justify-between">
                    <span class="font-medium text-gray-700">{{ dept.departmentName }}</span>
                    <span 
                      class="font-semibold"
                      [ngClass]="dept.remainingAmount >= 0 ? 'text-success-600' : 'text-danger-600'"
                    >
                      {{ dept.remainingAmount >= 0 ? '+' : '' }}{{ dept.remainingAmount | currency:'CNY' }}
                    </span>
                  </div>
                  <p class="text-xs text-gray-500 mt-1">
                    预算: {{ dept.totalBudget | currency:'CNY' }} · 已用: {{ dept.usedAmount | currency:'CNY' }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="card" *ngIf="analysis">
        <div class="card-header">
          <h3 class="text-lg font-semibold text-gray-800">预算健康度评估</h3>
        </div>
        <div class="card-body">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="text-center p-4 rounded-lg" [ngClass]="getHealthCardClass('normal')">
              <div class="text-3xl font-bold text-success-600 mb-2">{{ healthStats.normal }}</div>
              <p class="text-gray-600">正常部门</p>
              <p class="text-xs text-gray-500 mt-1">使用率 < 70%</p>
            </div>
            
            <div class="text-center p-4 rounded-lg" [ngClass]="getHealthCardClass('warning')">
              <div class="text-3xl font-bold text-warning-600 mb-2">{{ healthStats.warning }}</div>
              <p class="text-gray-600">预警部门</p>
              <p class="text-xs text-gray-500 mt-1">使用率 70% ~ 90%</p>
            </div>
            
            <div class="text-center p-4 rounded-lg" [ngClass]="getHealthCardClass('danger')">
              <div class="text-3xl font-bold text-danger-600 mb-2">{{ healthStats.danger }}</div>
              <p class="text-gray-600">超支部门</p>
              <p class="text-xs text-gray-500 mt-1">使用率 ≥ 90%</p>
            </div>
          </div>
          
          <div class="mt-6 p-4 rounded-lg" [ngClass]="overallHealthClass">
            <div class="flex items-center gap-3">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                   [ngClass]="{
                     'text-success-600': overallHealth === 'good',
                     'text-warning-600': overallHealth === 'medium',
                     'text-danger-600': overallHealth === 'poor'
                   }">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      [attr.d]="overallHealth === 'good' 
                        ? 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' 
                        : overallHealth === 'medium'
                        ? 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
                        : 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z'"></path>
              </svg>
              <div>
                <p class="font-medium" [ngClass]="{
                  'text-success-800': overallHealth === 'good',
                  'text-warning-800': overallHealth === 'medium',
                  'text-danger-800': overallHealth === 'poor'
                }">
                  整体预算健康度: {{ overallHealthLabel }}
                </p>
                <p class="text-sm" [ngClass]="{
                  'text-success-700': overallHealth === 'good',
                  'text-warning-700': overallHealth === 'medium',
                  'text-danger-700': overallHealth === 'poor'
                }">
                  {{ overallHealthMessage }}
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
  `
})
export class BudgetAnalysisComponent implements OnInit {
  loading = true;
  analysis?: BudgetAnalysis;
  
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

  constructor(
    private apiService: ApiService,
    private currencyPipe: CurrencyPipe,
    private datePipe: DatePipe
  ) {}

  get sortedByUsage(): DepartmentBudget[] {
    if (!this.analysis) return [];
    return [...this.analysis.departments].sort((a, b) => b.usageRate - a.usageRate);
  }

  get sortedByRemaining(): DepartmentBudget[] {
    if (!this.analysis) return [];
    return [...this.analysis.departments].sort((a, b) => b.remainingAmount - a.remainingAmount);
  }

  get healthStats(): { normal: number; warning: number; danger: number } {
    if (!this.analysis) return { normal: 0, warning: 0, danger: 0 };
    
    let normal = 0, warning = 0, danger = 0;
    
    this.analysis.departments.forEach(dept => {
      if (dept.usageRate >= 90) danger++;
      else if (dept.usageRate >= 70) warning++;
      else normal++;
    });
    
    return { normal, warning, danger };
  }

  get overallHealth(): 'good' | 'medium' | 'poor' {
    if (!this.analysis) return 'good';
    
    if (this.analysis.overallUsageRate >= 90 || this.healthStats.danger > 0) return 'poor';
    if (this.analysis.overallUsageRate >= 70 || this.healthStats.warning > 0) return 'medium';
    return 'good';
  }

  get overallHealthLabel(): string {
    switch (this.overallHealth) {
      case 'good': return '良好';
      case 'medium': return '需关注';
      case 'poor': return '需警惕';
    }
  }

  get overallHealthMessage(): string {
    switch (this.overallHealth) {
      case 'good': 
        return '各部门预算使用情况良好，建议继续保持合理的费用管控。';
      case 'medium': 
        return '部分部门预算使用率偏高，建议关注这些部门的费用支出情况。';
      case 'poor': 
        return '部分部门预算使用率已接近或超过 90%，建议及时调整或锁定预算。';
    }
  }

  get overallHealthClass(): string {
    switch (this.overallHealth) {
      case 'good': return 'bg-success-50 border border-success-200';
      case 'medium': return 'bg-warning-50 border border-warning-200';
      case 'poor': return 'bg-danger-50 border border-danger-200';
    }
  }

  ngOnInit() {
    this.loadAnalysis();
  }

  loadAnalysis() {
    this.loading = true;
    this.apiService.getBudgetAnalysis(this.selectedYear, this.selectedMonth).subscribe({
      next: (res) => {
        if (res.success) {
          this.analysis = res.data;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('加载预算分析失败:', err);
        this.loading = false;
      }
    });
  }

  getUsageClass(rate: number): string {
    if (rate >= 90) return 'text-danger-600';
    if (rate >= 70) return 'text-warning-600';
    return 'text-success-600';
  }

  getUsageBgClass(rate: number): string {
    if (rate >= 90) return 'bg-danger-500';
    if (rate >= 70) return 'bg-warning-500';
    return 'bg-success-500';
  }

  getRemainingColor(dept: DepartmentBudget): string {
    if (dept.remainingAmount < 0) return 'text-danger-600 font-medium';
    if (dept.remainingAmount < dept.totalBudget * 0.1) return 'text-warning-600';
    return 'text-success-600';
  }

  getHealthCardClass(type: 'normal' | 'warning' | 'danger'): string {
    const count = this.healthStats[type];
    if (count === 0) return 'bg-gray-50';
    
    switch (type) {
      case 'normal': return 'bg-success-50';
      case 'warning': return 'bg-warning-50';
      case 'danger': return 'bg-danger-50';
    }
  }
}
