import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RuleService, Rule } from '../../services/rule.service';

@Component({
  selector: 'app-rule-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  template: `
    <div class="space-y-6 animate-fade-in max-w-3xl mx-auto">
      <!-- Header -->
      <div class="flex items-center gap-4">
        <button 
          (click)="goBack()"
          class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h3 class="text-2xl font-bold text-gray-900">{{ isEdit ? '编辑规则' : '新建规则' }}</h3>
          <p class="text-gray-500 mt-1">{{ isEdit ? '修改违规检测规则配置' : '创建新的违规检测规则' }}</p>
        </div>
      </div>

      <!-- Form -->
      <div class="card">
        <form [formGroup]="ruleForm" class="card-body space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                规则名称 <span class="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                formControlName="name"
                class="input-field"
                placeholder="例如：敏感词检测"
                [class.border-red-500]="submitted && ruleForm.get('name')?.invalid"
              />
              <p *ngIf="submitted && ruleForm.get('name')?.invalid" class="text-sm text-red-500 mt-1">
                请输入规则名称
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                分类 <span class="text-red-500">*</span>
              </label>
              <select 
                formControlName="category" 
                class="select-field"
                [class.border-red-500]="submitted && ruleForm.get('category')?.invalid"
              >
                <option value="">请选择分类</option>
                <option *ngFor="let cat of categories" [value]="cat">{{ cat }}</option>
              </select>
              <p *ngIf="submitted && ruleForm.get('category')?.invalid" class="text-sm text-red-500 mt-1">
                请选择分类
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                风险等级 <span class="text-red-500">*</span>
              </label>
              <select 
                formControlName="riskLevel" 
                class="select-field"
                [class.border-red-500]="submitted && ruleForm.get('riskLevel')?.invalid"
              >
                <option value="">请选择风险等级</option>
                <option value="low">低风险</option>
                <option value="medium">中风险</option>
                <option value="high">高风险</option>
              </select>
              <p *ngIf="submitted && ruleForm.get('riskLevel')?.invalid" class="text-sm text-red-500 mt-1">
                请选择风险等级
              </p>
            </div>

            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                规则描述 <span class="text-red-500">*</span>
              </label>
              <textarea 
                formControlName="description"
                class="input-field min-h-[80px] resize-none"
                placeholder="请描述此规则的用途..."
                [class.border-red-500]="submitted && ruleForm.get('description')?.invalid"
              ></textarea>
              <p *ngIf="submitted && ruleForm.get('description')?.invalid" class="text-sm text-red-500 mt-1">
                请输入规则描述
              </p>
            </div>

            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                关键词列表 <span class="text-red-500">*</span></label>
              <p class="text-xs text-gray-500 mb-2">输入关键词后按回车添加，多个关键词用逗号分隔</p>
              
              <div class="flex flex-wrap gap-2 mb-3" *ngIf="keywords.length > 0">
                <span 
                  *ngFor="let keyword of keywords; let i = index"
                  class="inline-flex items-center gap-1 px-3 py-1.5 bg-primary-100 text-primary-700 rounded-lg text-sm"
                >
                  {{ keyword }}
                  <button 
                    type="button"
                    (click)="removeKeyword(i)"
                    class="hover:text-primary-900 transition-colors"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              </div>

              <div class="flex gap-2">
                <input 
                  type="text" 
                  [(ngModel)]="newKeyword"
                  [ngModelOptions]="{ standalone: true }"
                  class="input-field flex-1"
                  placeholder="输入关键词，按回车添加"
                  (keydown.enter)="addKeyword()"
                />
                <button 
                  type="button"
                  (click)="addKeyword()"
                  class="btn-secondary inline-flex items-center gap-2"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                  添加
                </button>
              </div>
              <p 
                *ngIf="submitted && keywords.length === 0" 
                class="text-sm text-red-500 mt-1">
                请至少添加一个关键词
              </p>
            </div>

            <div class="md:col-span-2">
              <div class="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <input 
                  type="checkbox" 
                  id="enabled"
                  formControlName="enabled"
                  class="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                />
                <label for="enabled" class="text-sm font-medium text-gray-700">
                  启用此规则
                </label>
              </div>
              <p class="text-xs text-gray-500 mt-1">启用后，此规则将应用于自动检测内容</p>
            </div>
          </div>
        </form>

        <div class="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
          <button (click)="goBack()" class="btn-secondary">取消</button>
          <button (click)="saveRule()" [disabled]="saving" class="btn-primary inline-flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            {{ saving ? '保存中...' : (isEdit ? '更新规则' : '创建规则') }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class RuleFormComponent implements OnInit {
  isEdit = false;
  ruleId?: string;
  categories: string[] = [];
  saving = false;
  submitted = false;

  ruleForm: FormGroup;
  keywords: string[] = [];
  newKeyword = '';

  constructor(
    private ruleService: RuleService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.ruleForm = this.fb.group({
      name: ['', Validators.required],
      category: ['', Validators.required],
      description: ['', Validators.required],
      riskLevel: ['', Validators.required],
      enabled: [true]
    });
  }

  ngOnInit(): void {
    this.loadCategories();
    
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEdit = true;
      this.ruleId = id;
      this.loadRule(id);
    }
  }

  goBack(): void {
    this.router.navigate(['/rules']);
  }

  addKeyword(): void {
    const keyword = this.newKeyword.trim();
    if (keyword) {
      const keywords = keyword.split(/[,，\s]+/).filter(k => k.trim());
      for (const k of keywords) {
        if (!this.keywords.includes(k)) {
          this.keywords.push(k);
        }
      }
      this.newKeyword = '';
    }
  }

  removeKeyword(index: number): void {
    this.keywords.splice(index, 1);
  }

  saveRule(): void {
    this.submitted = true;
    
    if (this.ruleForm.invalid || this.keywords.length === 0) {
      return;
    }

    this.saving = true;
    const formValue = this.ruleForm.value;
    const data = {
      ...formValue,
      keywords: this.keywords
    };

    if (this.isEdit && this.ruleId) {
      this.ruleService.updateRule(this.ruleId, data).subscribe({
        next: (response) => {
          if (response.success) {
            this.goBack();
          }
          this.saving = false;
        },
        error: (err) => {
          console.error('Failed to update rule:', err);
          this.saving = false;
        }
      });
    } else {
      this.ruleService.createRule(data).subscribe({
        next: (response) => {
          if (response.success) {
            this.goBack();
          }
          this.saving = false;
        },
        error: (err) => {
          console.error('Failed to create rule:', err);
          this.saving = false;
        }
      });
    }
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

  loadRule(id: string): void {
    this.ruleService.getRule(id).subscribe({
      next: (response) => {
        if (response.success) {
          const rule = response.data;
          this.ruleForm.patchValue({
            name: rule.name,
            category: rule.category,
            description: rule.description,
            riskLevel: rule.riskLevel,
            enabled: rule.enabled
          });
          this.keywords = [...rule.keywords];
        }
      },
      error: (err) => {
        console.error('Failed to load rule:', err);
      }
    });
  }
}
