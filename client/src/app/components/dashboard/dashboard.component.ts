import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { StatsData, ExpenseApplication, Budget, Department } from '../../types';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { StatusBadgePipe } from '../../pipes/status-badge.pipe';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, StatusBadgePipe],
  providers: [CurrencyPipe, DatePipe],
  template: `
    <div class="space-y-6 animate-fade-in" *ngIf="!loading">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="card">
          <div class="card-body">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-500 mb-1">总预算</p>
                <p class="text-2xl font-bold text-gray-800">{{ stats?.budget.total | currency:'CNY':'symbol':'1.0-0' }}</p>
              </div>
              <div class="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
            <div class="mt-3 flex items-center text-sm">
              <span class="text-gray-500">预算使用率: </span>
              <span class="font-medium text-primary-600 ml-1">{{ stats?.budget.usageRate }}%</span>
            </div>
          </div>
        </div>
        
        <div class="card">
          <div class="card-body">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-500 mb-1">已使用</p>
                <p class="text-2xl font-bold text-gray-800">{{ stats?.budget.used | currency:'CNY':'symbol':'1.0-0' }}</p>
              </div>
              <div class="w-12 h-12 bg-warning-100 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
            </div>
            <div class="mt-3 flex items-center text-sm">
              <span class="text-gray-500">剩余: </span>
              <span class="font-medium text-success-600 ml-1">{{ stats?.budget.remaining | currency:'CNY':'symbol':'1.0-0' }}</span>
            </div>
          </div>
        </div>
        
        <div class="card">
          <div class="card-body">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-500 mb-1">待审批</p>
                <p class="text-2xl font-bold text-gray-800">{{ stats?.applications.pending }}</p>
              </div>
              <div class="w-12 h-12 bg-danger-100 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-danger-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
            <div class="mt-3 flex items-center text-sm">
              <span class="text-gray-500">本月申请: </span>
              <span class="font-medium text-gray-700 ml-1">{{ stats?.applications.totalThisMonth }}</span>
            </div>
          </div>
        </div>
        
        <div class="card">
          <div class="card-body">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-500 mb-1">已通过</p>
                <p class="text-2xl font-bold text-gray-800">{{ stats?.applications.approved }}</p>
              </div>
              <div class="w-12 h-12 bg-success-100 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
            <div class="mt-3 flex items-center text-sm">
              <span class="text-gray-500">拒绝: </span>
              <span class="font-medium text-danger-600 ml-1">{{ stats?.applications.rejected }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2">
          <div class="card">
            <div class="card-header flex items-center justify-between">
              <h3 class="text-lg font-semibold text-gray-800">最近申请</h3>
              <button class="text-primary-600 text-sm font-medium hover:text-primary-700" routerLink="/applications">
                查看全部
              </button>
            </div>
            <div class="card-body">
              <div class="space-y-4" *ngIf="recentApplications.length > 0">
                <div 
                  *ngFor="let app of recentApplications" 
                  class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                  routerLink="/applications/{{ app.id }}"
                >
                  <div class="flex items-center gap-4">
                    <div class="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <span class="text-primary-700 font-medium text-sm">{{ app.applicantName.charAt(0) }}</span>
                    </div>
                    <div>
                      <p class="font-medium text-gray-800">{{ app.title }}</p>
                      <p class="text-sm text-gray-500">{{ app.applicantName }} · {{ app.createdAt | date:'yyyy-MM-dd' }}</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-4">
                    <span class="font-semibold text-gray-800">{{ app.totalAmount | currency:'CNY':'symbol':'1.0-0' }}</span>
                    <span class="status-badge" [ngClass]="(app.status | statusBadge).class">
                      {{ (app.status | statusBadge).text }}
                    </span>
                  </div>
                </div>
              </div>
              <div *ngIf="recentApplications.length === 0" class="text-center py-8 text-gray-500">
                <p>暂无申请记录</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="lg:col-span-1">
          <div class="card">
            <div class="card-header">
              <h3 class="text-lg font-semibold text-gray-800">部门预算概览</h3>
            </div>
            <div class="card-body">
              <div class="space-y-4" *ngIf="budgets.length > 0">
                <div *ngFor="let budget of budgets" class="space-y-2">
                  <div class="flex items-center justify-between">
                    <span class="font-medium text-gray-700">{{ budget.departmentName }}</span>
                    <span class="text-sm text-gray-500">
                      {{ budget.usedAmount | currency:'CNY':'symbol':'1.0-0' }} / {{ budget.totalAmount | currency:'CNY':'symbol':'1.0-0' }}
                    </span>
                  </div>
                  <div class="progress-bar">
                    <div 
                      class="progress-bar-fill"
                      [ngClass]="getUsageClass(budget.usedAmount, budget.totalAmount)"
                      [style.width.%]="getUsageRate(budget.usedAmount, budget.totalAmount)"
                    ></div>
                  </div>
                  <div class="flex items-center justify-between text-xs">
                    <span class="text-gray-500">使用率: {{ getUsageRate(budget.usedAmount, budget.totalAmount) }}%</span>
                    <span class="status-badge" [ngClass]="(budget.locked ? 'locked' : 'unlocked' | statusBadge).class">
                      {{ (budget.locked ? 'locked' : 'unlocked' | statusBadge).text }}
                    </span>
                  </div>
                </div>
              </div>
              <div *ngIf="budgets.length === 0" class="text-center py-8 text-gray-500">
                <p>暂无预算数据</p>
              </div>
            </div>
          </div>
          
          <div class="card mt-6">
            <div class="card-body">
              <button class="w-full btn btn-primary" routerLink="/applications/create">
                <svg class="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                </svg>
                新建费用申请
              </button>
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
export class DashboardComponent implements OnInit {
  loading = true;
  stats?: StatsData;
  recentApplications: ExpenseApplication[] = [];
  budgets: Budget[] = [];
  departments: Department[] = [];

  constructor(
    private apiService: ApiService,
    private currencyPipe: CurrencyPipe,
    private datePipe: DatePipe
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.apiService.getStats().subscribe({
      next: (res) => {
        if (res.success) {
          this.stats = res.data;
        }
      },
      error: (err) => console.error('加载统计数据失败:', err)
    });

    this.apiService.getApplications({ pageSize: 5 }).subscribe({
      next: (res) => {
        if (res.success) {
          this.recentApplications = res.data.items;
        }
      },
      error: (err) => console.error('加载申请列表失败:', err)
    });

    this.apiService.getBudgets().subscribe({
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
}
