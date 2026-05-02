import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { ReceiptRecognitionResult, CategoryOption, ClassificationResult, ExpenseCategory } from '../../../types';
import { CurrencyPipe, DatePipe } from '@angular/common';

@Component({
  selector: 'app-receipt-recognition',
  template: `
    <div class="max-w-4xl mx-auto animate-fade-in">
      <div class="text-center mb-8">
        <h2 class="text-2xl font-bold text-gray-800 mb-2">票据智能识别</h2>
        <p class="text-gray-500">上传票据图片或输入票据内容，系统将自动识别并归类</p>
      </div>
      
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="card">
          <div class="card-header">
            <h3 class="text-lg font-semibold text-gray-800">输入票据信息</h3>
          </div>
          <div class="card-body space-y-6">
            <div>
              <label class="input-label">上传票据图片</label>
              <div 
                class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-all"
                (click)="simulateImageUpload()"
              >
                <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                <p class="text-gray-600 mb-2" *ngIf="!hasUploadedImage">点击上传票据图片</p>
                <p class="text-gray-600 mb-2 text-primary-600 font-medium" *ngIf="hasUploadedImage">
                  已模拟上传图片 ✓
                </p>
                <p class="text-sm text-gray-500">支持 JPG、PNG、PDF 格式</p>
              </div>
            </div>
            
            <div>
              <label class="input-label">或手动输入票据内容</label>
              <textarea 
                [(ngModel)]="receiptText"
                class="input-field h-40 resize-none"
                placeholder="请输入票据上的文字内容，如：
商家名称、开票日期、金额、费用项目等...

示例：
增值税电子普通发票
开票日期: 2024-05-02
销售方: 北京某某科技有限公司
金额: ¥3,500.00
项目: 技术服务费"
              ></textarea>
            </div>
            
            <div class="flex flex-col sm:flex-row gap-3">
              <button 
                class="flex-1 btn btn-primary"
                (click)="recognizeReceipt()"
                [disabled]="recognizing"
              >
                <svg class="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                </svg>
                {{ recognizing ? '识别中...' : '开始智能识别' }}
              </button>
              <button 
                class="btn btn-secondary"
                (click)="useSampleData()"
              >
                使用示例
              </button>
            </div>
          </div>
        </div>
        
        <div class="card">
          <div class="card-header">
            <h3 class="text-lg font-semibold text-gray-800">识别结果</h3>
          </div>
          <div class="card-body">
            <div *ngIf="!recognizedData" class="text-center py-12 text-gray-500">
              <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
              </svg>
              <p>请上传票据或输入内容进行识别</p>
            </div>
            
            <div *ngIf="recognizedData" class="space-y-6">
              <div class="bg-primary-50 rounded-lg p-4">
                <div class="flex items-center gap-2 mb-3">
                  <svg class="w-5 h-5 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span class="font-medium text-gray-800">识别成功</span>
                  <span class="text-sm text-gray-500 ml-auto">
                    置信度: {{ (recognizedData.receiptData.confidence * 100).toFixed(0) }}%
                  </span>
                </div>
              </div>
              
              <div class="space-y-4">
                <div class="flex items-center justify-between py-3 border-b border-gray-100">
                  <span class="text-gray-500">商家名称</span>
                  <span class="font-medium text-gray-800">{{ recognizedData.receiptData.merchantName }}</span>
                </div>
                
                <div class="flex items-center justify-between py-3 border-b border-gray-100">
                  <span class="text-gray-500">开票日期</span>
                  <span class="font-medium text-gray-800">{{ recognizedData.receiptData.date }}</span>
                </div>
                
                <div class="flex items-center justify-between py-3 border-b border-gray-100">
                  <span class="text-gray-500">金额</span>
                  <span class="font-bold text-xl text-primary-600">
                    {{ recognizedData.receiptData.amount | currency:'CNY' }}
                  </span>
                </div>
                
                <div class="flex items-center justify-between py-3 border-b border-gray-100" *ngIf="recognizedData.receiptData.taxNo">
                  <span class="text-gray-500">税号</span>
                  <span class="font-medium text-gray-800 font-mono text-sm">{{ recognizedData.receiptData.taxNo }}</span>
                </div>
                
                <div class="py-3 border-b border-gray-100" *ngIf="recognizedData.receiptData.items && recognizedData.receiptData.items.length > 0">
                  <span class="text-gray-500 block mb-2">费用项目</span>
                  <div class="flex flex-wrap gap-2">
                    <span 
                      *ngFor="let item of recognizedData.receiptData.items"
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                    >
                      {{ item }}
                    </span>
                  </div>
                </div>
                
                <div class="py-3">
                  <span class="text-gray-500 block mb-2">建议费用类别</span>
                  <div class="flex items-center gap-3">
                    <span class="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-primary-100 text-primary-700">
                      {{ recognizedData.suggestedCategory }}
                    </span>
                    <button 
                      class="text-sm text-primary-600 hover:text-primary-700"
                      (click)="showCategorySelect = true"
                    >
                      更改类别
                    </button>
                  </div>
                </div>
              </div>
              
              <div *ngIf="showCategorySelect" class="bg-gray-50 rounded-lg p-4">
                <p class="text-sm text-gray-600 mb-3">选择费用类别</p>
                <div class="grid grid-cols-2 gap-2">
                  <button 
                    *ngFor="let cat of categories"
                    type="button"
                    class="p-2 text-sm rounded-lg border transition-all"
                    [ngClass]="{
                      'border-primary-500 bg-primary-50 text-primary-700': cat.value === selectedCategory,
                      'border-gray-200 hover:border-gray-300 text-gray-700': cat.value !== selectedCategory
                    }"
                    (click)="selectedCategory = cat.value"
                  >
                    {{ cat.label }}
                  </button>
                </div>
                <button 
                  class="mt-4 w-full btn btn-primary text-sm"
                  (click)="confirmCategory()"
                >
                  确认选择
                </button>
              </div>
              
              <div class="pt-4 border-t border-gray-200">
                <button 
                  class="w-full btn btn-primary"
                  (click)="createApplicationFromReceipt()"
                >
                  <svg class="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                  </svg>
                  基于此票据创建费用申请
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="card mt-8">
        <div class="card-header">
          <h3 class="text-lg font-semibold text-gray-800">智能费用归类</h3>
          <p class="text-sm text-gray-500 mt-1">输入费用描述或商家名称，系统将自动归类</p>
        </div>
        <div class="card-body">
          <div class="flex flex-col sm:flex-row gap-4 mb-6">
            <div class="flex-1">
              <label class="input-label">费用描述</label>
              <input 
                type="text" 
                [(ngModel)]="classifyDescription"
                class="input-field"
                placeholder="例如：出差酒店住宿、办公用品采购、客户聚餐等"
              >
            </div>
            <div class="flex-1">
              <label class="input-label">商家名称</label>
              <input 
                type="text" 
                [(ngModel)]="classifyMerchant"
                class="input-field"
                placeholder="例如：某某酒店、某某超市、某某餐厅等"
              >
            </div>
            <div class="flex items-end">
              <button 
                class="btn btn-primary"
                (click)="classifyExpense()"
                [disabled]="classifying"
              >
                {{ classifying ? '归类中...' : '智能归类' }}
              </button>
            </div>
          </div>
          
          <div *ngIf="classificationResult" class="bg-success-50 rounded-lg p-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-500 mb-1">建议归类为</p>
                <span class="inline-flex items-center px-3 py-1.5 rounded-full text-lg font-medium bg-success-100 text-success-700">
                  {{ classificationResult.category }}
                </span>
                <span class="text-sm text-gray-500 ml-3">
                  置信度: {{ (classificationResult.confidence * 100).toFixed(0) }}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ReceiptRecognitionComponent implements OnInit {
  receiptText = '';
  hasUploadedImage = false;
  recognizing = false;
  recognizedData?: ReceiptRecognitionResult;
  
  categories: CategoryOption[] = [];
  showCategorySelect = false;
  selectedCategory?: ExpenseCategory;
  
  classifyDescription = '';
  classifyMerchant = '';
  classifying = false;
  classificationResult?: ClassificationResult;

  constructor(
    private apiService: ApiService,
    private currencyPipe: CurrencyPipe,
    private datePipe: DatePipe
  ) {}

  ngOnInit() {
    this.loadCategories();
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

  simulateImageUpload() {
    this.hasUploadedImage = true;
    this.receiptText = `
      增值税电子普通发票
      发票号码: 202405021234567
      开票日期: 2024-05-02
      
      销售方:
      名称: 上海某某酒店有限公司
      纳税人识别号: 91310101MA00123456
      
      货物或应税劳务、服务名称
      住宿费     ¥2,800.00
      餐饮费     ¥1,200.00
      
      合计金额: ¥4,000.00
      价税合计: 肆仟元整 (¥4,000.00)
    `;
  }

  useSampleData() {
    this.receiptText = `
      增值税电子普通发票
      发票号码: 202405029876543
      开票日期: 2024-05-01
      
      销售方:
      名称: 北京某某办公用品超市
      
      货物或应税劳务、服务名称
      打印纸 A4      ¥150.00
      签字笔         ¥80.00
      文件袋         ¥50.00
      
      合计金额: ¥280.00
    `;
    this.hasUploadedImage = false;
  }

  recognizeReceipt() {
    if (!this.receiptText.trim() && !this.hasUploadedImage) {
      alert('请输入票据内容或上传图片');
      return;
    }
    
    this.recognizing = true;
    
    this.apiService.recognizeReceipt({ 
      text: this.receiptText,
      imageData: this.hasUploadedImage ? 'simulated_image_data' : undefined
    }).subscribe({
      next: (res) => {
        if (res.success) {
          this.recognizedData = res.data;
          this.selectedCategory = res.data.suggestedCategory;
          this.showCategorySelect = false;
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

  confirmCategory() {
    if (this.recognizedData && this.selectedCategory) {
      this.recognizedData = {
        ...this.recognizedData,
        suggestedCategory: this.selectedCategory
      };
      this.showCategorySelect = false;
    }
  }

  classifyExpense() {
    if (!this.classifyDescription.trim() && !this.classifyMerchant.trim()) {
      alert('请输入费用描述或商家名称');
      return;
    }
    
    this.classifying = true;
    
    this.apiService.classifyExpense({
      description: this.classifyDescription || undefined,
      merchantName: this.classifyMerchant || undefined
    }).subscribe({
      next: (res) => {
        if (res.success) {
          this.classificationResult = res.data;
        }
        this.classifying = false;
      },
      error: (err) => {
        console.error('归类失败:', err);
        alert('归类失败，请稍后重试');
        this.classifying = false;
      }
    });
  }

  createApplicationFromReceipt() {
    if (!this.recognizedData) return;
    
    const title = `${this.recognizedData.receiptData.merchantName} - 费用报销`;
    
    const queryParams = new URLSearchParams({
      title,
      amount: this.recognizedData.receiptData.amount.toString(),
      category: this.recognizedData.suggestedCategory,
      merchant: this.recognizedData.receiptData.merchantName,
      date: this.recognizedData.receiptData.date
    });
    
    window.location.href = `/applications/create?${queryParams.toString()}`;
  }
}
