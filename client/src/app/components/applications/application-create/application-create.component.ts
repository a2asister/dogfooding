import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators, FormControl } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { Department, User, CategoryOption, ExpenseCategory, ReceiptRecognitionResult } from '../../../types';
import { CurrencyPipe, DatePipe } from '@angular/common';

@Component({
  selector: 'app-application-create',
  template: `
    <div class="max-w-4xl mx-auto animate-fade-in">
      <div class="flex items-center gap-4 mb-6">
        <button class="btn btn-secondary" (click)="goBack()">
          <svg class="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          返回
        </button>
        <h2 class="text-2xl font-bold text-gray-800">{{ isEdit ? '编辑费用申请' : '新建费用申请' }}</h2>
      </div>
      
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="card mb-6">
          <div class="card-header">
            <h3 class="text-lg font-semibold text-gray-800">基本信息</h3>
          </div>
          <div class="card-body space-y-4">
            <div>
              <label class="input-label">申请标题 <span class="text-danger-500">*</span></label>
              <input 
                type="text" 
                formControlName="title"
                class="input-field"
                placeholder="请输入申请标题"
              >
              <p class="text-danger-500 text-sm mt-1" *ngIf="form.get('title')?.invalid && form.get('title')?.touched">
                请输入申请标题
              </p>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="input-label">申请人</label>
                <select formControlName="applicantId" class="input-field">
                  <option value="">请选择申请人</option>
                  <option *ngFor="let user of users" [value]="user.id">{{ user.name }} ({{ user.departmentName }})</option>
                </select>
              </div>
              <div>
                <label class="input-label">所属部门</label>
                <input 
                  type="text" 
                  class="input-field bg-gray-50"
                  [value]="selectedDepartment?.name || ''"
                  disabled
                >
              </div>
            </div>
            
            <div>
              <label class="input-label">申请说明</label>
              <textarea 
                formControlName="description"
                class="input-field h-24 resize-none"
                placeholder="请输入申请说明（可选）"
              ></textarea>
            </div>
          </div>
        </div>
        
        <div class="card mb-6">
          <div class="card-header flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-800">费用明细</h3>
            <div class="flex items-center gap-3">
              <button 
                type="button"
                class="btn btn-outline text-sm"
                (click)="showReceiptModal = true"
              >
                <svg class="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                </svg>
                智能识别票据
              </button>
              <button 
                type="button"
                class="btn btn-primary text-sm"
                (click)="addItem()"
              >
                <svg class="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                </svg>
                添加费用项
              </button>
            </div>
          </div>
          <div class="card-body">
            <div formArrayName="items">
              <div *ngFor="let itemGroup of items.controls; let i = index" class="border border-gray-200 rounded-lg p-4 mb-4 last:mb-0">
                <div class="flex items-start justify-between mb-4">
                  <h4 class="font-medium text-gray-800">费用项 {{ i + 1 }}</h4>
                  <button 
                    type="button"
                    class="text-danger-500 hover:text-danger-700 text-sm"
                    (click)="removeItem(i)"
                    *ngIf="items.length > 1"
                  >
                    删除
                  </button>
                </div>
                
                <div [formGroupName]="i" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="input-label">费用类别 <span class="text-danger-500">*</span></label>
                    <select formControlName="category" class="input-field">
                      <option value="">请选择类别</option>
                      <option *ngFor="let cat of categories" [value]="cat.value">{{ cat.label }}</option>
                    </select>
                  </div>
                  <div>
                    <label class="input-label">金额 <span class="text-danger-500">*</span></label>
                    <input 
                      type="number" 
                      formControlName="amount"
                      class="input-field"
                      placeholder="请输入金额"
                      min="0"
                      step="0.01"
                    >
                  </div>
                  <div class="md:col-span-2">
                    <label class="input-label">费用描述 <span class="text-danger-500">*</span></label>
                    <input 
                      type="text" 
                      formControlName="description"
                      class="input-field"
                      placeholder="请输入费用描述"
                    >
                  </div>
                </div>
                
                <div class="mt-4 pt-4 border-t border-gray-100">
                  <label class="input-label mb-2">票据信息</label>
                  <div class="flex items-center gap-3">
                    <button 
                      type="button"
                      class="btn btn-secondary text-sm"
                      (click)="openItemReceiptModal(i)"
                    >
                      <svg class="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                      上传/识别票据
                    </button>
                    <span 
                      *ngIf="hasReceiptData(i)"
                      class="status-badge badge-approved"
                    >
                      已上传票据
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div *ngIf="items.length === 0" class="text-center py-8 text-gray-500">
              <p>请添加费用明细</p>
            </div>
            
            <div class="mt-6 pt-6 border-t border-gray-200">
              <div class="flex items-center justify-between">
                <span class="text-lg font-semibold text-gray-800">总金额:</span>
                <span class="text-2xl font-bold text-primary-600">{{ totalAmount | currency:'CNY':'symbol':'1.0-0' }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="flex justify-end gap-3">
          <button type="button" class="btn btn-secondary" (click)="goBack()">
            取消
          </button>
          <button 
            type="button"
            class="btn btn-outline"
            (click)="saveAsDraft()"
            [disabled]="saving"
          >
            {{ saving ? '保存中...' : '保存草稿' }}
          </button>
          <button 
            type="submit"
            class="btn btn-primary"
            [disabled]="form.invalid || saving"
          >
            {{ saving ? '提交中...' : '提交申请' }}
          </button>
        </div>
      </form>
    </div>
    
    <div *ngIf="showReceiptModal" class="modal-overlay" (click)="closeReceiptModal()">
      <div class="modal-content animate-fade-in" (click)="$event.stopPropagation()">
        <div class="card-header flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-800">票据智能识别</h3>
          <button class="p-2 hover:bg-gray-100 rounded-lg" (click)="closeReceiptModal()">
            <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <div class="card-body space-y-4">
          <div class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            <p class="text-gray-600 mb-2">拖拽票据图片到此处，或</p>
            <button type="button" class="btn btn-outline" (click)="simulateUpload()">
              选择图片
            </button>
            <p class="text-sm text-gray-500 mt-2">支持 JPG、PNG、PDF 格式</p>
          </div>
          
          <div>
            <label class="input-label">或手动输入票据内容</label>
            <textarea 
              [(ngModel)]="receiptText"
              class="input-field h-32 resize-none"
              placeholder="请输入票据上的文字内容，如商家名称、金额、日期等..."
            ></textarea>
          </div>
          
          <button 
            type="button"
            class="w-full btn btn-primary"
            (click)="recognizeReceipt()"
            [disabled]="recognizing"
          >
            {{ recognizing ? '识别中...' : '开始识别' }}
          </button>
          
          <div *ngIf="recognizedData" class="bg-primary-50 rounded-lg p-4">
            <h4 class="font-medium text-gray-800 mb-3">识别结果</h4>
            <div class="space-y-2 text-sm">
              <p><span class="text-gray-500">商家名称:</span> {{ recognizedData.receiptData.merchantName }}</p>
              <p><span class="text-gray-500">日期:</span> {{ recognizedData.receiptData.date }}</p>
              <p><span class="text-gray-500">金额:</span> {{ recognizedData.receiptData.amount | currency:'CNY' }}</p>
              <p><span class="text-gray-500">建议类别:</span> {{ recognizedData.suggestedCategory }}</p>
              <p><span class="text-gray-500">置信度:</span> {{ (recognizedData.receiptData.confidence * 100).toFixed(0) }}%</p>
            </div>
            <button 
              type="button"
              class="mt-4 w-full btn btn-success"
              (click)="useRecognizedData()"
            >
              使用此识别结果
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ApplicationCreateComponent implements OnInit {
  form: FormGroup;
  isEdit = false;
  applicationId?: string;
  
  departments: Department[] = [];
  users: User[] = [];
  categories: CategoryOption[] = [];
  
  selectedDepartment?: Department;
  saving = false;
  
  showReceiptModal = false;
  recognizing = false;
  receiptText = '';
  recognizedData?: ReceiptRecognitionResult;
  currentReceiptItemIndex?: number;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private currencyPipe: CurrencyPipe,
    private datePipe: DatePipe
  ) {
    this.form = this.fb.group({
      title: ['', Validators.required],
      applicantId: [''],
      description: [''],
      items: this.fb.array([])
    });
  }

  get items(): FormArray {
    return this.form.get('items') as FormArray;
  }

  get totalAmount(): number {
    return this.items.controls.reduce((sum, control) => {
      return sum + (control.get('amount')?.value || 0);
    }, 0);
  }

  ngOnInit() {
    this.loadDepartments();
    this.loadUsers();
    this.loadCategories();
    
    const id = this.route.snapshot.paramMap.get('id');
    if (id && this.route.snapshot.url.toString().includes('edit')) {
      this.isEdit = true;
      this.applicationId = id;
      this.loadApplication(id);
    } else {
      this.addItem();
    }
    
    this.form.get('applicantId')?.valueChanges.subscribe((id) => {
      if (id) {
        const user = this.users.find(u => u.id === id);
        if (user) {
          this.selectedDepartment = this.departments.find(d => d.id === user.departmentId);
        }
      }
    });
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

  loadUsers() {
    this.apiService.getUsers().subscribe({
      next: (res) => {
        if (res.success) {
          this.users = res.data;
        }
      },
      error: (err) => console.error('加载用户列表失败:', err)
    });
  }

  loadCategories() {
    this.apiService.getCategories().subscribe({
      next: (res) => {
        if (res.success) {
          this.categories = res.data;
        }
      },
      error: (err) => console.error('加载费用类别失败:', err)
    });
  }

  loadApplication(id: string) {
    this.apiService.getApplicationById(id).subscribe({
      next: (res) => {
        if (res.success) {
          const app = res.data;
          this.form.patchValue({
            title: app.title,
            applicantId: app.applicantId,
            description: app.description
          });
          
          const user = this.users.find(u => u.id === app.applicantId);
          if (user) {
            this.selectedDepartment = this.departments.find(d => d.id === user.departmentId);
          }
          
          while (this.items.length > 0) {
            this.items.removeAt(0);
          }
          
          app.items.forEach(item => {
            this.items.push(this.fb.group({
              category: [item.category, Validators.required],
              description: [item.description, Validators.required],
              amount: [item.amount, [Validators.required, Validators.min(0)]],
              receiptImage: [item.receiptImage || ''],
              receiptData: [item.receiptData || null]
            }));
          });
        }
      },
      error: (err) => console.error('加载申请详情失败:', err)
    });
  }

  addItem() {
    this.items.push(this.fb.group({
      category: ['', Validators.required],
      description: ['', Validators.required],
      amount: [0, [Validators.required, Validators.min(0)]],
      receiptImage: [''],
      receiptData: [null]
    }));
  }

  removeItem(index: number) {
    this.items.removeAt(index);
  }

  hasReceiptData(index: number): boolean {
    const item = this.items.at(index);
    return !!(item?.get('receiptData')?.value || item?.get('receiptImage')?.value);
  }

  openItemReceiptModal(index: number) {
    this.currentReceiptItemIndex = index;
    this.showReceiptModal = true;
    this.recognizedData = undefined;
    this.receiptText = '';
  }

  closeReceiptModal() {
    this.showReceiptModal = false;
    this.recognizedData = undefined;
    this.currentReceiptItemIndex = undefined;
  }

  simulateUpload() {
    this.receiptText = `
      增值税电子普通发票
      发票号码: 202405021234567
      开票日期: ${new Date().toISOString().split('T')[0]}
      
      销售方:
      名称: 北京某某科技有限公司
      
      货物或应税劳务、服务名称
      技术服务费     ¥3,500.00
      
      合计金额: ¥3,500.00
    `;
  }

  recognizeReceipt() {
    if (!this.receiptText.trim()) {
      alert('请输入票据内容或上传图片');
      return;
    }
    
    this.recognizing = true;
    this.apiService.recognizeReceipt({ text: this.receiptText }).subscribe({
      next: (res) => {
        if (res.success) {
          this.recognizedData = res.data;
        }
        this.recognizing = false;
      },
      error: (err) => {
        console.error('识别失败:', err);
        alert('识别失败，请稍后重试');
        this.recognizing = false;
      }
    });
  }

  useRecognizedData() {
    if (!this.recognizedData) return;
    
    const data = this.recognizedData;
    const itemGroup = this.fb.group({
      category: [data.suggestedCategory, Validators.required],
      description: [`${data.receiptData.merchantName} - ${data.receiptData.date}`, Validators.required],
      amount: [data.receiptData.amount, [Validators.required, Validators.min(0)]],
      receiptImage: [''],
      receiptData: [data.receiptData]
    });
    
    if (this.currentReceiptItemIndex !== undefined) {
      const existingItem = this.items.at(this.currentReceiptItemIndex);
      if (existingItem) {
        existingItem.patchValue({
          category: data.suggestedCategory,
          description: `${data.receiptData.merchantName} - ${data.receiptData.date}`,
          amount: data.receiptData.amount,
          receiptData: data.receiptData
        });
      }
    } else {
      this.items.push(itemGroup);
    }
    
    this.closeReceiptModal();
  }

  async onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    
    this.saving = true;
    
    try {
      const formValue = this.form.value;
      const applicant = this.users.find(u => u.id === formValue.applicantId);
      
      const applicationData = {
        title: formValue.title,
        applicantId: formValue.applicantId || 'user-002',
        applicantName: applicant?.name || '李四',
        departmentId: this.selectedDepartment?.id || 'dept-001',
        departmentName: this.selectedDepartment?.name || '技术部',
        description: formValue.description || '',
        items: formValue.items
      };
      
      if (this.isEdit && this.applicationId) {
        await this.apiService.updateApplication(this.applicationId, applicationData).toPromise();
        await this.apiService.submitApplication(this.applicationId).toPromise();
      } else {
        const result = await this.apiService.createApplication(applicationData).toPromise();
        if (result?.success) {
          await this.apiService.submitApplication(result.data.id).toPromise();
        }
      }
      
      this.saving = false;
      this.router.navigate(['/applications']);
    } catch (err) {
      console.error('提交失败:', err);
      alert('提交失败: ' + (err as any)?.error?.message || '请稍后重试');
      this.saving = false;
    }
  }

  async saveAsDraft() {
    if (!this.form.get('title')?.value) {
      alert('请输入申请标题');
      return;
    }
    
    this.saving = true;
    
    try {
      const formValue = this.form.value;
      const applicant = this.users.find(u => u.id === formValue.applicantId);
      
      const applicationData = {
        title: formValue.title,
        applicantId: formValue.applicantId || 'user-002',
        applicantName: applicant?.name || '李四',
        departmentId: this.selectedDepartment?.id || 'dept-001',
        departmentName: this.selectedDepartment?.name || '技术部',
        description: formValue.description || '',
        items: formValue.items
      };
      
      if (this.isEdit && this.applicationId) {
        await this.apiService.updateApplication(this.applicationId, applicationData).toPromise();
      } else {
        await this.apiService.createApplication(applicationData).toPromise();
      }
      
      this.saving = false;
      this.router.navigate(['/applications']);
    } catch (err) {
      console.error('保存失败:', err);
      alert('保存失败: ' + (err as any)?.error?.message || '请稍后重试');
      this.saving = false;
    }
  }

  goBack() {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      this.router.navigate(['/applications']);
    }
  }
}
