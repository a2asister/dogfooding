import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ContentService, ContentStats } from '../../services/content.service';
import { LogService, DailyStats, ComplianceStats } from '../../services/log.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule
  ],
  template: `
    <div class="space-y-6 animate-fade-in">
      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Total Contents -->
        <div class="stat-card">
          <div class="flex items-start justify-between">
            <div>
              <p class="text-sm text-gray-500 mb-1">总内容数</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats?.total || 0 }}</p>
              <div class="flex items-center gap-1 mt-2 text-sm text-emerald-600">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <span>+12% 本周</span>
              </div>
            </div>
            <div class="stat-icon bg-primary-100">
              <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Pending -->
        <div class="stat-card cursor-pointer" (click)="navigateTo('contents')">
          <div class="flex items-start justify-between">
            <div>
              <p class="text-sm text-gray-500 mb-1">待审核</p>
              <p class="text-2xl font-bold text-amber-600">{{ stats?.pending || 0 }}</p>
              <div class="flex items-center gap-1 mt-2 text-sm text-gray-500">
                <span>需要人工处理</span>
              </div>
            </div>
            <div class="stat-icon bg-amber-100">
              <svg class="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Approved -->
        <div class="stat-card">
          <div class="flex items-start justify-between">
            <div>
              <p class="text-sm text-gray-500 mb-1">已通过</p>
              <p class="text-2xl font-bold text-emerald-600">{{ stats?.approved || 0 }}</p>
              <div class="flex items-center gap-1 mt-2 text-sm text-emerald-600">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <span>+8% 本周</span>
              </div>
            </div>
            <div class="stat-icon bg-emerald-100">
              <svg class="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Rejected -->
        <div class="stat-card">
          <div class="flex items-start justify-between">
            <div>
              <p class="text-sm text-gray-500 mb-1">已驳回</p>
              <p class="text-2xl font-bold text-red-600">{{ stats?.rejected || 0 }}</p>
              <div class="flex items-center gap-1 mt-2 text-sm text-red-600">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
                <span>-5% 本周</span>
              </div>
            </div>
            <div class="stat-icon bg-red-100">
              <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Content Types & Compliance -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Content by Type -->
        <div class="card col-span-1">
          <div class="card-header flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900">内容类型分布</h3>
          </div>
          <div class="card-body space-y-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-3 h-3 rounded-full bg-blue-500"></div>
                <span class="text-sm text-gray-600">图文文章</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-sm font-medium text-gray-900">{{ stats?.byType?.article || 0 }}</span>
                <span class="text-xs text-gray-400">条</span>
              </div>
            </div>
            <div class="w-full bg-gray-100 rounded-full h-2">
              <div 
                class="bg-blue-500 h-2 rounded-full transition-all duration-500"
                [style.width]="getPercentage(stats?.byType?.article || 0, stats?.total || 0) + '%'"
              ></div>
            </div>

            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-3 h-3 rounded-full bg-purple-500"></div>
                <span class="text-sm text-gray-600">附件文件</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-sm font-medium text-gray-900">{{ stats?.byType?.attachment || 0 }}</span>
                <span class="text-xs text-gray-400">条</span>
              </div>
            </div>
            <div class="w-full bg-gray-100 rounded-full h-2">
              <div 
                class="bg-purple-500 h-2 rounded-full transition-all duration-500"
                [style.width]="getPercentage(stats?.byType?.attachment || 0, stats?.total || 0) + '%'"
              ></div>
            </div>

            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span class="text-sm text-gray-600">用户评论</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-sm font-medium text-gray-900">{{ stats?.byType?.comment || 0 }}</span>
                <span class="text-xs text-gray-400">条</span>
              </div>
            </div>
            <div class="w-full bg-gray-100 rounded-full h-2">
              <div 
                class="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                [style.width]="getPercentage(stats?.byType?.comment || 0, stats?.total || 0) + '%'"
              ></div>
            </div>

            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-3 h-3 rounded-full bg-amber-500"></div>
                <span class="text-sm text-gray-600">公告通知</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-sm font-medium text-gray-900">{{ stats?.byType?.announcement || 0 }}</span>
                <span class="text-xs text-gray-400">条</span>
              </div>
            </div>
            <div class="w-full bg-gray-100 rounded-full h-2">
              <div 
                class="bg-amber-500 h-2 rounded-full transition-all duration-500"
                [style.width]="getPercentage(stats?.byType?.announcement || 0, stats?.total || 0) + '%'"
              ></div>
            </div>
          </div>
        </div>

        <!-- Risk Levels -->
        <div class="card col-span-1">
          <div class="card-header flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900">风险等级分布</h3>
          </div>
          <div class="card-body space-y-4">
            <div class="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div class="flex items-center gap-3">
                <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span class="text-sm font-medium text-red-800">高风险</span>
              </div>
              <span class="text-lg font-bold text-red-600">{{ stats?.byRisk?.high || 0 }}</span>
            </div>

            <div class="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
              <div class="flex items-center gap-3">
                <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span class="text-sm font-medium text-amber-800">中风险</span>
              </div>
              <span class="text-lg font-bold text-amber-600">{{ stats?.byRisk?.medium || 0 }}</span>
            </div>

            <div class="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
              <div class="flex items-center gap-3">
                <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span class="text-sm font-medium text-emerald-800">低风险</span>
              </div>
              <span class="text-lg font-bold text-emerald-600">{{ stats?.byRisk?.low || 0 }}</span>
            </div>
          </div>
        </div>

        <!-- Compliance Stats -->
        <div class="card col-span-1">
          <div class="card-header flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900">合规状态</h3>
            <button 
              (click)="navigateTo('reports')"
              class="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              查看详情 <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <div class="card-body">
            <div class="flex items-center justify-center mb-6">
              <div class="relative w-32 h-32">
                <svg class="w-32 h-32 transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="#e2e8f0"
                    stroke-width="12"
                    fill="none"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    [attr.stroke]="compliance?.complianceRate! >= 90 ? '#10b981' : compliance?.complianceRate! >= 70 ? '#f59e0b' : '#ef4444'"
                    stroke-width="12"
                    fill="none"
                    stroke-linecap="round"
                    [attr.stroke-dasharray]="getDashArray(compliance?.complianceRate || 0)"
                    class="transition-all duration-1000"
                  />
                </svg>
                <div class="absolute inset-0 flex flex-col items-center justify-center">
                  <span class="text-3xl font-bold text-gray-900">{{ compliance?.complianceRate || 0 }}%</span>
                  <span class="text-xs text-gray-500">合规率</span>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="text-center p-3 bg-gray-50 rounded-lg">
                <p class="text-xs text-gray-500">活跃规则</p>
                <p class="text-lg font-bold text-gray-900">{{ compliance?.activeRules || 0 }}/{{ compliance?.totalRules || 0 }}</p>
              </div>
              <div class="text-center p-3 bg-gray-50 rounded-lg">
                <p class="text-xs text-gray-500">待处理高风险</p>
                <p class="text-lg font-bold text-red-600">{{ compliance?.highRiskContents || 0 }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Daily Trend -->
      <div class="card">
        <div class="card-header flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">近7天审核趋势</h3>
        </div>
        <div class="card-body">
          <div class="flex items-end justify-between h-48 gap-4">
            <div 
              *ngFor="let day of dailyStats"
              class="flex-1 flex flex-col items-center gap-2"
            >
              <div class="flex items-end gap-1 h-32">
                <div 
                  class="w-4 bg-emerald-500 rounded-t transition-all duration-500"
                  [style.height]="(day.approved / (getMaxCount() || 1) * 100) + '%'"
                ></div>
                <div 
                  class="w-4 bg-red-500 rounded-t transition-all duration-500"
                  [style.height]="(day.rejected / (getMaxCount() || 1) * 100) + '%'"
                ></div>
              </div>
              <div class="text-center">
                <p class="text-xs font-medium text-gray-900">{{ formatDate(day.date) }}</p>
                <p class="text-xs text-gray-500">{{ day.total }} 条</p>
              </div>
            </div>
          </div>
          <div class="flex items-center justify-center gap-6 mt-6">
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded bg-emerald-500"></div>
              <span class="text-sm text-gray-600">通过</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded bg-red-500"></div>
              <span class="text-sm text-gray-600">驳回</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button 
          (click)="navigateTo('contents')"
          class="card p-6 text-left hover:shadow-md transition-shadow cursor-pointer group"
        >
          <div class="flex items-start gap-4">
            <div class="stat-icon bg-primary-100 group-hover:bg-primary-200 transition-colors">
              <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h4 class="font-semibold text-gray-900 mb-1">内容审核</h4>
              <p class="text-sm text-gray-500">审核图文、附件、评论等各类内容</p>
            </div>
          </div>
        </button>

        <button 
          (click)="navigateTo('review')"
          class="card p-6 text-left hover:shadow-md transition-shadow cursor-pointer group"
        >
          <div class="flex items-start gap-4">
            <div class="stat-icon bg-amber-100 group-hover:bg-amber-200 transition-colors">
              <svg class="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h4 class="font-semibold text-gray-900 mb-1">人工复审</h4>
              <p class="text-sm text-gray-500">对高风险内容进行人工二次审核</p>
            </div>
          </div>
        </button>

        <button 
          (click)="navigateTo('rules')"
          class="card p-6 text-left hover:shadow-md transition-shadow cursor-pointer group"
        >
          <div class="flex items-start gap-4">
            <div class="stat-icon bg-purple-100 group-hover:bg-purple-200 transition-colors">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h4 class="font-semibold text-gray-900 mb-1">违规规则</h4>
              <p class="text-sm text-gray-500">管理自定义违规检测规则</p>
            </div>
          </div>
        </button>
      </div>
    </div>
  `,
  styles: []
})
export class DashboardComponent implements OnInit {
  stats?: ContentStats;
  compliance?: ComplianceStats;
  dailyStats: DailyStats[] = [];

  constructor(
    private contentService: ContentService,
    private logService: LogService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadStats();
    this.loadCompliance();
    this.loadDailyStats();
  }

  getPercentage(value: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  }

  getDashArray(value: number): string {
    const circumference = 2 * Math.PI * 56;
    const dash = (value / 100) * circumference;
    return `${dash} ${circumference}`;
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  }

  getMaxCount(): number {
    if (!this.dailyStats.length) return 0;
    return Math.max(...this.dailyStats.map(d => Math.max(d.approved, d.rejected)));
  }

  navigateTo(route: string): void {
    this.router.navigate([`/${route}`]);
  }

  private loadStats(): void {
    this.contentService.getStats().subscribe({
      next: (response) => {
        if (response.success) {
          this.stats = response.data;
        }
      },
      error: (err) => {
        console.error('Failed to load stats:', err);
      }
    });
  }

  private loadCompliance(): void {
    this.logService.getComplianceStats().subscribe({
      next: (response) => {
        if (response.success) {
          this.compliance = response.data;
        }
      },
      error: (err) => {
        console.error('Failed to load compliance:', err);
      }
    });
  }

  private loadDailyStats(): void {
    this.logService.getDailyStats(7).subscribe({
      next: (response) => {
        if (response.success) {
          this.dailyStats = response.data;
        }
      },
      error: (err) => {
        console.error('Failed to load daily stats:', err);
      }
    });
  }
}
