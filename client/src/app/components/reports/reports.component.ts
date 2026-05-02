import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentService, ContentStats } from '../../services/content.service';
import { LogService, DailyStats, ComplianceStats } from '../../services/log.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule
  ],
  template: `
    <div class="space-y-6 animate-fade-in">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 class="text-2xl font-bold text-gray-900">合规报表</h3>
          <p class="text-gray-500 mt-1">查看内容审核的合规性统计和趋势分析</p>
        </div>
        <button class="btn-primary inline-flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          导出报表
        </button>
      </div>

      <!-- Compliance Overview -->
      <div class="card">
        <div class="card-header flex items-center justify-between">
          <h4 class="text-lg font-semibold text-gray-900">合规概览</h4>
          <div class="flex items-center gap-2 text-sm text-gray-500">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>近30天</span>
          </div>
        </div>
        <div class="card-body">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div class="text-center p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl">
              <div class="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                <svg class="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <p class="text-4xl font-bold text-emerald-600 mb-1">{{ compliance?.complianceRate || 0 }}%</p>
              <p class="text-sm text-emerald-700">合规率</p>
              <div class="flex items-center justify-center gap-1 mt-2 text-xs text-emerald-600">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <span>较上月 +5.2%</span>
              </div>
            </div>

            <div class="text-center p-6 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl">
              <div class="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                <svg class="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p class="text-4xl font-bold text-primary-600 mb-1">{{ compliance?.totalAudited || 0 }}</p>
              <p class="text-sm text-primary-700">已审核内容</p>
              <div class="mt-2 text-xs text-primary-600">
                包含自动和人工审核
              </div>
            </div>

            <div class="text-center p-6 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl">
              <div class="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                <svg class="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p class="text-4xl font-bold text-amber-600 mb-1">{{ compliance?.avgResponseTime || 0 }}h</p>
              <p class="text-sm text-amber-700">平均响应时间</p>
              <div class="flex items-center justify-center gap-1 mt-2 text-xs text-amber-600">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <span>优于行业平均</span>
              </div>
            </div>

            <div class="text-center p-6 bg-gradient-to-br from-red-50 to-red-100 rounded-xl">
              <div class="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p class="text-4xl font-bold text-red-600 mb-1">{{ compliance?.highRiskContents || 0 }}</p>
              <p class="text-sm text-red-700">待处理高风险</p>
              <div class="mt-2 text-xs text-red-600">
                需要及时处理
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Rules & Trend -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Rules Status -->
        <div class="card lg:col-span-1">
          <div class="card-header">
            <h4 class="text-lg font-semibold text-gray-900">规则状态</h4>
          </div>
          <div class="card-body space-y-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-900">已启用规则</p>
                  <p class="text-xs text-gray-500">正在生效</p>
                </div>
              </div>
              <span class="text-2xl font-bold text-emerald-600">{{ compliance?.activeRules || 0 }}</span>
            </div>

            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-900">已禁用规则</p>
                  <p class="text-xs text-gray-500">暂时未启用</p>
                </div>
              </div>
              <span class="text-2xl font-bold text-gray-500">
                {{ (compliance?.totalRules || 0) - (compliance?.activeRules || 0) }}
              </span>
            </div>

            <div class="pt-4 border-t border-gray-100">
              <p class="text-sm text-gray-600 mb-2">规则启用率</p>
              <div class="w-full bg-gray-100 rounded-full h-3">
                <div 
                  class="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all duration-1000"
                  [style.width]="getRulePercentage() + '%'"
                ></div>
              </div>
              <p class="text-right text-sm font-medium text-gray-700 mt-1">{{ getRulePercentage() }}%</p>
            </div>
          </div>
        </div>

        <!-- 7-Day Trend -->
        <div class="card lg:col-span-2">
          <div class="card-header flex items-center justify-between">
            <h4 class="text-lg font-semibold text-gray-900">7天审核趋势</h4>
            <select class="select-field text-sm w-auto">
              <option>近7天</option>
              <option>近30天</option>
              <option>近90天</option>
            </select>
          </div>
          <div class="card-body">
            <div class="flex items-end justify-between h-64 gap-2">
              <div 
                *ngFor="let day of dailyStats; let last = last"
                class="flex-1 flex flex-col items-center gap-2"
              >
                <div class="flex items-end gap-1 h-48">
                  <div 
                    class="w-6 bg-emerald-500 rounded-t transition-all duration-500"
                    [style.height]="(day.approved / (getMaxDailyCount() || 1) * 100) + '%'"
                    [class.opacity-50]="day.approved === 0"
                  ></div>
                  <div 
                    class="w-6 bg-red-500 rounded-t transition-all duration-500"
                    [style.height]="(day.rejected / (getMaxDailyCount() || 1) * 100) + '%'"
                    [class.opacity-50]="day.rejected === 0"
                  ></div>
                </div>
                <div class="text-center">
                  <p class="text-xs font-medium text-gray-900">{{ formatDate(day.date) }}</p>
                  <p class="text-xs text-gray-500">{{ day.total }} 条</p>
                </div>
              </div>
            </div>

            <div class="flex items-center justify-center gap-8 mt-6 pt-4 border-t border-gray-100">
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 rounded bg-emerald-500"></div>
                <span class="text-sm text-gray-600">通过 ({{ getTotalApproved() }})</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 rounded bg-red-500"></div>
                <span class="text-sm text-gray-600">驳回 ({{ getTotalRejected() }})</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Content Type Breakdown -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- By Type -->
        <div class="card">
          <div class="card-header">
            <h4 class="text-lg font-semibold text-gray-900">内容类型分布</h4>
          </div>
          <div class="card-body space-y-4">
            <div *ngIf="contentStats" class="space-y-4">
              <div>
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center gap-2">
                    <div class="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span class="text-sm text-gray-700">图文文章</span>
                  </div>
                  <span class="text-sm font-medium text-gray-900">
                    {{ contentStats.byType.article }} 条 ({{ getPercentage(contentStats.byType.article, contentStats.total) }}%)
                  </span>
                </div>
                <div class="w-full bg-gray-100 rounded-full h-2">
                  <div 
                    class="bg-blue-500 h-2 rounded-full transition-all duration-1000"
                    [style.width]="getPercentage(contentStats.byType.article, contentStats.total) + '%'"
                  ></div>
                </div>
              </div>

              <div>
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center gap-2">
                    <div class="w-3 h-3 rounded-full bg-purple-500"></div>
                    <span class="text-sm text-gray-700">附件文件</span>
                  </div>
                  <span class="text-sm font-medium text-gray-900">
                    {{ contentStats.byType.attachment }} 条 ({{ getPercentage(contentStats.byType.attachment, contentStats.total) }}%)
                  </span>
                </div>
                <div class="w-full bg-gray-100 rounded-full h-2">
                  <div 
                    class="bg-purple-500 h-2 rounded-full transition-all duration-1000"
                    [style.width]="getPercentage(contentStats.byType.attachment, contentStats.total) + '%'"
                  ></div>
                </div>
              </div>

              <div>
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center gap-2">
                    <div class="w-3 h-3 rounded-full bg-emerald-500"></div>
                    <span class="text-sm text-gray-700">用户评论</span>
                  </div>
                  <span class="text-sm font-medium text-gray-900">
                    {{ contentStats.byType.comment }} 条 ({{ getPercentage(contentStats.byType.comment, contentStats.total) }}%)
                  </span>
                </div>
                <div class="w-full bg-gray-100 rounded-full h-2">
                  <div 
                    class="bg-emerald-500 h-2 rounded-full transition-all duration-1000"
                    [style.width]="getPercentage(contentStats.byType.comment, contentStats.total) + '%'"
                  ></div>
                </div>
              </div>

              <div>
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center gap-2">
                    <div class="w-3 h-3 rounded-full bg-amber-500"></div>
                    <span class="text-sm text-gray-700">公告通知</span>
                  </div>
                  <span class="text-sm font-medium text-gray-900">
                    {{ contentStats.byType.announcement }} 条 ({{ getPercentage(contentStats.byType.announcement, contentStats.total) }}%)
                  </span>
                </div>
                <div class="w-full bg-gray-100 rounded-full h-2">
                  <div 
                    class="bg-amber-500 h-2 rounded-full transition-all duration-1000"
                    [style.width]="getPercentage(contentStats.byType.announcement, contentStats.total) + '%'"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- By Risk -->
        <div class="card">
          <div class="card-header">
            <h4 class="text-lg font-semibold text-gray-900">风险等级分布</h4>
          </div>
          <div class="card-body">
            <div *ngIf="contentStats" class="grid grid-cols-2 gap-4">
              <div class="p-4 bg-red-50 rounded-xl border border-red-100">
                <div class="flex items-center gap-3 mb-3">
                  <div class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <p class="text-2xl font-bold text-red-600">{{ contentStats.byRisk.high }}</p>
                    <p class="text-xs text-red-700">高风险</p>
                  </div>
                </div>
                <div class="w-full bg-red-100 rounded-full h-2">
                  <div 
                    class="bg-red-500 h-2 rounded-full"
                    [style.width]="getPercentage(contentStats.byRisk.high, contentStats.total) + '%'"
                  ></div>
                </div>
                <p class="text-xs text-red-600 mt-1">
                  {{ getPercentage(contentStats.byRisk.high, contentStats.total) }}% 的内容
                </p>
              </div>

              <div class="p-4 bg-amber-50 rounded-xl border border-amber-100">
                <div class="flex items-center gap-3 mb-3">
                  <div class="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <p class="text-2xl font-bold text-amber-600">{{ contentStats.byRisk.medium }}</p>
                    <p class="text-xs text-amber-700">中风险</p>
                  </div>
                </div>
                <div class="w-full bg-amber-100 rounded-full h-2">
                  <div 
                    class="bg-amber-500 h-2 rounded-full"
                    [style.width]="getPercentage(contentStats.byRisk.medium, contentStats.total) + '%'"
                  ></div>
                </div>
                <p class="text-xs text-amber-600 mt-1">
                  {{ getPercentage(contentStats.byRisk.medium, contentStats.total) }}% 的内容
                </p>
              </div>

              <div class="col-span-2 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div class="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <svg class="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p class="text-lg font-bold text-emerald-600">{{ contentStats.byRisk.low }} 条低风险内容</p>
                      <p class="text-sm text-emerald-700">安全合规，可正常发布</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <p class="text-3xl font-bold text-emerald-600">
                      {{ getPercentage(contentStats.byRisk.low, contentStats.total) }}%
                    </p>
                    <p class="text-xs text-emerald-600">占比</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Insights -->
      <div class="card">
        <div class="card-header">
          <h4 class="text-lg font-semibold text-gray-900">合规建议</h4>
        </div>
        <div class="card-body">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="p-4 bg-gradient-to-r from-primary-50 to-transparent rounded-xl border-l-4 border-primary-500">
              <h5 class="font-medium text-gray-900 mb-2">优化规则覆盖</h5>
              <p class="text-sm text-gray-600">当前规则启用率为 {{ getRulePercentage() }}%，建议启用更多规则以提高检测覆盖率。</p>
              <button class="mt-3 text-sm text-primary-600 hover:text-primary-700 inline-flex items-center gap-1">
                查看规则管理 <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <div class="p-4 bg-gradient-to-r from-amber-50 to-transparent rounded-xl border-l-4 border-amber-500" *ngIf="(compliance?.highRiskContents ?? 0) > 0">
              <h5 class="font-medium text-gray-900 mb-2">及时处理高风险</h5>
              <p class="text-sm text-gray-600">当前有 {{ compliance?.highRiskContents }} 条高风险内容待处理，建议优先审核。</p>
              <button class="mt-3 text-sm text-amber-600 hover:text-amber-700 inline-flex items-center gap-1">
                前往人工复审 <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <div class="p-4 bg-gradient-to-r from-emerald-50 to-transparent rounded-xl border-l-4 border-emerald-500">
              <h5 class="font-medium text-gray-900 mb-2">合规表现良好</h5>
              <p class="text-sm text-gray-600">本月合规率达到 {{ compliance?.complianceRate || 0 }}%，超过行业平均水平，继续保持！</p>
              <div class="mt-3 flex items-center gap-2">
                <svg class="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span class="text-sm text-emerald-600">合规状态良好</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ReportsComponent implements OnInit {
  contentStats?: ContentStats;
  compliance?: ComplianceStats;
  dailyStats: DailyStats[] = [];

  constructor(
    private contentService: ContentService,
    private logService: LogService
  ) {}

  ngOnInit(): void {
    this.loadContentStats();
    this.loadCompliance();
    this.loadDailyStats();
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    return `${date.getMonth() + 1}/${date.getDate()} 周${weekdays[date.getDay()]}`;
  }

  getPercentage(value: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  }

  getRulePercentage(): number {
    if (!this.compliance || this.compliance.totalRules === 0) return 0;
    return Math.round((this.compliance.activeRules / this.compliance.totalRules) * 100);
  }

  getMaxDailyCount(): number {
    if (!this.dailyStats.length) return 0;
    return Math.max(...this.dailyStats.map(d => Math.max(d.approved, d.rejected, 1)));
  }

  getTotalApproved(): number {
    return this.dailyStats.reduce((sum, d) => sum + d.approved, 0);
  }

  getTotalRejected(): number {
    return this.dailyStats.reduce((sum, d) => sum + d.rejected, 0);
  }

  private loadContentStats(): void {
    this.contentService.getStats().subscribe({
      next: (response) => {
        if (response.success) {
          this.contentStats = response.data;
        }
      },
      error: (err) => {
        console.error('Failed to load content stats:', err);
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
