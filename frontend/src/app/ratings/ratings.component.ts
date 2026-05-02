import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Rating, Supplier } from '../services/api.service';

@Component({
  selector: 'app-ratings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <div class="relative">
            <input type="text" placeholder="搜索供应商..." 
                   class="form-input-search w-64"
                   [(ngModel)]="searchTerm" (input)="filterRatings()">
            <svg class="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
        </div>
        <button class="btn-primary flex items-center" (click)="openModal()">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          新增评级
        </button>
      </div>

      <div class="card">
        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>供应商</th>
                <th>评级周期</th>
                <th>服务质量</th>
                <th>及时性</th>
                <th>沟通配合</th>
                <th>成本效益</th>
                <th>综合评分</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              @for (rating of filteredRatings; track rating.id) {
                <tr>
                  <td>
                    <div class="flex items-center">
                      <div class="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
                        <span class="text-primary-600 font-semibold text-sm">{{ rating.supplierName.charAt(0) }}</span>
                      </div>
                      <div>
                        <p class="font-medium text-gray-800">{{ rating.supplierName }}</p>
                        <p class="text-sm text-gray-500">评分人：{{ rating.rater }}</p>
                      </div>
                    </div>
                  </td>
                  <td>{{ rating.ratingPeriod }}</td>
                  <td>
                    <div class="flex items-center">
                      <span class="text-yellow-500">{{ renderStars(rating.serviceQuality) }}</span>
                      <span class="ml-2 text-sm text-gray-600">{{ rating.serviceQuality }}.0</span>
                    </div>
                  </td>
                  <td>
                    <div class="flex items-center">
                      <span class="text-yellow-500">{{ renderStars(rating.timeliness) }}</span>
                      <span class="ml-2 text-sm text-gray-600">{{ rating.timeliness }}.0</span>
                    </div>
                  </td>
                  <td>
                    <div class="flex items-center">
                      <span class="text-yellow-500">{{ renderStars(rating.communication) }}</span>
                      <span class="ml-2 text-sm text-gray-600">{{ rating.communication }}.0</span>
                    </div>
                  </td>
                  <td>
                    <div class="flex items-center">
                      <span class="text-yellow-500">{{ renderStars(rating.costEffectiveness) }}</span>
                      <span class="ml-2 text-sm text-gray-600">{{ rating.costEffectiveness }}.0</span>
                    </div>
                  </td>
                  <td>
                    <div class="flex items-center">
                      <div [ngClass]="{
                        'bg-green-100 text-green-800': rating.overallRating >= 4.5,
                        'bg-blue-100 text-blue-800': rating.overallRating >= 3.5 && rating.overallRating < 4.5,
                        'bg-yellow-100 text-yellow-800': rating.overallRating < 3.5
                      }" class="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold">
                        {{ rating.overallRating.toFixed(1) }}
                      </div>
                    </div>
                  </td>
                  <td>
                    <button class="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors" 
                            (click)="viewDetails(rating)" title="查看详情">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                      </svg>
                    </button>
                  </td>
                </tr>
              }
              @empty {
                <tr>
                  <td colspan="8" class="text-center py-12 text-gray-500">
                    <svg class="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
                    </svg>
                    <p>暂无服务评级数据</p>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>

    @if (showModal) {
      <div class="modal-overlay" (click)="closeModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="card-header flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-800">新增服务评级</h3>
            <button class="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                    (click)="closeModal()">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <form class="card-body space-y-4" (ngSubmit)="onSubmit()">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="form-label">供应商 *</label>
                <select class="form-select" [(ngModel)]="formData.supplierId" name="supplierId" required>
                  <option value="">请选择供应商</option>
                  @for (supplier of approvedSuppliers; track supplier.id) {
                    <option [value]="supplier.id">{{ supplier.name }}</option>
                  }
                </select>
              </div>
              <div>
                <label class="form-label">评级周期 *</label>
                <select class="form-select" [(ngModel)]="formData.ratingPeriod" name="ratingPeriod" required>
                  <option value="">请选择评级周期</option>
                  <option value="2024-Q1">2024年第一季度</option>
                  <option value="2024-Q2">2024年第二季度</option>
                  <option value="2024-Q3">2024年第三季度</option>
                  <option value="2024-Q4">2024年第四季度</option>
                  <option value="2025-Q1">2025年第一季度</option>
                </select>
              </div>
              <div>
                <label class="form-label">评分人 *</label>
                <input type="text" class="form-input" [(ngModel)]="formData.rater" name="rater" required>
              </div>
            </div>

            <div class="space-y-4">
              <div>
                <label class="form-label">服务质量 *</label>
                <div class="flex items-center space-x-2">
                  @for (star of [1,2,3,4,5]; track star) {
                    <button type="button" class="text-3xl transition-colors"
                            [ngClass]="star <= formData.serviceQuality ? 'text-yellow-500' : 'text-gray-300'"
                            (click)="setRating('serviceQuality', star)">
                      ★
                    </button>
                  }
                  <span class="ml-3 text-sm text-gray-600">{{ formData.serviceQuality }}.0</span>
                </div>
              </div>

              <div>
                <label class="form-label">及时性 *</label>
                <div class="flex items-center space-x-2">
                  @for (star of [1,2,3,4,5]; track star) {
                    <button type="button" class="text-3xl transition-colors"
                            [ngClass]="star <= formData.timeliness ? 'text-yellow-500' : 'text-gray-300'"
                            (click)="setRating('timeliness', star)">
                      ★
                    </button>
                  }
                  <span class="ml-3 text-sm text-gray-600">{{ formData.timeliness }}.0</span>
                </div>
              </div>

              <div>
                <label class="form-label">沟通配合 *</label>
                <div class="flex items-center space-x-2">
                  @for (star of [1,2,3,4,5]; track star) {
                    <button type="button" class="text-3xl transition-colors"
                            [ngClass]="star <= formData.communication ? 'text-yellow-500' : 'text-gray-300'"
                            (click)="setRating('communication', star)">
                      ★
                    </button>
                  }
                  <span class="ml-3 text-sm text-gray-600">{{ formData.communication }}.0</span>
                </div>
              </div>

              <div>
                <label class="form-label">成本效益 *</label>
                <div class="flex items-center space-x-2">
                  @for (star of [1,2,3,4,5]; track star) {
                    <button type="button" class="text-3xl transition-colors"
                            [ngClass]="star <= formData.costEffectiveness ? 'text-yellow-500' : 'text-gray-300'"
                            (click)="setRating('costEffectiveness', star)">
                      ★
                    </button>
                  }
                  <span class="ml-3 text-sm text-gray-600">{{ formData.costEffectiveness }}.0</span>
                </div>
              </div>

              <div class="p-4 bg-gray-50 rounded-lg">
                <div class="flex items-center justify-between">
                  <span class="text-gray-600">综合评分</span>
                  <div [ngClass]="{
                    'bg-green-100 text-green-800': overallRating >= 4.5,
                    'bg-blue-100 text-blue-800': overallRating >= 3.5 && overallRating < 4.5,
                    'bg-yellow-100 text-yellow-800': overallRating < 3.5
                  }" class="inline-flex items-center px-4 py-2 rounded-full text-lg font-bold">
                    {{ overallRating.toFixed(1) }}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label class="form-label">评价意见</label>
              <textarea class="form-textarea" [(ngModel)]="formData.comments" name="comments"></textarea>
            </div>

            <div class="flex items-center justify-end space-x-3 pt-4 border-t border-gray-100">
              <button type="button" class="btn-secondary" (click)="closeModal()">取消</button>
              <button type="submit" class="btn-primary">提交评级</button>
            </div>
          </form>
        </div>
      </div>
    }

    @if (showDetailModal) {
      <div class="modal-overlay" (click)="closeDetailModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="card-header flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-800">评级详情</h3>
            <button class="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                    (click)="closeDetailModal()">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          @if (selectedRating) {
            <div class="card-body space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-sm text-gray-500">供应商</p>
                  <p class="font-medium text-gray-800">{{ selectedRating.supplierName }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">评级周期</p>
                  <p class="font-medium text-gray-800">{{ selectedRating.ratingPeriod }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">评分人</p>
                  <p class="font-medium text-gray-800">{{ selectedRating.rater }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">综合评分</p>
                  <div [ngClass]="{
                    'bg-green-100 text-green-800': selectedRating.overallRating >= 4.5,
                    'bg-blue-100 text-blue-800': selectedRating.overallRating >= 3.5 && selectedRating.overallRating < 4.5,
                    'bg-yellow-100 text-yellow-800': selectedRating.overallRating < 3.5
                  }" class="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold">
                    {{ selectedRating.overallRating.toFixed(1) }}
                  </div>
                </div>
              </div>

              <div class="space-y-3 p-4 bg-gray-50 rounded-lg">
                <div class="flex items-center justify-between">
                  <span class="text-gray-600">服务质量</span>
                  <div class="flex items-center">
                    <span class="text-yellow-500">{{ renderStars(selectedRating.serviceQuality) }}</span>
                    <span class="ml-2 text-sm text-gray-600">{{ selectedRating.serviceQuality }}.0</span>
                  </div>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-gray-600">及时性</span>
                  <div class="flex items-center">
                    <span class="text-yellow-500">{{ renderStars(selectedRating.timeliness) }}</span>
                    <span class="ml-2 text-sm text-gray-600">{{ selectedRating.timeliness }}.0</span>
                  </div>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-gray-600">沟通配合</span>
                  <div class="flex items-center">
                    <span class="text-yellow-500">{{ renderStars(selectedRating.communication) }}</span>
                    <span class="ml-2 text-sm text-gray-600">{{ selectedRating.communication }}.0</span>
                  </div>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-gray-600">成本效益</span>
                  <div class="flex items-center">
                    <span class="text-yellow-500">{{ renderStars(selectedRating.costEffectiveness) }}</span>
                    <span class="ml-2 text-sm text-gray-600">{{ selectedRating.costEffectiveness }}.0</span>
                  </div>
                </div>
              </div>

              @if (selectedRating.comments) {
                <div>
                  <p class="text-sm text-gray-500 mb-2">评价意见</p>
                  <div class="p-3 bg-gray-50 rounded-lg">
                    <p class="text-gray-700">{{ selectedRating.comments }}</p>
                  </div>
                </div>
              }

              <div class="flex items-center justify-end pt-4 border-t border-gray-100">
                <button type="button" class="btn-secondary" (click)="closeDetailModal()">关闭</button>
              </div>
            </div>
          }
        </div>
      </div>
    }
  `,
  styles: []
})
export class RatingsComponent implements OnInit {
  ratings: Rating[] = [];
  filteredRatings: Rating[] = [];
  suppliers: Supplier[] = [];
  searchTerm: string = '';
  showModal: boolean = false;
  showDetailModal: boolean = false;
  selectedRating: Rating | null = null;

  formData = {
    supplierId: '',
    supplierName: '',
    ratingPeriod: '',
    serviceQuality: 5,
    timeliness: 5,
    communication: 5,
    costEffectiveness: 5,
    comments: '',
    rater: ''
  };

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.apiService.getRatings().subscribe(response => {
      if (response.success) {
        this.ratings = response.data;
        this.filteredRatings = [...this.ratings];
      }
    });

    this.apiService.getSuppliers().subscribe(response => {
      if (response.success) {
        this.suppliers = response.data;
      }
    });
  }

  get approvedSuppliers(): Supplier[] {
    return this.suppliers.filter(s => s.status === 'approved');
  }

  get overallRating(): number {
    const { serviceQuality, timeliness, communication, costEffectiveness } = this.formData;
    return ((serviceQuality || 0) + (timeliness || 0) + (communication || 0) + (costEffectiveness || 0)) / 4;
  }

  filterRatings(): void {
    if (!this.searchTerm) {
      this.filteredRatings = [...this.ratings];
    } else {
      this.filteredRatings = this.ratings.filter(r => 
        r.supplierName.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
  }

  renderStars(count: number): string {
    return '★'.repeat(count) + '☆'.repeat(5 - count);
  }

  setRating(field: 'serviceQuality' | 'timeliness' | 'communication' | 'costEffectiveness', value: number): void {
    this.formData[field] = value;
  }

  openModal(): void {
    this.formData = {
      supplierId: '',
      supplierName: '',
      ratingPeriod: '',
      serviceQuality: 5,
      timeliness: 5,
      communication: 5,
      costEffectiveness: 5,
      comments: '',
      rater: ''
    };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  onSubmit(): void {
    if (!this.formData.supplierId || !this.formData.ratingPeriod || !this.formData.rater) {
      alert('请填写必填字段');
      return;
    }

    const supplier = this.suppliers.find(s => s.id === this.formData.supplierId);
    if (!supplier) {
      alert('请选择有效的供应商');
      return;
    }

    const newRating: Omit<Rating, 'id' | 'createdAt'> = {
      supplierId: this.formData.supplierId,
      supplierName: supplier.name,
      ratingPeriod: this.formData.ratingPeriod,
      serviceQuality: this.formData.serviceQuality || 5,
      timeliness: this.formData.timeliness || 5,
      communication: this.formData.communication || 5,
      costEffectiveness: this.formData.costEffectiveness || 5,
      overallRating: this.overallRating,
      comments: this.formData.comments || '',
      rater: this.formData.rater
    };

    this.apiService.createRating(newRating).subscribe(response => {
      if (response.success) {
        this.loadData();
        this.closeModal();
      }
    });
  }

  viewDetails(rating: Rating): void {
    this.selectedRating = rating;
    this.showDetailModal = true;
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedRating = null;
  }
}
