import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Qualification, Supplier } from '../services/api.service';

@Component({
  selector: 'app-qualifications',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <select class="form-select w-40" [(ngModel)]="statusFilter" (change)="filterQualifications()">
            <option value="">全部状态</option>
            <option value="pending">待审核</option>
            <option value="approved">已通过</option>
            <option value="rejected">已拒绝</option>
          </select>
        </div>
        <button class="btn-primary flex items-center" (click)="openModal()">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          新增资质
        </button>
      </div>

      <div class="card">
        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>供应商</th>
                <th>资质类型</th>
                <th>证书编号</th>
                <th>发证机构</th>
                <th>有效期</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              @for (qualification of filteredQualifications; track qualification.id) {
                <tr>
                  <td>
                    <div class="flex items-center">
                      <div class="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
                        <span class="text-primary-600 font-semibold text-sm">{{ qualification.supplierName.charAt(0) }}</span>
                      </div>
                      <div>
                        <p class="font-medium text-gray-800">{{ qualification.supplierName }}</p>
                      </div>
                    </div>
                  </td>
                  <td>{{ qualification.qualificationType }}</td>
                  <td>{{ qualification.certificateNumber }}</td>
                  <td>{{ qualification.issuingAuthority }}</td>
                  <td>
                    <div>
                      <p class="text-sm">{{ qualification.issueDate }}</p>
                      <p class="text-xs text-gray-500">至 {{ qualification.expiryDate }}</p>
                    </div>
                  </td>
                  <td>
                    <span class="badge" [ngClass]="'badge-' + qualification.status">
                      {{ qualification.status === 'approved' ? '已通过' : qualification.status === 'pending' ? '待审核' : '已拒绝' }}
                    </span>
                  </td>
                  <td>
                    <div class="flex items-center space-x-2">
                      @if (qualification.status === 'pending') {
                        <button class="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" 
                                (click)="approveQualification(qualification)" title="通过">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                        </button>
                        <button class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                                (click)="rejectQualification(qualification)" title="拒绝">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                          </svg>
                        </button>
                      }
                      <button class="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors" 
                              (click)="viewDetails(qualification)" title="查看详情">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              }
              @empty {
                <tr>
                  <td colspan="7" class="text-center py-12 text-gray-500">
                    <svg class="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
                    </svg>
                    <p>暂无资质审核数据</p>
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
            <h3 class="text-lg font-semibold text-gray-800">新增资质</h3>
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
                  @for (supplier of suppliers; track supplier.id) {
                    <option [value]="supplier.id">{{ supplier.name }}</option>
                  }
                </select>
              </div>
              <div>
                <label class="form-label">资质类型 *</label>
                <input type="text" class="form-input" [(ngModel)]="formData.qualificationType" name="qualificationType" required>
              </div>
              <div>
                <label class="form-label">证书编号 *</label>
                <input type="text" class="form-input" [(ngModel)]="formData.certificateNumber" name="certificateNumber" required>
              </div>
              <div>
                <label class="form-label">发证机构 *</label>
                <input type="text" class="form-input" [(ngModel)]="formData.issuingAuthority" name="issuingAuthority" required>
              </div>
              <div>
                <label class="form-label">发证日期 *</label>
                <input type="date" class="form-input" [(ngModel)]="formData.issueDate" name="issueDate" required>
              </div>
              <div>
                <label class="form-label">有效期至 *</label>
                <input type="date" class="form-input" [(ngModel)]="formData.expiryDate" name="expiryDate" required>
              </div>
            </div>
            <div class="flex items-center justify-end space-x-3 pt-4 border-t border-gray-100">
              <button type="button" class="btn-secondary" (click)="closeModal()">取消</button>
              <button type="submit" class="btn-primary">提交审核</button>
            </div>
          </form>
        </div>
      </div>
    }

    @if (showDetailModal) {
      <div class="modal-overlay" (click)="closeDetailModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="card-header flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-800">资质详情</h3>
            <button class="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                    (click)="closeDetailModal()">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          @if (selectedQualification) {
            <div class="card-body space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-sm text-gray-500">供应商</p>
                  <p class="font-medium text-gray-800">{{ selectedQualification.supplierName }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">资质类型</p>
                  <p class="font-medium text-gray-800">{{ selectedQualification.qualificationType }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">证书编号</p>
                  <p class="font-medium text-gray-800">{{ selectedQualification.certificateNumber }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">发证机构</p>
                  <p class="font-medium text-gray-800">{{ selectedQualification.issuingAuthority }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">发证日期</p>
                  <p class="font-medium text-gray-800">{{ selectedQualification.issueDate }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">有效期至</p>
                  <p class="font-medium text-gray-800">{{ selectedQualification.expiryDate }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">审核状态</p>
                  <span class="badge mt-1" [ngClass]="'badge-' + selectedQualification.status">
                    {{ selectedQualification.status === 'approved' ? '已通过' : selectedQualification.status === 'pending' ? '待审核' : '已拒绝' }}
                  </span>
                </div>
                @if (selectedQualification.reviewer) {
                  <div>
                    <p class="text-sm text-gray-500">审核人</p>
                    <p class="font-medium text-gray-800">{{ selectedQualification.reviewer }}</p>
                  </div>
                }
              </div>
              @if (selectedQualification.comments) {
                <div>
                  <p class="text-sm text-gray-500">审核意见</p>
                  <p class="font-medium text-gray-800">{{ selectedQualification.comments }}</p>
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
export class QualificationsComponent implements OnInit {
  qualifications: Qualification[] = [];
  filteredQualifications: Qualification[] = [];
  suppliers: Supplier[] = [];
  statusFilter: string = '';
  showModal: boolean = false;
  showDetailModal: boolean = false;
  selectedQualification: Qualification | null = null;

  formData: Partial<Qualification> = {
    supplierId: '',
    supplierName: '',
    qualificationType: '',
    certificateNumber: '',
    issueDate: '',
    expiryDate: '',
    issuingAuthority: ''
  };

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.apiService.getQualifications().subscribe(response => {
      if (response.success) {
        this.qualifications = response.data;
        this.filteredQualifications = [...this.qualifications];
      }
    });

    this.apiService.getSuppliers().subscribe(response => {
      if (response.success) {
        this.suppliers = response.data;
      }
    });
  }

  filterQualifications(): void {
    if (!this.statusFilter) {
      this.filteredQualifications = [...this.qualifications];
    } else {
      this.filteredQualifications = this.qualifications.filter(q => q.status === this.statusFilter);
    }
  }

  openModal(): void {
    this.formData = {
      supplierId: '',
      supplierName: '',
      qualificationType: '',
      certificateNumber: '',
      issueDate: '',
      expiryDate: '',
      issuingAuthority: ''
    };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  onSubmit(): void {
    if (!this.formData.supplierId || !this.formData.qualificationType || 
        !this.formData.certificateNumber || !this.formData.issueDate || 
        !this.formData.expiryDate || !this.formData.issuingAuthority) {
      alert('请填写必填字段');
      return;
    }

    const supplier = this.suppliers.find(s => s.id === this.formData.supplierId);
    if (!supplier) {
      alert('请选择有效的供应商');
      return;
    }

    const newQualification: Omit<Qualification, 'id' | 'createdAt' | 'status'> = {
      supplierId: this.formData.supplierId,
      supplierName: supplier.name,
      qualificationType: this.formData.qualificationType,
      certificateNumber: this.formData.certificateNumber,
      issueDate: this.formData.issueDate,
      expiryDate: this.formData.expiryDate,
      issuingAuthority: this.formData.issuingAuthority
    };

    this.apiService.createQualification(newQualification).subscribe(response => {
      if (response.success) {
        this.loadData();
        this.closeModal();
      }
    });
  }

  approveQualification(qualification: Qualification): void {
    this.apiService.updateQualification(qualification.id, {
      status: 'approved',
      reviewer: '当前审核员',
      reviewDate: new Date().toISOString(),
      comments: '资质审核通过'
    }).subscribe(response => {
      if (response.success) {
        this.loadData();
      }
    });
  }

  rejectQualification(qualification: Qualification): void {
    const reason = prompt('请输入拒绝原因：');
    if (reason !== null) {
      this.apiService.updateQualification(qualification.id, {
        status: 'rejected',
        reviewer: '当前审核员',
        reviewDate: new Date().toISOString(),
        comments: reason || '审核不通过'
      }).subscribe(response => {
        if (response.success) {
          this.loadData();
        }
      });
    }
  }

  viewDetails(qualification: Qualification): void {
    this.selectedQualification = qualification;
    this.showDetailModal = true;
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedQualification = null;
  }
}
