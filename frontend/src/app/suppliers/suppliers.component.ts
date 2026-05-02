import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Supplier } from '../services/api.service';

@Component({
  selector: 'app-suppliers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <div class="relative">
            <input type="text" placeholder="搜索供应商..." 
                   class="form-input-search w-64"
                   [(ngModel)]="searchTerm" (input)="filterSuppliers()">
            <svg class="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          <select class="form-select w-40" [(ngModel)]="statusFilter" (change)="filterSuppliers()">
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
          新增供应商
        </button>
      </div>

      <div class="card">
        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>供应商名称</th>
                <th>联系人</th>
                <th>联系电话</th>
                <th>服务类型</th>
                <th>状态</th>
                <th>入驻时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              @for (supplier of filteredSuppliers; track supplier.id) {
                <tr>
                  <td>
                    <div class="flex items-center">
                      <div class="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
                        <span class="text-primary-600 font-semibold text-sm">{{ supplier.name.charAt(0) }}</span>
                      </div>
                      <div>
                        <p class="font-medium text-gray-800">{{ supplier.name }}</p>
                        <p class="text-sm text-gray-500">{{ supplier.email }}</p>
                      </div>
                    </div>
                  </td>
                  <td>{{ supplier.contactPerson }}</td>
                  <td>{{ supplier.phone }}</td>
                  <td>{{ supplier.serviceType }}</td>
                  <td>
                    <span class="badge" [ngClass]="'badge-' + supplier.status">
                      {{ supplier.status === 'approved' ? '已通过' : supplier.status === 'pending' ? '待审核' : '已拒绝' }}
                    </span>
                  </td>
                  <td>{{ formatDate(supplier.createdAt) }}</td>
                  <td>
                    <div class="flex items-center space-x-2">
                      <button class="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors" 
                              (click)="editSupplier(supplier)" title="编辑">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                      </button>
                      <button class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                              (click)="confirmDelete(supplier)" title="删除">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
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
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
                    </svg>
                    <p>暂无供应商数据</p>
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
            <h3 class="text-lg font-semibold text-gray-800">
              {{ isEdit ? '编辑供应商' : '新增供应商' }}
            </h3>
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
                <label class="form-label">供应商名称 *</label>
                <input type="text" class="form-input" [(ngModel)]="formData.name" name="name" required>
              </div>
              <div>
                <label class="form-label">联系人 *</label>
                <input type="text" class="form-input" [(ngModel)]="formData.contactPerson" name="contactPerson" required>
              </div>
              <div>
                <label class="form-label">联系电话 *</label>
                <input type="tel" class="form-input" [(ngModel)]="formData.phone" name="phone" required>
              </div>
              <div>
                <label class="form-label">电子邮箱</label>
                <input type="email" class="form-input" [(ngModel)]="formData.email" name="email">
              </div>
              <div>
                <label class="form-label">服务类型 *</label>
                <select class="form-select" [(ngModel)]="formData.serviceType" name="serviceType" required>
                  <option value="">请选择服务类型</option>
                  <option value="软件开发">软件开发</option>
                  <option value="物流运输">物流运输</option>
                  <option value="管理咨询">管理咨询</option>
                  <option value="人力资源">人力资源</option>
                  <option value="市场营销">市场营销</option>
                  <option value="技术支持">技术支持</option>
                  <option value="其他">其他</option>
                </select>
              </div>
              <div>
                <label class="form-label">营业执照号 *</label>
                <input type="text" class="form-input" [(ngModel)]="formData.businessLicense" name="businessLicense" required>
              </div>
            </div>
            <div>
              <label class="form-label">地址</label>
              <input type="text" class="form-input" [(ngModel)]="formData.address" name="address">
            </div>
            <div>
              <label class="form-label">企业简介</label>
              <textarea class="form-textarea" [(ngModel)]="formData.description" name="description"></textarea>
            </div>
            @if (isEdit) {
              <div>
                <label class="form-label">审核状态</label>
                <select class="form-select" [(ngModel)]="formData.status" name="status">
                  <option value="pending">待审核</option>
                  <option value="approved">已通过</option>
                  <option value="rejected">已拒绝</option>
                </select>
              </div>
            }
            <div class="flex items-center justify-end space-x-3 pt-4 border-t border-gray-100">
              <button type="button" class="btn-secondary" (click)="closeModal()">取消</button>
              <button type="submit" class="btn-primary">
                {{ isEdit ? '保存修改' : '提交入驻' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    @if (showDeleteConfirm) {
      <div class="modal-overlay" (click)="cancelDelete()">
        <div class="modal-content max-w-md" (click)="$event.stopPropagation()">
          <div class="card-body text-center">
            <div class="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-800 mb-2">确认删除</h3>
            <p class="text-gray-600 mb-6">
              确定要删除供应商 <strong class="text-gray-800">{{ supplierToDelete?.name }}</strong> 吗？<br>
              此操作不可撤销。
            </p>
            <div class="flex items-center justify-center space-x-3">
              <button class="btn-secondary" (click)="cancelDelete()">取消</button>
              <button class="btn-danger" (click)="deleteSupplier()">确认删除</button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: []
})
export class SuppliersComponent implements OnInit {
  suppliers: Supplier[] = [];
  filteredSuppliers: Supplier[] = [];
  searchTerm: string = '';
  statusFilter: string = '';
  showModal: boolean = false;
  showDeleteConfirm: boolean = false;
  isEdit: boolean = false;
  supplierToDelete: Supplier | null = null;

  formData: Partial<Supplier> = {
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    businessLicense: '',
    serviceType: '',
    description: '',
    status: 'pending'
  };

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadSuppliers();
  }

  loadSuppliers(): void {
    this.apiService.getSuppliers().subscribe(response => {
      if (response.success) {
        this.suppliers = response.data;
        this.filteredSuppliers = [...this.suppliers];
      }
    });
  }

  filterSuppliers(): void {
    this.filteredSuppliers = this.suppliers.filter(supplier => {
      const matchesSearch = !this.searchTerm || 
        supplier.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        supplier.contactPerson.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        supplier.phone.includes(this.searchTerm);
      const matchesStatus = !this.statusFilter || supplier.status === this.statusFilter;
      return matchesSearch && matchesStatus;
    });
  }

  openModal(): void {
    this.isEdit = false;
    this.formData = {
      name: '',
      contactPerson: '',
      phone: '',
      email: '',
      address: '',
      businessLicense: '',
      serviceType: '',
      description: '',
      status: 'pending'
    };
    this.showModal = true;
  }

  editSupplier(supplier: Supplier): void {
    this.isEdit = true;
    this.formData = { ...supplier };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  onSubmit(): void {
    if (!this.formData.name || !this.formData.contactPerson || !this.formData.phone || 
        !this.formData.serviceType || !this.formData.businessLicense) {
      alert('请填写必填字段');
      return;
    }

    if (this.isEdit && this.formData.id) {
      this.apiService.updateSupplier(this.formData.id, this.formData).subscribe(response => {
        if (response.success) {
          this.loadSuppliers();
          this.closeModal();
        }
      });
    } else {
      const newSupplier = this.formData as Omit<Supplier, 'id' | 'createdAt' | 'status'>;
      this.apiService.createSupplier(newSupplier).subscribe(response => {
        if (response.success) {
          this.loadSuppliers();
          this.closeModal();
        }
      });
    }
  }

  confirmDelete(supplier: Supplier): void {
    this.supplierToDelete = supplier;
    this.showDeleteConfirm = true;
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.supplierToDelete = null;
  }

  deleteSupplier(): void {
    if (this.supplierToDelete) {
      this.apiService.deleteSupplier(this.supplierToDelete.id).subscribe(response => {
        if (response.success) {
          this.loadSuppliers();
          this.cancelDelete();
        }
      });
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }
}
