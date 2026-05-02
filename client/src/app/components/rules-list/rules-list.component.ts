import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { RuleService, Rule } from '../../services/rule.service';

@Component({
  selector: 'app-rules-list',
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
          <h3 class="text-2xl font-bold text-gray-900">违规规则管理</h3>
          <p class="text-gray-500 mt-1">管理内容审核的违规检测规则</p>
        </div>
        <button 
          (click)="navigateTo('new')"
          class="btn-primary inline-flex items-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          新建规则
        </button>
      </div>

      <!-- Filters -->
      <div class="card">
        <div class="card-body">
          <form [formGroup]="filterForm" class="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  placeholder="搜索规则名称或描述..."
                />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">分类</label>
              <select formControlName="category" class="select-field">
                <option value="">全部分类</option>
                <option *ngFor="let cat of categories" [value]="cat">{{ cat }}</option>
              </select>
            </div>
            <div class="flex items-end gap-3">
              <select formControlName="enabled" class="select-field flex-1">
                <option value="">全部状态</option>
                <option value="true">已启用</option>
                <option value="false">已禁用</option>
              </select>
              <button 
                type="button" 
                (click)="loadRules()"
                class="btn-primary inline-flex items-center gap-2"
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

      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="card p-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-900">{{ rules.length }}</p>
              <p class="text-sm text-gray-500">总规则数</p>
            </div>
          </div>
        </div>
        <div class="card p-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <div>
              <p class="text-2xl font-bold text-emerald-600">{{ activeCount }}</p>
              <p class="text-sm text-gray-500">已启用</p>
            </div>
          </div>
        </div>
        <div class="card p-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7H4m12 0l4 4m-4-4l4-4m0 6H4m12 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-500">{{ rules.length - activeCount }}</p>
              <p class="text-sm text-gray-500">已禁用</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Rules List -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div 
          *ngFor="let rule of rules; trackBy: trackById"
          class="card hover:shadow-md transition-shadow"
        >
          <div class="card-header">
            <div class="flex items-start justify-between">
              <div class="flex items-start gap-3">
                <div 
                  [ngClass]="{
                    'w-10 h-10 rounded-lg flex items-center justify-center': true,
                    'bg-red-100': rule.riskLevel === 'high',
                    'bg-amber-100': rule.riskLevel === 'medium',
                    'bg-emerald-100': rule.riskLevel === 'low'
                  }"
                >
                  <svg 
                    [ngClass]="{
                      'w-5 h-5': true,
                      'text-red-600': rule.riskLevel === 'high',
                      'text-amber-600': rule.riskLevel === 'medium',
                      'text-emerald-600': rule.riskLevel === 'low'
                    }"
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h4 class="font-semibold text-gray-900">{{ rule.name }}</h4>
                  <div class="flex items-center gap-2 mt-1">
                    <span class="inline-flex items-center gap-1 text-xs text-gray-500">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      {{ rule.category }}
                    </span>
                    <span class="text-xs text-gray-400">·</span>
                    <span 
                      [ngClass]="{
                        'badge': true,
                        'badge-success': rule.riskLevel === 'low',
                        'badge-warning': rule.riskLevel === 'medium',
                        'badge-danger': rule.riskLevel === 'high'
                      }"
                    >
                      {{ getRiskLabel(rule.riskLevel) }}
                    </span>
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <button 
                  (click)="toggleRule(rule)"
                  class="p-2 rounded-lg transition-colors"
                  [ngClass]="rule.enabled ? 'hover:bg-emerald-50' : 'hover:bg-gray-100'"
                >
                  <svg *ngIf="rule.enabled" class="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  <svg *ngIf="!rule.enabled" class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7H4m12 0l4 4m-4-4l4-4m0 6H4m12 0l4 4m-4-4l4-4" />
                  </svg>
                </button>
                <button 
                  (click)="navigateTo(rule.id + '/edit')"
                  class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button 
                  (click)="deleteRule(rule)"
                  class="p-2 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          <div class="card-body space-y-4">
            <p class="text-sm text-gray-600">{{ rule.description }}</p>
            
            <div>
              <p class="text-xs font-medium text-gray-500 mb-2">关键词列表 ({{ rule.keywords.length }} 个):</p>
              <div class="flex flex-wrap gap-1.5">
                <span 
                  *ngFor="let keyword of rule.keywords.slice(0, 10)"
                  class="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                >
                  {{ keyword }}
                </span>
                <span 
                  *ngIf="rule.keywords.length > 10"
                  class="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                >
                  +{{ rule.keywords.length - 10 }} 更多
                </span>
              </div>
            </div>

            <div class="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
              <span>创建时间: {{ formatDate(rule.createdAt) }}</span>
              <span>更新时间: {{ formatDate(rule.updatedAt) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="rules.length === 0 && !loading" class="card card-body text-center py-16">
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <h4 class="text-lg font-medium text-gray-900 mb-2">暂无规则</h4>
        <p class="text-gray-500 mb-4">点击下方按钮创建您的第一条违规检测规则</p>
        <button 
          (click)="navigateTo('new')"
          class="btn-primary inline-flex items-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          新建规则
        </button>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="card card-body text-center py-12">
        <p class="text-gray-500">加载中...</p>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div *ngIf="showDeleteModal" class="modal-overlay" (click)="closeDeleteModal()">
      <div class="modal-content animate-fade-in max-w-md" (click)="$event.stopPropagation()">
        <div class="card-body text-center py-8">
          <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <h4 class="text-lg font-semibold text-gray-900 mb-2">确认删除规则</h4>
          <p class="text-gray-500 mb-6">
            您确定要删除规则 "{{ ruleToDelete?.name }}" 吗？<br/>
            此操作无法撤销。
          </p>
          <div class="flex justify-center gap-3">
            <button (click)="closeDeleteModal()" class="btn-secondary">取消</button>
            <button (click)="confirmDelete()" [disabled]="deleting" class="btn-danger">
              {{ deleting ? '删除中...' : '确认删除' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class RulesListComponent implements OnInit {
  rules: Rule[] = [];
  categories: string[] = [];
  loading = false;
  deleting = false;
  showDeleteModal = false;
  ruleToDelete?: Rule;

  filterForm: FormGroup;

  constructor(
    private ruleService: RuleService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      search: [''],
      category: [''],
      enabled: ['']
    });
  }

  ngOnInit(): void {
    this.loadCategories();
    this.loadRules();
  }

  get activeCount(): number {
    return this.rules.filter(r => r.enabled).length;
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
    return date.toLocaleDateString('zh-CN');
  }

  trackById(index: number, item: Rule): string {
    return item.id;
  }

  navigateTo(path: string): void {
    this.router.navigate(['/rules', path]);
  }

  toggleRule(rule: Rule): void {
    this.ruleService.updateRule(rule.id, { enabled: !rule.enabled }).subscribe({
      next: (response) => {
        if (response.success) {
          rule.enabled = response.data.enabled;
        }
      },
      error: (err) => {
        console.error('Failed to toggle rule:', err);
      }
    });
  }

  deleteRule(rule: Rule): void {
    this.ruleToDelete = rule;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.ruleToDelete = undefined;
  }

  confirmDelete(): void {
    if (!this.ruleToDelete) return;
    
    this.deleting = true;
    this.ruleService.deleteRule(this.ruleToDelete.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.rules = this.rules.filter(r => r.id !== this.ruleToDelete?.id);
          this.closeDeleteModal();
        }
        this.deleting = false;
      },
      error: (err) => {
        console.error('Failed to delete rule:', err);
        this.deleting = false;
      }
    });
  }

  loadCategories(): void {
    this.ruleService.getCategories().subscribe({
      next: (response) => {
        if (response.success) {
          this.categories = response.data;
        }
      },
      error: (err) => {
        console.error('Failed to load categories:', err);
      }
    });
  }

  loadRules(): void {
    this.loading = true;
    const params: Record<string, any> = {};
    
    const formValue = this.filterForm.value;
    if (formValue.search) params['search'] = formValue.search;
    if (formValue.category) params['category'] = formValue.category;
    if (formValue.enabled !== '') params['enabled'] = formValue.enabled === 'true';

    this.ruleService.getRules(params).subscribe({
      next: (response) => {
        if (response.success) {
          this.rules = response.data;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load rules:', err);
        this.loading = false;
      }
    });
  }
}
